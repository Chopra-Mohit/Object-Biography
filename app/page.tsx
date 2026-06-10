import Nav from './components/Nav'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Argument from './components/Argument'
import PlatformNow from './components/PlatformNow'
import BarcelonaHighlight from './components/BarcelonaHighlight'
import WhoItsFor from './components/WhoItsFor'
import Footer from './components/Footer'
import MoteAssistant from '@/components/MoteAssistant'

export default function Home() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '60px' }}>
        <Hero />
        <Argument />
        <HowItWorks />
        <PlatformNow />
        <BarcelonaHighlight />
        <WhoItsFor />
      </main>
      <Footer />
      <MoteAssistant context="home" />
    </>
  )
}
