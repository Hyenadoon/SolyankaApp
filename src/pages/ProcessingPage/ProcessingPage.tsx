import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mascot } from '../../components';
import { recognizeFridge } from '../../api/fridge';
import styles from './ProcessingPage.module.css';

export function ProcessingPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function runRecognition() {
      try {
        const result = await recognizeFridge();
        if (cancelled) {
          return;
        }

        navigate('/products', {
          replace: true,
          state: { suggestedIngredients: result.suggested_ingredients },
        });
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Не удалось распознать продукты');
      }
    }

    void runRecognition();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const title = useMemo(() => (error ? 'Ошибка\nраспознавания' : 'Перепись\nпродуктов...'), [error]);

  return (
    <div className={styles.page}>
      <div className={styles.photoPlaceholder}>
        <div className={styles.photoInner}>
          <div className={styles.photoGlow} />
        </div>
      </div>

      <div className={styles.textBlock}>
        <Mascot variant="white" size={115} />
        <h1 className={styles.text}>{title}</h1>
        {error ? <p style={{ color: '#fff', textAlign: 'center' }}>{error}</p> : null}
      </div>
    </div>
  );
}
