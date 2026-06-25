import s from './Tag.module.css'

// Figma: A_Tags — пилюля с опциональной иконкой и текстом.
// variant: default (нейтральный) | success (зелёный).
export default function Tag({ icon, variant = 'default', children }) {
  return (
    <span className={`${s.tag} ${s[variant]}`}>
      {icon}
      <span className={s.label}>{children}</span>
    </span>
  )
}
