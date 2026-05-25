import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Object Biography',
  description: 'AI-powered material biographies for broken domestic objects. Every object has a story — we tell it.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
