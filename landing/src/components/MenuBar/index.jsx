import Logo from '../Logo/index.jsx'
import burger from '../../assets/burger.svg'
import s from './MenuBar.module.css'

// Figma: O_Menu_bar — белая плашка с лого и кнопкой-бургером.
export default function MenuBar({ className = '' }) {
  return (
    <nav className={`${s.bar} ${className}`} aria-label="Меню">
      <div className={s.wrapper}>
        <Logo />
        <button type="button" className={s.burger} aria-label="Открыть меню">
          <img src={burger} alt="" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
