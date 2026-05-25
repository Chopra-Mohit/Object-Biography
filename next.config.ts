import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // @react-pdf/renderer uses native Node.js modules (canvas, fontkit, etc.)
  // that cannot be bundled by webpack. Mark it as external so Next.js
  // lets Node.js resolve it natively instead — otherwise the PDF route
  // silently crashes and serves a text error instead of a PDF.
  serverExternalPackages: ['@react-pdf/renderer'],
}

export default nextConfig
