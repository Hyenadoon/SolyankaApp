import s from './StepCard.module.css'

// «Стеклянная» карточка-шаг в Hero (Figma: Receipt-card в Carousel Container).
// Бейдж-кружок — упрощённый кейс A_Tags; полноценный A_Tags соберём в секции «Библиотека».
export default function StepCard({ number, title }) {
  return (
    <article className={s.card}>
      <span className={s.badge}>{number}</span>
      <p className={s.title}>{title}</p>
    </article>
  )
}
