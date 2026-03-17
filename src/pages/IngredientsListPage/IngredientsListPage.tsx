import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconCheck, IconCoin } from '@tabler/icons-react';
import { Button, Tag, ProgressUnit, Mascot } from '../../components';
import { createCookingSession } from '../../api/cooking';
import { formatAmount, formatRublesFromCents } from '../../lib/format';
import type { MissingIngredient, RecommendedRecipe } from '../../types/api';
import styles from './IngredientsListPage.module.css';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=100&h=100&fit=crop';

interface IngredientsLocationState {
  recipe?: RecommendedRecipe;
}

export function IngredientsListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as IngredientsLocationState | null) ?? null;
  const recipe = state?.recipe;
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!recipe) {
      navigate('/recipes', { replace: true });
    }
  }, [navigate, recipe]);

  const ingredients = recipe?.missing_ingredients ?? [];

  const totalPrice = useMemo(
    () => ingredients.reduce((sum, item) => sum + (item.cheapest_product?.price_cents ?? 0), 0),
    [ingredients],
  );

  const toggleCheck = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const startCooking = async () => {
    if (!recipe) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const session = await createCookingSession(recipe.recipe_id);
      navigate(`/cooking/${session.id}`, {
        state: {
          recipe,
          session,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось начать готовку');
    } finally {
      setLoading(false);
    }
  };

  if (!recipe) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.mascotWrap}>
            <Mascot size={115} />
          </div>
          <div className={styles.headerTags}>
            <Tag icon={<IconCoin size={20} fill="currentColor" stroke={0} />}>{formatRublesFromCents(totalPrice)}</Tag>
            <Tag>{ingredients.length > 0 ? 'докуп' : 'всё есть'}</Tag>
          </div>
          <h2 className={styles.title}>Вот что нужно</h2>
          <p className={styles.subtitle}>Собрал в удобный списочек</p>
        </div>

        {error ? <p style={{ padding: '0 16px', color: '#c53929' }}>{error}</p> : null}

        <div className={styles.list}>
          {ingredients.length === 0 ? <p style={{ padding: '0 16px' }}>Для этого рецепта ничего докупать не нужно. Редкий праздник рациональности.</p> : null}
          {ingredients.map((item: MissingIngredient, i) => (
            <div
              key={item.ingredient_id}
              className={styles.item}
              style={{ animationDelay: `${0.1 + i * 0.06}s` }}
            >
              <div className={styles.itemImage}>
                <img src={PLACEHOLDER_IMG} alt={item.name} />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <div className={styles.itemTags}>
                  <span className={styles.itemWeight}>{formatAmount(item.amount, item.unit)}</span>
                  <span className={styles.itemPrice}>{formatRublesFromCents(item.cheapest_product?.price_cents)}</span>
                </div>
              </div>
              <button
                className={`${styles.checkbox} ${checked.has(item.ingredient_id) ? styles.checkboxChecked : ''}`}
                onClick={() => toggleCheck(item.ingredient_id)}
              >
                {checked.has(item.ingredient_id) && <IconCheck size={20} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.progress}>
          {Array.from({ length: 7 }).map((_, i) => (
            <ProgressUnit key={i} active={i < 6} />
          ))}
        </div>
        <div className={styles.buttons}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <IconArrowLeft size={24} />
          </button>
          <div className={styles.flexButton}>
            <Button size="large" variant="accent" disabled={loading} onClick={() => void startCooking()}>
              {loading ? 'Запускаю...' : 'Начать готовку'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
