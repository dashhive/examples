// "use strict";

// Based on https://gist.github.com/coolaj86/43a2a9d1007b6df2dd63eb9d1a5c1733

import DashPhrase from 'dashphrase'
import DashHd from 'dashhd'
import DashKeys from 'dashkeys'
import DashTx from 'dashtx'

//@ts-ignore
let dashTx = DashTx.create({});

const INSIGHT_BASE_URL = "https://insight.dash.org/insight-api";

let testWalletPhrase =
  "donor actor must frost cotton wave custom sea behave rather second trip";
let walletPhrase = process.env.WALLET_PHRASE || testWalletPhrase;

/**
 * @typedef {DashTx.TxInputRaw & TxInputPart} TxInput
 * @typedef TxInputPart
 * @prop {Number} satoshis
 */

/**
 * @param {String} address - a normal Base58Check-encoded PubKeyHash
 * @param {Number} amount - Dash, in decimal form (not sats)
 * @param {String} memo - the maya command string
 */
export async function transferDash(
  address,
  amount,
  memo = "",
  log = () => {},
) {
  let txInfoSigned

  try {
    txInfoSigned = await createDashTransaction(
      address,
      amount,
      memo,
      log,
    );
    log(`[DEBUG] signed tx info:`);
    log(txInfoSigned);
    log();

    let txHex = txInfoSigned.transaction.toString();
    log(`[DEBUG] raw transaction:`);
    log(txHex);
    log();

    log(`[DEBUG] inspect at https://live.blockcypher.com/dash/decodetx/`);
    log();
  } catch (err) {
    console.warn(err)
  }

  return txInfoSigned;
};

export async function getPrimaryAddr(
  log = () => {},
) {
  // get the private key
  let salt = "";
  let seedBytes = await DashPhrase.toSeed(walletPhrase, salt);
  let walletKey = await DashHd.fromSeed(seedBytes);
  let accountIndex = 0;
  let usage = 0;
  let keyIndex = 0; // security note: reusing hard-coded key index leaks data
  let firstKeyPath = `m/44'/5'/${accountIndex}'/${usage}/${keyIndex}`;
  let addressKey = await DashHd.derivePath(walletKey, firstKeyPath);
  let primaryAddress = await DashHd.toAddr(addressKey.publicKey);
  let primaryPkhBytes = await DashKeys.addrToPkh(primaryAddress);
  let primaryPkh = DashKeys.utils.bytesToHex(primaryPkhBytes);
  log(`[DEBUG] primaryAddress:`, primaryAddress, primaryPkh);

  return {
    addressKey,
    primaryAddress,
    primaryPkhBytes,
    primaryPkh,
  }
}

/**
 * @param {String} address - a normal Base58Check-encoded PubKeyHash
 * @param {Number} amount - Dash, in decimal form (not sats)
 * @param {String} memo - the maya command string
 * @returns {Promise<String>} txHex
 */
export async function createDashTransaction(
  address = '',
  amount = 0,
  memo = '',
  log = () => {},
) {
  let pubKeyHashBytes;
  let pubKeyHash;

  let {
    addressKey,
    primaryAddress,
    primaryPkh,
  } = await getPrimaryAddr(log)

  // encode / decode input arguments to appropriate form for transaction
  if (address) {
    pubKeyHashBytes = await DashKeys.addrToPkh(address);
    pubKeyHash = DashKeys.utils.bytesToHex(pubKeyHashBytes);
  }

  let satoshis
  let memoHex

  try {
    satoshis = DashTx.toSats(amount);
    memoHex = DashTx.utils.strToHex(memo);
    log(`[DEBUG] satoshis:`, satoshis);
  } catch (err) {
    console.warn(err)
  }

  // check the address balance
  let coins = await getUtxos(primaryAddress);
  log(`[DEBUG] coins:`, coins);

  // setup outputs
  /** @type {Array<DashTx.TxOutput>} */
  let outputs = [];
  if (pubKeyHash && satoshis > 0) {
    let recipient = {
      pubKeyHash,
      satoshis,
    };

    outputs.push(recipient);
  }

  if (memo) {
    outputs.push({ memo: memoHex, satoshis: 0 });
  }

  // create the transaction
  let changeOutput = { pubKeyHash: primaryPkh, satoshis: 0 };
  let txInfo

  try {
    txInfo = await DashTx.legacyCreateTx(coins, outputs, changeOutput);
  } catch (err) {
    console.warn(err)
  }

  log(`[DEBUG] transaction:`);
  log(txInfo);
  log();

  let change = txInfo.outputs[txInfo.changeIndex];
  log(`[DEBUG] change:`);
  log(change);
  log();

  // sign the transaction
  let signOpts = {
    getPrivateKey: function (input, i) {
      log("DEBUG input", input);
      return addressKey.privateKey;
    },
  };
  let txInfoSigned
  try {
    txInfoSigned = await dashTx.hashAndSignAll(txInfo, signOpts);
  } catch (err) {
    console.warn(err)
  }
  return txInfoSigned;
};

/**
 * @param {String} address
 * @returns {Promise<Array<TxInput>>}
 */
export async function getUtxos(address) {
  let url = `${INSIGHT_BASE_URL}/addr/${address}/utxo`;
  let resp = await fetch(url);
  let insightUtxos = await readJson(resp, url);

  // convert from Insight form to standard form
  let utxos = [];
  for (let insightUtxo of insightUtxos) {
    let utxo = {
      txId: insightUtxo.txid,
      outputIndex: insightUtxo.vout,
      address: insightUtxo.address,
      script: insightUtxo.scriptPubKey,
      satoshis: insightUtxo.satoshis,
    };
    utxos.push(utxo);
  }

  return utxos;
}

/**
 * @param {Response} resp
 * @param {String} url
 */
async function readJson(resp, url) {
  let text = await resp.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error(`error: could parse ${url}:`);
    console.error(text);
    throw e;
  }
  if (!resp.ok) {
    throw new Error(`bad response: ${text}`);
  }

  return data;
}

/**
 * @param {String} txHex
 */
export async function instantSend(txHex) {
  // Ex:
  //   - https://insight.dash.org/insight-api-dash/tx/sendix
  //   - https://dashsight.dashincubator.dev/insight-api/tx/sendix
  let url = `${INSIGHT_BASE_URL}/tx/sendix`;
  let payload = { rawtx: txHex };
  // doesn't allow newlines
  let body = JSON.stringify(payload);
  let req = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body,
  };
  let resp = await fetch(url, req);
  let data = await readJson(resp, url);

  return data;
}

// async function main() {
//   // example:
//   let args = process.argv.slice(2);
//   let address = args[0] || "XjLxscqf1Z2heBDWXVi2YmACmU53LhtyGA";
//   let amount = parseFloat(args[1]) || 0.001;
//   let memoString = args[2] || "🧧";

//   await transferDash(address, amount, memoString);
// }

// if (require.main === module) {
//   main().catch(function (e) {
//     console.error(e.stack || e);
//     process.exit(1);
//   });
// }