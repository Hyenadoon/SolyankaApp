import Hero from './sections/Hero/index.jsx'
import Library from './sections/Library/index.jsx'
import KingDinner from './sections/KingDinner/index.jsx'
import TgChannel from './sections/TgChannel/index.jsx'
import Footer from './sections/Footer/index.jsx'
import CtaSidebar from './components/CtaSidebar/index.jsx'
import { SERVICE_URL } from './config.js'
import s from './App.module.css'

// Раскладка: лендинг слева, закреплённый CTA-блок справа, футер на всю ширину.
export default function App() {
  return (
    <div className={s.page}>
      <div className={s.layout}>
        <main className={s.main}>
          <Hero />
          <Library />
          <KingDinner />
          <TgChannel />
        </main>
        <div className={s.aside}>
          <CtaSidebar serviceUrl={SERVICE_URL} />
        </div>
      </div>
      <div className={s.footerWrap}>
        <Footer />
      </div>
    </div>
  )
}
