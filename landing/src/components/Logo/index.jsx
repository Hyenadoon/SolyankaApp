import mascot from '../../assets/mascot.svg'
import s from './Logo.module.css'

// Маскот «Солянка» (Figma: Q_Mascot) — штриховой знак, оранжевый.
// Размер задаётся высотой (ширина — по пропорции 89:42).
export default function Logo({ height = 24, className = '', title = 'Солянка' }) {
  return (
    <img
      className={`${s.logo} ${className}`}
      src={mascot}
      style={{ height }}
      role="img"
      aria-label={title}
    />
  )
}
