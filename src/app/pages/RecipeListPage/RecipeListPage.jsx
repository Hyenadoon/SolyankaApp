import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TitleBlock from '../../../components/atoms/TitleBlock/TitleBlock';
import Button from '../../../components/atoms/Button/Button';
import ReceiptCard from '../../../components/molecules/ReceiptCard/ReceiptCard';
import Tag from '../../../components/atoms/Tag/Tag';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import IngredientUnit from '../../../components/atoms/IngredientUnit/IngredientUnit';
import TabSelector from '../../../components/atoms/TabSelector/TabSelector';
import { getRecommendations, getCatalogRecipeById } from '../../../api/recipes';
import { createCookingSession } from '../../../api/cooking';
import { cacheRecipe } from '../../../lib/auth';
import { formatAmount, formatMinutes, getRecipePriceLabel } from '../../../lib/format';
import { IconArrowBack, IconFeed, IconClock } from '../../../icons/index.jsx';
import { getPantryItems } from '../../../api/pantry';
import './RecipeListPage.css';

const TABS = [
  { value: 'gain', label: 'Набираю' },
  { value: 'lose', label: 'Худею' },
  { value: 'survive', label: 'Выжить' },
];

function toCard(recipe) {
  return {
    ...recipe,
    id: recipe.recipe_id,
    title: recipe.name,
    image: recipe.image_url || '/placeholder.png',
    tags: [
      { text: formatMinutes(recipe.cooking_time_minutes) },
      { text: getRecipePriceLabel(recipe) },
    ],
  };
}

function RecipeListPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);

  const [activeTab, setActiveTab] = useState('gain');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pantryItems, setPantryItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const [data, pantry] = await Promise.all([
          getRecommendations(3),
          getPantryItems().catch(() => []),
        ]);

        const merged = [...(data.no_buy || Array()), ...(data.need_buy || Array())].map(toCard);
        merged.forEach(cacheRecipe);

        if (!cancelled) {
          setRecipes(merged);
          setSelectedRecipe(merged[0] || null);
          setPantryItems(Array.isArray(pantry) ? pantry : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить рецепты');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const startCooking = async (recipe) => {
    if (!recipe?.recipe_id) return;

    cacheRecipe(recipe);
    setError('');

    try {
      const session = await createCookingSession(Number(recipe.recipe_id));
      navigate(`/cook/${recipe.recipe_id}`, { state: { recipe, session } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось начать готовку');
    }
  };

  const randomRecipe = useMemo(
    () => recipes[Math.floor(Math.random() * recipes.length)] || null,
    [recipes]
  );

  const grid = (
    <div className="recipe-list__grid">
      {recipes.map((recipe) => (
        <ReceiptCard
          key={recipe.id}
          size="small"
          image={recipe.image}
          title={recipe.title}
          tags={recipe.tags}
          onCook={() => (isDesktop ? setSelectedRecipe(recipe) : startCooking(recipe))}
        />
      ))}
    </div>
  );

  if (!isDesktop) {
    return (
      <div className="recipe-list">
        <div className="recipe-list__fixed-header">
          <TitleBlock
            title="Ужин достойный короля"
            subtitle={loading ? 'Ищу рецепты...' : `Нашел ${recipes.length} рецептов`}
          />
          <TabSelector items={TABS} activeValue={activeTab} onChange={setActiveTab} />
        </div>

        {error ? <p>{error}</p> : null}
        {grid}

        <div className="recipe-list__footer">
          <div className="recipe-list__footer-inner">
            <button
              className="recipe-list__footer-back"
              onClick={() => navigate(-1)}
              type="button"
            >
              <IconArrowBack size={24} />
            </button>

            <Button
              size="large"
              variant="primary"
              iconLeft={<IconFeed size={24} color="#fff" />}
              onClick={() => randomRecipe && startCooking(randomRecipe)}
              state={randomRecipe ? 'enabled' : 'disabled'}
            >
              На рандом
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const catalogRecipe = selectedRecipe
    ? getCatalogRecipeById(selectedRecipe.recipe_id)
    : null;

  const fullIngredients = catalogRecipe?.ingredients || Array();

  const pantryIds = new Set(
    pantryItems
      .map((item) => item?.ingredient_id)
      .filter((id) => id !== undefined && id !== null)
  );

  const selectedRecipeHave = fullIngredients.filter((ingredient) => {
    const id = ingredient?.ingredient_id;
    return id !== undefined && id !== null && pantryIds.has(id);
  });

  const selectedRecipeMissing = fullIngredients.filter((ingredient) => {
    const id = ingredient?.ingredient_id;
    return id !== undefined && id !== null && !pantryIds.has(id);
  });

  const leftPanel = (
    <div className="recipe-list__desktop-left-content">
      <TitleBlock
        title="Ужин достойный короля"
        subtitle={loading ? 'Ищу рецепты...' : `Нашел ${recipes.length} рецептов`}
      />
      {error ? <p>{error}</p> : null}
      {grid}
    </div>
  );

  const rightPanel = selectedRecipe ? (
    <div className="recipe-list__desktop-right">
      <img
        className="recipe-list__desktop-hero-img"
        src={selectedRecipe.image}
        alt={selectedRecipe.title}
      />

      <h2 className="recipe-list__desktop-title">{selectedRecipe.title}</h2>

      <div className="recipe-list__desktop-tags">
        {selectedRecipe.tags.map((t, i) => (
          <Tag key={i} icon={i === 0 ? <IconClock size={16} /> : null}>
            {t.text}
          </Tag>
        ))}
      </div>

      <div className="recipe-list__desktop-section">
        <p className="recipe-list__desktop-section-label">У вас уже есть</p>
        <div className="recipe-list__desktop-ingredients recipe-list__desktop-ingredients--chips">
          {selectedRecipeHave.length ? (
            selectedRecipeHave.map((item) => (
              <IngredientUnit
                key={`have-${item.ingredient_id}`}
                image="/placeholder.png"
                name={item.name}
                weight={formatAmount(item.amount, item.unit)}
                state="have"
              />
            ))
          ) : (
            <p>Пока ничего не совпало.</p>
          )}
        </div>
      </div>

      <div className="recipe-list__desktop-section">
        <p className="recipe-list__desktop-section-label">Нужно докупить</p>
        <div className="recipe-list__desktop-ingredients recipe-list__desktop-ingredients--chips">
          {selectedRecipeMissing.length ? (
            selectedRecipeMissing.map((item) => (
              <IngredientUnit
                key={`miss-${item.ingredient_id}`}
                image="/placeholder.png"
                name={item.name}
                weight={formatAmount(item.amount, item.unit)}
                state="haveNo"
              />
            ))
          ) : (
            <p>Ничего докупать не нужно.</p>
          )}
        </div>
      </div>

      <Button
        size="large"
        variant="primary"
        onClick={() => startCooking(selectedRecipe)}
      >
        Начать готовку
      </Button>
    </div>
  ) : (
    <div className="recipe-list__desktop-right">
      <p>Рецептов нет.</p>
    </div>
  );

  return (
    <DesktopSplitLayout
      leftContent={leftPanel}
      rightContent={rightPanel}
      rightClassName="desktop-split__right--orange"
    />
  );
}

export default RecipeListPage;