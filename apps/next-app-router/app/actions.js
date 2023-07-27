'use server';

import {
  transferDash,
  instantSend,
} from '@dashincubator/maya'

export async function broadcastServerMemo(data) {
  let txLink = ''
  const txHex = data.get('txHex') || '🧧'

  console.log('ACTION === txHex', {
    txHex,
  })

  let confirmation = await instantSend(txHex)

  console.log(
    'ACTION === tx confirmation',
    {
      confirmation,
    },
  )
  txLink = `https://live.blockcypher.com/dash/tx/${confirmation?.txid}/`
  console.log(
    txLink
  )

  return txLink
}

export async function createServerMemo(data, log = () => {}) {
  const addr = data.get('addr') || 'XjLxscqf1Z2heBDWXVi2YmACmU53LhtyGA'
  const amount = data.get('amount') || 0.00001
  const memo = data.get('memo') || '🧧'

  const txInfo = await transferDash(addr, amount, memo)

  console.log('ACTION === createMemo', {
    addr,
    amount,
    memo,
  })

  console.log('ACTION === txInfo', {
    txInfo,
  })
}