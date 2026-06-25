import FeaturedCard from '../../components/FeaturedCard/index.jsx'
import IngredientChip from '../../components/IngredientChip/index.jsx'
import dish1 from '../../assets/king/dish1.png'
import dish2 from '../../assets/king/dish2.png'
import dish3 from '../../assets/king/dish3.png'
import dish4 from '../../assets/king/dish4.png'
import piroshki from '../../assets/king/piroshki.png'
import avatar from '../../assets/king/avatar.png'
import { SERVICE_URL } from '../../config.js'
import s from './KingDinner.module.css'

// Figma: Frame 881233635 (1723:1777) — «Ужин достойный короля».
// Декоративная композиция блюд вокруг центральной карточки рецепта.
export default function KingDinner() {
  return (
    <section className={s.king}>
      <header className={s.head}>
        <h2 className={s.title}>Ужин достойный короля</h2>
        <p className={s.subtitle}>Никогда не отчаивайся</p>
      </header>

      <div className={s.stage}>
        <div className={s.cluster}>
          <img className={`${s.dish} ${s.d1}`} src={dish1} alt="" aria-hidden="true" />
          <img className={`${s.dish} ${s.d2}`} src={dish2} alt="" aria-hidden="true" />

          <FeaturedCard
            className={s.cardSlot}
            time="40 мин"
            price="0 ₽"
            title="Быстрые пирожки с мясом"
            image={piroshki}
            href={SERVICE_URL}
          />

          <img className={`${s.dish} ${s.d3}`} src={dish3} alt="" aria-hidden="true" />
          <img className={`${s.dish} ${s.d4}`} src={dish4} alt="" aria-hidden="true" />
        </div>

        <IngredientChip
          className={s.chipRight}
          avatar={avatar}
          name="Хрен"
          weight="100 г"
          tilt={-10}
        />
        <IngredientChip
          className={s.chipLeft}
          emoji="🧈"
          name="Масло"
          weight="50 г"
          tilt={9}
        />
      </div>
    </section>
  )
}
