import type { Metadata, Viewport } from 'next'
import Footer from './components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Object Biography',
  description: 'AI-powered material biographies for broken domestic objects. Every object has a story — we tell it.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS — loaded globally so map tiles render correctly */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
          crossOrigin="anonymous"
        />
        {/* Keep Leaflet controls behind the fixed navbar (leaflet-top defaults to z-index 1000) */}
        <style>{`.leaflet-top,.leaflet-bottom{z-index:900!important}`}</style>
      </head>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  )
}
