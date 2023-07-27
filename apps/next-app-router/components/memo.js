'use client';

import { useState, useEffect, useRef } from 'react';

import Broadcast from './broadcast';

import {
  transferDash,
} from '@dashincubator/maya'

export default function Memo() {
  const dialogRef = useRef(null);
  const [formData, setFormData] = useState({})
  const [txInfo, setTxInfo] = useState('')
  const [txHex, setTxHex] = useState('')

  useEffect(() => {
    createClientMemo(formData);
  }, [formData])

  async function createClientMemo(data, log = () => {}) {
    const addr = data.addr || 'XjLxscqf1Z2heBDWXVi2YmACmU53LhtyGA'
    const amount = data.amount || 0.00001
    const memo = data.memo || '🧧'
    const tx = await transferDash(addr, amount, memo, log)

    setTxInfo(tx)
    setTxHex(txInfo?.transaction?.toString())

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
    let eventFormData = new FormData(
      event.target,
      event.nativeEvent.submitter,
    )
    let fd = Object.fromEntries(eventFormData?.entries())

    // if (fd?.intent === 'browser') {
      event.preventDefault();
      await createClientMemo(fd, console.log);
      dialogRef.current.showModal()
    // }
  }

  return (
    <>
      <form
        name='memo-form'
        onSubmit={handleSubmit}
        className='w-1/2 mx-auto bg-slate-800 shadow py-5 px-6 text-right'
      >
        <label className='block mb-4 w-full'>
          <span className='block text-sm text-left font-medium text-slate-400 mb-1'>Address</span>
          <input
            name='addr'
            placeholder='Enter a Dash address'
            className={inputStyles}
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
            step={0.00001}
            placeholder='0.000010000'
            className={inputStyles}
            onChange={e => {
              setFormData({
                ...formData,
                amount: e.target.value
              });
            }}
          />
        </label>
        <label className='block mb-4 w-full'>
          <span className='block text-sm text-left font-medium text-slate-400 mb-1'>Send a memo</span>
          <input
            name='memo'
            placeholder='Enter the message to send'
            className={inputStyles}
            onChange={e => {
              setFormData({
                ...formData,
                memo: e.target.value
              });
            }}
          />
        </label>
        <button
          className='bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-md font-semibold text-white'
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
      </form>
      <Broadcast ref={dialogRef} txHex={txHex} />
    </>
  );
}

let inputStyles = 'px-3 py-2 bg-slate-900 border shadow-sm border-gray-700 placeholder-slate-400  disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none'
