'use client';

import { useEffect, forwardRef } from 'react';

import { broadcastServerMemo } from '@/app/actions'

import {
  instantSend,
} from '@dashincubator/maya'

const Broadcast = forwardRef(({ txHex }, ref) => {
  let txLink = ''

  async function handleSubmit(event) {
    let formData = new FormData(
      event.target,
      event.nativeEvent.submitter,
    )
    let fd = Object.fromEntries(formData.entries())

    if (fd.intent === 'browser') {
      event.preventDefault()
      txLink = await broadcastClientMemo(fd)
    } else {
      txLink = await broadcastServerMemo(formData)
    }

    ref.current.close(txLink)
  }

  async function broadcastClientMemo(data) {
    console.log('createMemo', {
      formData: data,
    })

    console.log('ACTION === txHex', {
      txHex: data.txHex,
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

  useEffect(() => {
    ref?.current?.addEventListener(
      'click',
      event => {
        if (event.target === ref.current) {
          // console.log('BACKDROP CLICK')
          ref.current.close('cancel')
        }
      }
    )
  }, [])

  return (
    <dialog
      ref={ref}
      id='broadcast-memo'
      className='w-1/3 mx-auto backdrop:bg-[#456d] text-white'
    >
      <form
        name='broadcast-form'
        method='dialog'
        onSubmit={handleSubmit}
        className='w-full bg-slate-800 shadow py-5 px-6 text-right'
      >
        <label className='block mb-4 w-full'>
          <span className='block text-sm text-left font-medium text-slate-400 mb-1'>Raw Transaction</span>
          <textarea
            name='txHex'
            placeholder='Transaction Hex'
            className={inputStyles}
            value={txHex}
            rows={12}
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
        </p>

        <button
          className='bg-sky-500 hover:bg-sky-700 px-5 py-2 mr-4 text-sm leading-5 rounded-md font-semibold text-white'
          type='submit'
          name='intent'
          value='server'
        >
          Server Broadcast
        </button>
        <button
          className='bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-md font-semibold text-white'
          type='submit'
          name='intent'
          value='browser'
        >
          Browser Broadcast
        </button>
      </form>
    </dialog>
  );
})

let inputStyles = 'px-3 py-2 bg-slate-900 border shadow-sm border-gray-700 placeholder-slate-400 text-white disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none'

export default Broadcast
