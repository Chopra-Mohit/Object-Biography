import Nav from './components/Nav'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import PlatformNow from './components/PlatformNow'
import Footer from './components/Footer'
import MoteAssistant from '@/components/MoteAssistant'

export default function Home() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '60px' }}>
        <Hero />
        <HowItWorks />
        <PlatformNow />
      </main>
      <Footer />
      <MoteAssistant context="home" />
    </>
  )
}
