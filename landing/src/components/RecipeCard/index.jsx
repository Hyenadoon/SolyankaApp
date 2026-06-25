import Tag from '../Tag/index.jsx'
import { ClockIcon } from '../icons/index.jsx'
import s from './RecipeCard.module.css'

// Figma: Receipt-card — карточка рецепта (теги времени/цены + фото + название).
export default function RecipeCard({ time, price, title, image, href }) {
  const content = (
    <>
      <div className={s.media}>
        <div className={s.tags}>
          {time != null && <Tag icon={<ClockIcon size={16} />}>{time}</Tag>}
          {price != null && <Tag>{price}</Tag>}
        </div>
        <div className={s.image}>
          <img src={image} alt={title} loading="lazy" />
        </div>
      </div>
      <p className={s.title}>{title}</p>
    </>
  )

  if (href) {
    return (
      <a
        className={s.card}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Открыть рецепт: ${title}`}
      >
        {content}
      </a>
    )
  }

  return <article className={s.card}>{content}</article>
}
