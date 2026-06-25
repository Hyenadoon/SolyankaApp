import SearchBar from '../../components/SearchBar/index.jsx'
import Tabs from '../../components/Tabs/index.jsx'
import RecipeCard from '../../components/RecipeCard/index.jsx'
import recipeImg from '../../assets/recipe-placeholder.png'
import { SERVICE_URL } from '../../config.js'
import s from './Library.module.css'

// Значения тегов/названий — буквально из Figma (плейсхолдеры дизайна, см. parity-report).
const RECIPES = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  time: 'Body',
  price: '150р',
  title: 'Омлет с клёцками из свинины',
  image: recipeImg,
}))

const TABS = ['до 15 мин', 'до 30 мин', 'до 60 мин']

// Figma: Frame 881233624 (1716:2201) — секция «Библиотека рецептов».
export default function Library() {
  return (
    <section id="library" className={s.library}>
      <header className={s.head}>
        <h2 className={s.title}>Библиотека рецептов</h2>
        <p className={s.subtitle}>
          Помогаем сэкономить время на самом сложном — придумать, что
          приготовить, найти рецепт и собрать корзину
        </p>
      </header>

      <SearchBar />

      <Tabs options={TABS} defaultIndex={0} />

      <div className={s.grid}>
        {RECIPES.map((r) => (
          <RecipeCard
            key={r.id}
            time={r.time}
            price={r.price}
            title={r.title}
            image={r.image}
            href={SERVICE_URL}
          />
        ))}
      </div>
    </section>
  )
}
