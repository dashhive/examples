import {
  transferDash,
  createDashTransaction,
} from '@dashincubator/maya'

import Memo from '@/components/memo'

console.log('dash maya transfer dash', transferDash)

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Memo />
    </main>
  )
}
