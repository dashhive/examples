// import {
//   transferDash,
//   createDashTransaction,
// } from '@dashincubator/memo'

// console.log('dash maya transfer dash', transferDash)

import Memo from '@/components/memo'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between md:p-24">
      <Memo />
    </main>
  )
}
