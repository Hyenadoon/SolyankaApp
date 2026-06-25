import { useState } from 'react'
import s from './Tabs.module.css'

// Figma: M_Tab-selector — сегментный переключатель (variant state=chosed → активный таб).
export default function Tabs({ options, defaultIndex = 0, onChange }) {
  const [active, setActive] = useState(defaultIndex)

  const select = (i) => {
    setActive(i)
    onChange?.(i, options[i])
  }

  return (
    <div className={s.tabs} role="tablist">
      {options.map((label, i) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={active === i}
          className={`${s.tab} ${active === i ? s.active : ''}`}
          onClick={() => select(i)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
