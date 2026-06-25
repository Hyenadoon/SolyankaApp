import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import InputBar from '../../../components/atoms/InputBar/InputBar';
import TabSelector from '../../../components/atoms/TabSelector/TabSelector';
import Button from '../../../components/atoms/Button/Button';
import Tag from '../../../components/atoms/Tag/Tag';
import IngredientUnit from '../../../components/atoms/IngredientUnit/IngredientUnit';
import ReceiptCard from '../../../components/molecules/ReceiptCard/ReceiptCard';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { getAllRecipesCatalog } from '../../../api/recipes';
import { createCookingSession } from '../../../api/cooking';
import { getPantryItems } from '../../../api/pantry';
import { cacheRecipe } from '../../../lib/auth';
import { formatAmount, formatMinutes } from '../../../lib/format';
import { RECIPE_GOAL_DEFAULT, RECIPE_GOAL_TABS, filterRecipesByGoal } from '../../../lib/recipeGoal';
import { IconFilter, IconHeart, IconClock } from '../../../icons/index.jsx';
import './AllRecipesPage.css';

const RECIPE_PLACEHOLDER = '/placeholder.png';
const INGREDIENT_PLACEHOLDER = '/placeholder2.png';

const TIME_TABS = [
  { value: '15', label: 'до 15 мин' },
  { value: '30', label: 'до 30 мин' },
  { value: '60', label: 'до 60 мин' },
  { value: 'all', label: 'всё' },
];

function toCard(recipe) {
  if (!recipe) {
    return null;
  }
  return {
    ...recipe,
    id: recipe.recipe_id,
    title: recipe.name,
    image: recipe.image_url || recipe.image || RECIPE_PLACEHOLDER,
    tags: [
      { text: formatMinutes(recipe.cooking_time_minutes) },
      { text: `${recipe.ingredients?.length || 0} ингр.` },
    ],
  };
}

function getIngredientId(ingredient) {
  return ingredient?.ingredient_id ?? ingredient?.id;
}

function AllRecipesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [search, setSearch] = useState('');
  const [activeTime, setActiveTime] = useState('all');
  const [activeGoal, setActiveGoal] = useState(RECIPE_GOAL_DEFAULT);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [pantryItems, setPantryItems] = useState([]);
  const [isStartingCooking, setIsStartingCooking] = useState(false);

  const recipes = useMemo(() => getAllRecipesCatalog().map(toCard), []);
  const selectedRecipeIdFromRoute = location.state?.selectedRecipeId || searchParams.get('recipe');

  useEffect(() => {
    let cancelled = false;

    getPantryItems()
      .then((items) => {
        if (!cancelled) setPantryItems(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (!cancelled) setPantryItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const baseRecipes = recipes.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
      const matchesTime = activeTime === 'all' || (r.cooking_time_minutes || 0) <= Number(activeTime);
      return matchesSearch && matchesTime;
    });

    return filterRecipesByGoal(baseRecipes, activeGoal, { minResults: 6 });
  }, [recipes, search, activeTime, activeGoal]);

  useEffect(() => {
    if (!recipes.length) return;

    const routeSelectedRecipe = selectedRecipeIdFromRoute
      ? recipes.find((recipe) => String(recipe.id) === String(selectedRecipeIdFromRoute))
      : null;

    if (routeSelectedRecipe) {
      setSelectedRecipe(routeSelectedRecipe);
      return;
    }

    setSelectedRecipe((current) => current || filtered[0] || null);
  }, [recipes, filtered, selectedRecipeIdFromRoute]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedRecipe(null);
      return;
    }

    if (!selectedRecipe || !filtered.some((recipe) => recipe.id === selectedRecipe.id)) {
      setSelectedRecipe(filtered[0]);
    }
  }, [filtered, selectedRecipe]);

  const pantryIds = useMemo(() => new Set(
    pantryItems
      .map((item) => item?.ingredient_id)
      .filter((id) => id !== undefined && id !== null)
  ), [pantryItems]);

  const selectedIngredients = selectedRecipe?.ingredients || [];
  const selectedRecipeHave = selectedIngredients.filter((ingredient) => pantryIds.has(getIngredientId(ingredient)));
  const selectedRecipeMissing = selectedIngredients.filter((ingredient) => !pantryIds.has(getIngredientId(ingredient)));

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('recipe', recipe.id);
      return next;
    }, { replace: true });
  };

  const startCooking = async (recipe) => {
    if (!recipe?.id || isStartingCooking) return;

    cacheRecipe(recipe);
    setIsStartingCooking(true);

    try {
      const session = await createCookingSession(Number(recipe.id));
      navigate(`/cook/${recipe.id}`, { state: { recipe, session } });
    } catch (error) {
      console.error('Не удалось начать готовку:', error);
    } finally {
      setIsStartingCooking(false);
    }
  };

  const renderIngredientChip = (item, state, keyPrefix) => (
    <IngredientUnit
      key={`${keyPrefix}-${getIngredientId(item) || item.name}`}
      image={item.image_url || item.ingredient_image_url || INGREDIENT_PLACEHOLDER}
      name={item.name || item.ingredient_name}
      weight={formatAmount(item.amount, item.unit)}
      state={state}
    />
  );

  const ingredientSections = selectedRecipe ? (
    <>
      <div className="all-recipes__desktop-section">
        <p className="all-recipes__desktop-section-label">У вас уже есть</p>
        <div className="all-recipes__desktop-ingredients all-recipes__desktop-ingredients--chips">
          {selectedRecipeHave.length ? (
            selectedRecipeHave.map((item) => renderIngredientChip(item, 'have', 'have'))
          ) : (
            <p className="all-recipes__desktop-empty">Пока ничего не совпало.</p>
          )}
        </div>
      </div>

      <div className="all-recipes__desktop-section">
        <p className="all-recipes__desktop-section-label">Нужно докупить</p>
        <div className="all-recipes__desktop-ingredients all-recipes__desktop-ingredients--chips">
          {selectedRecipeMissing.length ? (
            selectedRecipeMissing.map((item) => renderIngredientChip(item, 'haveNo', 'miss'))
          ) : (
            <p className="all-recipes__desktop-empty">Ничего докупать не нужно.</p>
          )}
        </div>
      </div>
    </>
  ) : null;

  const grid = (
    <div className="all-recipes__grid">
      {filtered.map((recipe) => (
        <ReceiptCard
          key={recipe.id}
          size="small"
          image={recipe.image}
          title={recipe.title}
          tags={recipe.tags}
          onCardClick={() => handleSelectRecipe(recipe)}
          onCook={() => (isDesktop ? handleSelectRecipe(recipe) : startCooking(recipe))}
        />
      ))}
    </div>
  );

  const mobileSelectedRecipe = !isDesktop && selectedRecipeIdFromRoute && selectedRecipe ? (
    <div className="all-recipes__mobile-selected">
      <img
        className="all-recipes__mobile-selected-img"
        src={selectedRecipe.image}
        alt={selectedRecipe.title}
      />
      <div className="all-recipes__desktop-tags">
        {selectedRecipe.tags.map((t, i) => (
          <Tag key={i} icon={i === 0 ? <IconClock size={16} /> : null}>
            {t.text}
          </Tag>
        ))}
      </div>
      <h2 className="all-recipes__mobile-selected-title">{selectedRecipe.title}</h2>
      {ingredientSections}
      <Button
        size="large"
        variant="primary"
        onClick={() => startCooking(selectedRecipe)}
        state={isStartingCooking ? 'disabled' : 'enabled'}
      >
        Начать готовку
      </Button>
    </div>
  ) : null;

  if (!isDesktop) {
    return (
      <div className="all-recipes">
        <div className="all-recipes__search-row">
          <InputBar
            placeholder="Паста, курица..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="all-recipes__filter-btn" type="button">
            <IconFilter size={24} />
          </button>
        </div>

        <div className="all-recipes__filters">
          <div className="all-recipes__filter-section">
            <p className="all-recipes__filter-label">Время приготовления</p>
            <TabSelector
              items={TIME_TABS}
              activeValue={activeTime}
              onChange={setActiveTime}
            />
          </div>
          <div className="all-recipes__filter-section">
            <p className="all-recipes__filter-label">Цель питания</p>
            <TabSelector
              items={RECIPE_GOAL_TABS}
              activeValue={activeGoal}
              onChange={setActiveGoal}
            />
          </div>
        </div>

        {mobileSelectedRecipe}
        {grid}
      </div>
    );
  }

  const leftPanel = (
    <div className="all-recipes__desktop-left">
      <div className="all-recipes__search-row">
        <InputBar
          placeholder="Паста, курица..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="all-recipes__filter-btn" type="button">
          <IconFilter size={24} />
        </button>
      </div>

      <div className="all-recipes__filters">
        <div className="all-recipes__filter-section">
          <p className="all-recipes__filter-label">Время приготовления</p>
          <TabSelector
            items={TIME_TABS}
            activeValue={activeTime}
            onChange={setActiveTime}
          />
        </div>
        <div className="all-recipes__filter-section">
          <p className="all-recipes__filter-label">Цель питания</p>
          <TabSelector
            items={RECIPE_GOAL_TABS}
            activeValue={activeGoal}
            onChange={setActiveGoal}
          />
        </div>
      </div>

      {grid}
    </div>
  );

  const rightPanel = selectedRecipe ? (
    <div className="all-recipes__desktop-right">
      <img
        className="all-recipes__desktop-hero-img"
        src={selectedRecipe.image}
        alt={selectedRecipe.title}
      />

      <h2 className="all-recipes__desktop-title">{selectedRecipe.title}</h2>

      <div className="all-recipes__desktop-tags">
        {selectedRecipe.tags.map((t, i) => (
          <Tag key={i} icon={i === 0 ? <IconClock size={16} /> : null}>
            {t.text}
          </Tag>
        ))}
      </div>

      {ingredientSections}

      <div className="all-recipes__desktop-actions">
        <button className="all-recipes__desktop-fav" type="button">
          <IconHeart size={24} />
        </button>

        <Button
          size="large"
          variant="primary"
          onClick={() => startCooking(selectedRecipe)}
          state={isStartingCooking ? 'disabled' : 'enabled'}
        >
          Начать готовку
        </Button>
      </div>
    </div>
  ) : (
    <div className="all-recipes__desktop-right">
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

export default AllRecipesPage;
