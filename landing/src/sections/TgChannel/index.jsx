import Button from '../../components/Button/index.jsx'
import { TelegramIcon } from '../../components/icons/index.jsx'
import { TELEGRAM_CHANNEL } from '../../config.js'
import texture from '../../assets/hero-texture.png'
import s from './TgChannel.module.css'

// Маркетинговый блок: приглашение в Telegram-канал (нет в Figma, фирменный стиль).
export default function TgChannel() {
  return (
    <section id="telegram" className={s.tg}>
      <div
        className={s.texture}
        style={{ backgroundImage: `url(${texture})` }}
        aria-hidden="true"
      />
      <div className={s.content}>
        <h2 className={s.title}>Готовим вместе в Telegram</h2>
        <p className={s.text}>
          Рецепты дня, лайфхаки с продуктами и щепотка юмора про еду — всё в нашем канале
        </p>
        <Button variant="light" href={TELEGRAM_CHANNEL} icon={<TelegramIcon size={20} />}>
          Подписаться на канал
        </Button>
      </div>
    </section>
  )
}
