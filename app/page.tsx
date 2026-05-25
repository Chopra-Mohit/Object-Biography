import Nav from './components/Nav'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Argument from './components/Argument'
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
        <WhoItsFor />
      </main>
      <Footer />
      <MoteAssistant context="home" />
    </>
  )
}
