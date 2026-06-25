import s from './IngredientChip.module.css'

// Плавающий чип-ингредиент (Figma: chat-chip). Аватар — картинка или эмодзи.
// tilt — наклон в градусах. className — для абсолютного позиционирования из секции.
export default function IngredientChip({ avatar, emoji, name, weight, tilt = 0, className = '' }) {
  return (
    <div
      className={`${s.chip} ${className}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <span className={`${s.avatar} ${emoji ? s.emoji : ''}`} aria-hidden="true">
        {emoji ? emoji : <img src={avatar} alt="" />}
      </span>
      <span className={s.name}>{name}</span>
      <span className={s.weight}>{weight}</span>
    </div>
  )
}
