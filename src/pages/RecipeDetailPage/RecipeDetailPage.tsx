import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconClock, IconCoin } from '@tabler/icons-react';
import { Button, Tag, ProgressUnit, Mascot } from '../../components';
import { formatMinutes, sumMissingIngredientsCost } from '../../lib/format';
import type { RecommendedRecipe } from '../../types/api';
import styles from './RecipeDetailPage.module.css';

const PLACEHOLDER_FOOD = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

interface RecipeDetailLocationState {
  recipe?: RecommendedRecipe;
}

export function RecipeDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as RecipeDetailLocationState | null) ?? null;
  const recipe = state?.recipe;

  useEffect(() => {
    if (!recipe) {
      navigate('/recipes', { replace: true });
    }
  }, [navigate, recipe]);

  if (!recipe) {
    return null;
  }

  const priceLabel = recipe.missing_ingredients.length > 0 ? sumMissingIngredientsCost(recipe.missing_ingredients) : 'Всё есть';

  return (
    <div className={styles.page}>
      <div className={styles.heroSection}>
        <div className={styles.heroBg}>
          <Mascot variant="white" size={400} />
        </div>
        <div className={styles.dishImage}>
          <img src={recipe.image_url || PLACEHOLDER_FOOD} alt={recipe.name} />
        </div>
      </div>

      <div className={styles.content}>
        <h1 className={styles.dishName}>{recipe.name}</h1>
        <div className={styles.tagsRow}>
          <Tag icon={<IconClock size={20} fill="currentColor" stroke={0} />}>
            {formatMinutes(recipe.cooking_time_minutes)}
          </Tag>
          <Tag icon={<IconCoin size={20} fill="currentColor" stroke={0} />}>
            {priceLabel}
          </Tag>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.progress}>
          {Array.from({ length: 7 }).map((_, i) => (
            <ProgressUnit key={i} active={i < 5} />
          ))}
        </div>
        <div className={styles.buttons}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <IconArrowLeft size={24} />
          </button>
          <div className={styles.flexButton}>
            <Button size="large" variant="primary" onClick={() => navigate('/ingredients', { state: { recipe } })}>
              Ингредиенты
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
