import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import { Button, Slider, ProgressUnit, Mascot } from '../../components';
import styles from './PreferencesPage.module.css';

const PREFERENCE_OPTIONS = [
  'Не ем мясо',
  'Не ем рыбу',
  'Худею',
  'Набираю мышцы',
  'Не ем молочку',
];

export function PreferencesPage() {
  const navigate = useNavigate();
  const [sliderValue, setSliderValue] = useState(40);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const togglePreference = (pref: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pref)) next.delete(pref);
      else next.add(pref);
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.mascotWrap}>
            <Mascot size={115} />
          </div>
          <h2 className={styles.title}>
            Устрою пир{'\n'}из того что есть
          </h2>
          <p className={styles.subtitle}>Настройте вкусовые предпочтения</p>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Сложность приготовления</span>
          <Slider min={0} max={100} value={sliderValue} onChange={setSliderValue} showLabels />
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Предпочтения</span>
          <div className={styles.chips}>
            {PREFERENCE_OPTIONS.map((pref, i) => (
              <button
                key={pref}
                className={`${styles.chip} ${selected.has(pref) ? styles.chipSelected : ''}`}
                onClick={() => togglePreference(pref)}
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.progress}>
          {Array.from({ length: 7 }).map((_, i) => (
            <ProgressUnit key={i} active={i < 2} />
          ))}
        </div>
        <div className={styles.buttons}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <IconArrowLeft size={24} />
          </button>
          <div className={styles.flexButton}>
            <Button size="large" variant="primary" onClick={() => navigate('/processing')}>
              Сделать фото
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
