import { SearchIcon } from '../icons/index.jsx'
import s from './SearchBar.module.css'

// Figma: M_Input-bar — поле поиска с иконкой.
export default function SearchBar({ placeholder = 'Паста, курица...', ...props }) {
  return (
    <label className={s.bar}>
      <span className={s.icon}>
        <SearchIcon size={24} />
      </span>
      <input
        type="search"
        className={s.input}
        placeholder={placeholder}
        aria-label="Поиск рецептов"
        {...props}
      />
    </label>
  )
}
