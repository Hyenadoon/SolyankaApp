import s from './Button.module.css'

// Пилюля-кнопка (Figma: A_Buttons, текстовый вариант).
// variant: primary | dark | light. size: md | sm. Если задан href — рендерится как ссылка.
export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  icon,
  children,
  className = '',
  ...props
}) {
  const cls = `${s.button} ${s[variant]} ${s[size]} ${className}`
  const content = (
    <>
      {icon && <span className={s.icon}>{icon}</span>}
      {children}
    </>
  )

  if (href) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...props}>
      {content}
    </button>
  )
}
