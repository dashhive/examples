'use client';

import { useState, useEffect, useRef } from 'react';

import Broadcast from './broadcast';

import DashTx from 'dashtx'

import {
  transferDash,
  getPrimaryAddr,
  getUtxos,
} from '@dashincubator/memo'

function getTxLink(confirmation) {
  if (!confirmation?.txid) {
    return ''
  }

  return `https://live.blockcypher.com/dash/tx/${confirmation?.txid}/`
}

const initialFormData = {
  memo: '',
  addr: '',
  amount: ''
}

export default function Memo() {
  const dialogRef = useRef(null);
  const [formData, setFormData] = useState(initialFormData)
  const [txBroadcast, setTxBroadcast] = useState({})
  const [txInfo, setTxInfo] = useState('')
  const [txHex, setTxHex] = useState('')
  const [walletAddr, setWalletAddr] = useState('')
  const [walletSum, setWalletSum] = useState(0)

  useEffect(() => {
    async function getWalletBalance() {
      let {
        // addressKey,
        primaryAddress,
        // primaryPkh,
      } = await getPrimaryAddr(console.log)

      setWalletAddr(primaryAddress)

      let coins = await getUtxos(primaryAddress);
      let sum = DashTx.sum(coins)
      let dashSum = DashTx.toDash(Number(sum))

      console.log('wallet coins', coins, sum, dashSum)

      setWalletSum(dashSum)
    }
    getWalletBalance()
  }, [])

  useEffect(() => {
    createClientMemo(formData);
  }, [formData])

  useEffect(() => {
    // getTxLink(txBroadcast);
    console.log('txBroadcast change', txBroadcast)
    setFormData(initialFormData)
  }, [txBroadcast])

  async function createClientMemo(data, log = () => {}) {
    const addr = data.addr // || 'XjLxscqf1Z2heBDWXVi2YmACmU53LhtyGA'
    const amount = data.amount // || 0.00001
    const memo = data.memo // || '🧧'
    let tx

    if ((addr && amount) || memo) {
      tx = await transferDash(addr, amount, memo, console.log)

      setTxInfo(tx)
      setTxHex(txInfo?.transaction?.toString())
    }

    console.log('ACTION === createMemo', {
      addr,
      amount,
      memo,
    })

    console.log('ACTION === txHex', {
      txHex,
    })
    console.log(
      `https://live.blockcypher.com/dash/decodetx/?t=${
        txHex
      }`
    )

    return txHex
  }

  async function handleSubmit(event) {
    event.preventDefault();

    let eventFormData = new FormData(
      event.target,
      event.nativeEvent.submitter,
    )
    let fd = Object.fromEntries(eventFormData?.entries())

    if (fd?.memo) {
      await createClientMemo(fd, console.log);
      dialogRef.current.showModal()
      // if (txBroadcast?.txid) {
      //   setTxBroadcast({})
      // }
    }
  }

  return (
    <>
      <form
        name='memo-form'
        onSubmit={handleSubmit}
        className='flex flex-col w-full min-h-screen md:min-h-full md:w-1/2 mx-auto bg-slate-800 shadow py-5 px-6'
      >
        <div className='flex flex-row justify-between'>
          <h1 className="text-xl pb-4 text-left">
            Broadcast a Memo to the Dash Network
          </h1>
          <h2 className="text-slate-500 font-bold text-right pb-4 text-left">
            <div className="text-xl text-right">Wallet Balance:</div>
            <div className='text-slate-200'>
              {walletSum}
            </div>
            {/* <a
              target='_blank'
              href={`dash:${walletAddr}`}
              className="text-blue-500"
            >{walletAddr}</a> */}
          </h2>
        </div>
        <label className='block mb-4 w-full'>
          <span className='block text-sm text-left font-medium text-slate-400 mb-1'>Memo</span>
          <input
            name='memo'
            placeholder='Enter the message to broadcast'
            className={inputStyles}
            value={formData.memo}
            onChange={e => {
              setFormData({
                ...formData,
                memo: e.target.value
              });
            }}
          />
        </label>
        <details>
          <summary className='cursor-pointer pb-5'>Optional Fields</summary>

          <label className='block mb-4 w-full'>
            <span className='block text-sm text-left font-medium text-slate-400 mb-1'>Address</span>
            <input
              name='addr'
              placeholder='Enter a Dash address'
              className={inputStyles}
              value={formData.addr}
              onChange={e => {
                setFormData({
                  ...formData,
                  addr: e.target.value
                });
              }}
            />
          </label>
          <label className='block mb-4 w-full'>
            <span className='block text-sm text-left font-medium text-slate-400 mb-1'>Amount</span>
            <input
              name='amount'
              type='number'
              step={0.0000001}
              placeholder='0.000010000'
              className={inputStyles}
              value={formData.amount}
              onChange={e => {
                setFormData({
                  ...formData,
                  amount: e.target.value
                });
              }}
            />
          </label>
        </details>

        <button
          className='w-1/3 self-end bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-md font-semibold text-white'
          type='submit'
        >
          Create Transaction
        </button>
        {/* <label className='block mb-4 w-full'>
          <span className='block text-sm text-left font-medium text-slate-400 mb-1'>Raw Transaction</span>
          <textarea
            name='txinfo'
            placeholder='Transaction Info'
            className={inputStyles}
            value={txHex}
            rows={10}
            readOnly
          />
        </label>
        <p className="pb-4">Inspect at <a
            className="text-blue-500"
            target='_blank'
            href={
              `https://live.blockcypher.com/dash/decodetx/?t=${
                txHex
              }`
            }
          >https://live.blockcypher.com/dash/decodetx/</a>
        </p> */}
        <p className="text-center pt-10">
          Send funds to this Dash wallet at
          <br/>
          <a
            target='_blank'
            href={`dash:${walletAddr}`}
            className="text-blue-500"
          >{walletAddr}</a>
        </p>
      </form>
      <div>
        {
        txBroadcast?.txid && <p>
          Memo Broadcasted to Dash Blockchain.<br/>
          Transaction ID: <a target='_blank' href={getTxLink(txBroadcast)} className="text-blue-500">{txBroadcast.txid}</a>
        </p>
        }
      </div>
      <Broadcast ref={dialogRef} txHex={txHex} setTxBroadcast={setTxBroadcast} />
    </>
  );
}

let inputStyles = 'px-3 py-2 bg-slate-900 border shadow-sm border-gray-700 placeholder-slate-400 text-slate-300 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none'
