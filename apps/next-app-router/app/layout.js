import './globals.css'
// import { Inter } from 'next/font/google'

// const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Memo - Next App Router - Dash Incubator',
  description: 'Demonstrating the Dash Incubator Payment Tools',
}

const bodyClass = 'bg-neutral-900'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={bodyClass}>{children}</body>
    </html>
  )
}
