import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ob-bg':             '#1B1B17',
        'ob-fg':             '#EDEAE1',
        'ob-fg-dim':         '#9C9990',
        'ob-fg-faint':       '#5A5750',
        'ob-rule':           '#3A3A34',
        'ob-surface-raised': '#26261F',
        'ob-paper':          '#F8F5EB',
        'ob-paper-dim':      '#E8E4D8',
        'ob-paper-ink':      '#2A2720',
        'ob-paper-body':     '#3D3830',
        'ob-paper-meta':     '#6A655C',
        'ob-paper-label':    '#7A7469',
        'ob-paper-faint':    '#9A9590',
        'ob-paper-rule':     '#C8C3B0',
        'ob-paper-mark':     '#B0AA98',
        'ob-red':            '#C41E1E',
      },
      fontFamily: {
        mono:  ["'Courier New'", 'Courier', 'monospace'],
        serif: ['Georgia', "'Times New Roman'", 'serif'],
      },
      borderRadius: { DEFAULT: '0px', none: '0px' },
      maxWidth: {
        container:        '1080px',
        'container-wide': '1280px',
        'container-narrow':'680px',
        'container-cta':  '600px',
      },
    },
  },
  plugins: [],
}

export default config
