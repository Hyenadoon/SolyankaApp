import s from './IconButton.module.css'

// Figma: A_Buttons (круглая icon-кнопка, напр. фильтр).
export default function IconButton({ icon, label, ...props }) {
  return (
    <button type="button" className={s.button} aria-label={label} {...props}>
      {icon}
    </button>
  )
}
