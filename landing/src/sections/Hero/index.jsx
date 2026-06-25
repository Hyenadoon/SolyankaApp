import MenuBar from '../../components/MenuBar/index.jsx'
import StepCard from '../../components/StepCard/index.jsx'
import camera from '../../assets/camera.svg'
import checkmark from '../../assets/checkmark.svg'
import texture from '../../assets/hero-texture.png'
import s from './Hero.module.css'

const STEPS = [
  { number: '1', title: 'Ты фотографируешь холодильник' },
  { number: '2', title: 'Предлагаем блюда из того, что уже есть' },
  { number: '3', title: 'Шутим в процессе' },
]

// Figma: Frame 881233634 (Hero) + наложенный O_Menu_bar.
export default function Hero() {
  return (
    <section id="how-it-works" className={s.card}>
      <div
        className={s.texture}
        style={{ backgroundImage: `url(${texture})` }}
        aria-hidden="true"
      />
      <img className={s.camera} src={camera} alt="" aria-hidden="true" />
      <img className={s.checkmark} src={checkmark} alt="" aria-hidden="true" />

      <MenuBar className={s.menu} />

      <div className={s.content}>
        <header className={s.titleBlock}>
          <h1 className={s.title}>
            Готовка из того,
            <br />
            что есть
          </h1>
          <p className={s.subtitle}>
            Помогаем сэкономить время на самом сложном — придумать, что
            приготовить, найти рецепт и собрать корзину
          </p>
        </header>

        <div className={s.steps}>
          {STEPS.map((step) => (
            <StepCard key={step.number} number={step.number} title={step.title} />
          ))}
        </div>
      </div>
    </section>
  )
}
