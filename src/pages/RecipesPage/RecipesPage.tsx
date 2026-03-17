import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconClock, IconCoin, IconDice5 } from '@tabler/icons-react';
import { Button, Tag, ProgressUnit, Mascot } from '../../components';
import { getRecommendations } from '../../api/recipes';
import { formatMinutes, sumMissingIngredientsCost } from '../../lib/format';
import type { RecommendedRecipe } from '../../types/api';
import styles from './RecipesPage.module.css';

const PLACEHOLDER_FOOD = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

export function RecipesPage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<RecommendedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadRecipes() {
      setLoading(true);
      setError('');
      try {
        const response = await getRecommendations();
        if (!cancelled) {
          setRecipes([...response.no_buy, ...response.need_buy]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Не удалось получить рецепты');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRecipes();

    return () => {
      cancelled = true;
    };
  }, []);

  const anyRecipe = useMemo(() => recipes[0], [recipes]);

  const openRecipe = (recipe: RecommendedRecipe) => {
    navigate(`/recipe/${recipe.recipe_id}`, { state: { recipe } });
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.mascotWrap}>
            <Mascot size={115} />
          </div>
          <h2 className={styles.title}>Ужин достойный короля</h2>
          <p className={styles.subtitle}>Выберите рецепт для готовки</p>
        </div>

        {error ? <p style={{ padding: '0 16px', color: '#c53929' }}>{error}</p> : null}
        {loading ? <p style={{ padding: '0 16px' }}>Подбираю рецепты...</p> : null}

        <div className={styles.carouselArea}>
          <div className={styles.carousel}>
            {recipes.map((recipe, i) => (
              <div
                key={recipe.recipe_id}
                className={styles.card}
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <div className={styles.cardImageWrap}>
                  <img className={styles.cardImage} src={recipe.image_url || PLACEHOLDER_FOOD} alt={recipe.name} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{recipe.name}</h3>
                  <div className={styles.cardTags}>
                    <Tag icon={<IconClock size={20} fill="currentColor" stroke={0} />}>
                      {formatMinutes(recipe.cooking_time_minutes)}
                    </Tag>
                    <Tag icon={<IconCoin size={20} fill="currentColor" stroke={0} />}>
                      {recipe.missing_ingredients.length > 0 ? sumMissingIngredientsCost(recipe.missing_ingredients) : 'Всё есть'}
                    </Tag>
                  </div>
                </div>
                <div className={styles.cardButton}>
                  <Button size="medium" variant="accent" onClick={() => openRecipe(recipe)}>
                    Выбрать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.progress}>
          {Array.from({ length: 7 }).map((_, i) => (
            <ProgressUnit key={i} active={i < 4} />
          ))}
        </div>
        <div className={styles.buttons}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <IconArrowLeft size={24} />
          </button>
          <div className={styles.flexButton}>
            <Button
              size="large"
              variant="primary"
              iconRight={<IconDice5 size={24} />}
              disabled={!anyRecipe}
              onClick={() => anyRecipe && openRecipe(anyRecipe)}
            >
              Любое
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
