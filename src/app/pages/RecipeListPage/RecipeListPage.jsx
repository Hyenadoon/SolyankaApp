import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TitleBlock from '../../../components/atoms/TitleBlock/TitleBlock';
import Button from '../../../components/atoms/Button/Button';
import ReceiptCard from '../../../components/molecules/ReceiptCard/ReceiptCard';
import Tag from '../../../components/atoms/Tag/Tag';
import Picker from '../../../components/atoms/Picker/Picker';
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

const RECIPE_PLACEHOLDER = '/placeholder.png';
const INGREDIENT_PLACEHOLDER = '/placeholder2.png';

const TIME_TABS = [
  { value: '15', label: 'до 15 мин' },
  { value: '30', label: 'до 30 мин' },
  { value: '60', label: 'до 60 мин' },
];

const RESTRICTIONS = ['Без мяса', 'Без рыбы', 'Без орехов', 'Без молочки', 'Без сахара'];

const RESTRICTION_TERMS = {
  'Без мяса': ['мяс', 'куриц', 'говя', 'свин', 'бекон', 'ветчин', 'индейк', 'колбас', 'фарш', 'chicken', 'beef', 'pork', 'meat', 'bacon', 'ham', 'turkey', 'sausage'],
  'Без рыбы': ['рыб', 'лосос', 'тунец', 'треск', 'семг', 'сёмг', 'кревет', 'морепр', 'fish', 'salmon', 'tuna', 'shrimp', 'seafood'],
  'Без орехов': ['орех', 'арахис', 'миндал', 'фундук', 'кешью', 'фисташ', 'nut', 'peanut', 'almond', 'hazelnut', 'cashew', 'pistachio'],
  'Без молочки': ['молок', 'сыр', 'слив', 'сметан', 'йогурт', 'творог', 'масло слив', 'кефир', 'milk', 'cheese', 'cream', 'yogurt', 'butter', 'curd'],
  'Без сахара': ['сахар', 'мед', 'мёд', 'сироп', 'шоколад', 'варенье', 'джем', 'sugar', 'honey', 'syrup', 'chocolate', 'jam'],
};

function toCard(recipe) {
  return {
    ...recipe,
    id: recipe.recipe_id,
    title: recipe.name,
    image: recipe.image_url || recipe.image || RECIPE_PLACEHOLDER,
    tags: [
      { text: formatMinutes(recipe.cooking_time_minutes) },
      { text: recipe.ready_to_cook ? 'Всё есть' : getRecipePriceLabel(recipe) },
    ],
  };
}

function getRecipeIngredients(recipe) {
  const catalogRecipe = getCatalogRecipeById(recipe.recipe_id);
  const sources = [
    recipe.ingredients,
    catalogRecipe?.ingredients,
    recipe.matched_ingredients,
    recipe.missing_ingredients,
  ];

  return sources
    .flatMap((items) => (Array.isArray(items) ? items : []))
    .filter(Boolean);
}

function recipeHasRestrictedIngredient(recipe, selectedRestrictions) {
  if (!selectedRestrictions.length) return false;

  const ingredientText = getRecipeIngredients(recipe)
    .map((item) => item.name || item.ingredient_name || '')
    .join(' ')
    .toLowerCase();

  if (!ingredientText) return false;

  return selectedRestrictions.some((restriction) => {
    const terms = RESTRICTION_TERMS[restriction] || [];
    return terms.some((term) => ingredientText.includes(term));
  });
}

function RecipeListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);

  const [activeTime, setActiveTime] = useState('60');
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pantryItems, setPantryItems] = useState([]);
  const fromScan = Boolean(location.state?.fromScan);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const [data, pantry] = await Promise.all([
          getRecommendations(fromScan ? 2 : 3),
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
  }, [fromScan]);

  const toggleRestriction = (restriction) => {
    setSelectedRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((item) => item !== restriction)
        : [...prev, restriction]
    );
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesTime = (recipe.cooking_time_minutes || 0) <= Number(activeTime);
      const matchesRestrictions = !recipeHasRestrictedIngredient(recipe, selectedRestrictions);
      return matchesTime && matchesRestrictions;
    });
  }, [recipes, activeTime, selectedRestrictions]);

  useEffect(() => {
    if (!filteredRecipes.length) {
      setSelectedRecipe(null);
      return;
    }

    if (!selectedRecipe || !filteredRecipes.some((recipe) => recipe.id === selectedRecipe.id)) {
      setSelectedRecipe(filteredRecipes[0]);
    }
  }, [filteredRecipes, selectedRecipe]);

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
    () => filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)] || null,
    [filteredRecipes]
  );

  const filters = (
    <div className="recipe-list__filters">
      <div className="recipe-list__filter-section">
        <p className="recipe-list__filter-label">Время приготовления</p>
        <TabSelector items={TIME_TABS} activeValue={activeTime} onChange={setActiveTime} />
      </div>
      <div className="recipe-list__filter-section">
        <p className="recipe-list__filter-label">Ваши ограничения в еде</p>
        <div className="recipe-list__filter-pickers">
          {RESTRICTIONS.map((restriction) => (
            <Picker
              key={restriction}
              selected={selectedRestrictions.includes(restriction)}
              onClick={() => toggleRestriction(restriction)}
            >
              {restriction}
            </Picker>
          ))}
        </div>
      </div>
    </div>
  );

  const grid = (
    <div className="recipe-list__grid">
      {filteredRecipes.map((recipe) => (
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

  const subtitle = loading
    ? 'Ищу рецепты...'
    : fromScan
      ? `Сначала рецепты из найденных продуктов · ${filteredRecipes.length}`
      : `Нашел ${filteredRecipes.length} рецептов`;

  if (!isDesktop) {
    return (
      <div className="recipe-list">
        <div className="recipe-list__header">
          <TitleBlock title="Ужин достойный короля" subtitle={subtitle} />
          {filters}
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

  const selectedRecipeHave = selectedRecipe?.matched_ingredients?.length
    ? selectedRecipe.matched_ingredients
    : fullIngredients.filter((ingredient) => {
      const id = ingredient?.ingredient_id;
      return id !== undefined && id !== null && pantryIds.has(id);
    });

  const selectedRecipeMissing = selectedRecipe?.missing_ingredients?.length || selectedRecipe?.ready_to_cook
    ? (selectedRecipe.missing_ingredients || Array())
    : fullIngredients.filter((ingredient) => {
      const id = ingredient?.ingredient_id;
      return id !== undefined && id !== null && !pantryIds.has(id);
    });

  const leftPanel = (
    <div className="recipe-list__desktop-left-content">
      <TitleBlock title="Ужин достойный короля" subtitle={subtitle} />
      {filters}
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
                image={item.image_url || item.ingredient_image_url || INGREDIENT_PLACEHOLDER}
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
                image={item.image_url || item.ingredient_image_url || INGREDIENT_PLACEHOLDER}
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
