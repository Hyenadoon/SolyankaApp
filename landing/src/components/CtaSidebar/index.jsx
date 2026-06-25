import Logo from '../Logo/index.jsx'
import Button from '../Button/index.jsx'
import s from './CtaSidebar.module.css'

// Figma: правый сайдбар Frame 881233624 (1716:2264) — закреплённый CTA-блок.
// `serviceUrl` — ссылка на сам сервис.
export default function CtaSidebar({ serviceUrl = '#' }) {
  return (
    <aside className={s.sidebar}>
      <div className={s.head}>
        <Logo height={40} />
        <div className={s.titleBlock}>
          <h2 className={s.title}>
            Войдите
            <br />в Солянку
          </h2>
          <p className={s.subtitle}>Чтобы открыть больше возможностей</p>
        </div>
      </div>

      <Button variant="dark" href={serviceUrl}>
        Открыть сервис
      </Button>
    </aside>
  )
}
