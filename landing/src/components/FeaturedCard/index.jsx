import Tag from '../Tag/index.jsx'
import Button from '../Button/index.jsx'
import { ClockIcon } from '../icons/index.jsx'
import s from './FeaturedCard.module.css'

// Карточка-герой рецепта (Figma: Recipe Card в «Ужин достойный короля»):
// теги времени/цены + фото + название + CTA «Готовить».
export default function FeaturedCard({
  time,
  price,
  title,
  image,
  cta = 'Готовить',
  onCook,
  href,
  className = '',
}) {
  return (
    <article className={`${s.card} ${className}`}>
      <div className={s.tags}>
        <Tag icon={<ClockIcon size={14} />}>{time}</Tag>
        <Tag variant="success" icon={<ClockIcon size={14} />}>{price}</Tag>
      </div>
      <div className={s.image}>
        <img src={image} alt={title} loading="lazy" />
      </div>
      <p className={s.title}>{title}</p>
      <Button variant="primary" size="sm" className={s.cook} href={href} onClick={onCook}>
        {cta}
      </Button>
    </article>
  )
}
