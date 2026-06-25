import Logo from '../../components/Logo/index.jsx'
import { TelegramIcon } from '../../components/icons/index.jsx'
import { SERVICE_URL, TELEGRAM_CHANNEL, SUPPORT_URL } from '../../config.js'
import s from './Footer.module.css'

// Футер (нет в Figma — собран в фирменном стиле).
export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.top}>
        <div className={s.brand}>
          <div className={s.brandRow}>
            <Logo height={32} />
            <span className={s.name}>Солянка</span>
          </div>
          <p className={s.tagline}>Готовка из того, что есть</p>
        </div>

        <nav className={s.cols} aria-label="Подвал">
          <div className={s.col}>
            <h3 className={s.colTitle}>Сервис</h3>
            <a className={s.link} href={SERVICE_URL} target="_blank" rel="noopener noreferrer">
              Открыть сервис
            </a>
            <a className={s.link} href="#library">Библиотека рецептов</a>
            <a className={s.link} href="#how-it-works">Как это работает</a>
          </div>
          <div className={s.col}>
            <h3 className={s.colTitle}>Сообщество</h3>
            <a className={s.link} href={TELEGRAM_CHANNEL} target="_blank" rel="noopener noreferrer">
              Telegram-канал
            </a>
            <a className={s.link} href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
              Поддержка
            </a>
          </div>
        </nav>
      </div>

      <div className={s.bottom}>
        <span className={s.copy}>© 2026 Солянка. Сделано с любовью к еде.</span>
        <a
          className={s.social}
          href={TELEGRAM_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram-канал"
        >
          <TelegramIcon size={20} />
        </a>
      </div>
    </footer>
  )
}
