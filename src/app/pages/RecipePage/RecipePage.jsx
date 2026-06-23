import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Tag from '../../../components/atoms/Tag/Tag';
import Button from '../../../components/atoms/Button/Button';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { getCachedRecipe, cacheRecipe } from '../../../lib/auth';
import { formatAmount, formatMinutes, getRecipePriceLabel } from '../../../lib/format';
import { getCatalogRecipeById } from '../../../api/recipes';
import { getPantryItems } from '../../../api/pantry';
import { IconArrowBack, IconClock } from '../../../icons/index.jsx';
import './RecipePage.css';

function RecipePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [pantryIds, setPantryIds] = useState(new Set());
  const [checkedItems, setCheckedItems] = useState({});

  const baseRecipe = location.state?.recipe || getCachedRecipe(id) || getCatalogRecipeById(id);

  useEffect(() => {
    let cancelled = false;
    getPantryItems()
      .then((items) => {
        if (!cancelled) {
          setPantryIds(new Set(items.map((item) => item.ingredient_id)));
        }
      })
      .catch(() => {
        if (!cancelled) setPantryIds(new Set());
      });
    return () => { cancelled = true; };
  }, []);

  const recipe = useMemo(() => {
    if (!baseRecipe) {
    return null;
  }

    if ((baseRecipe.missing_ingredients || Array()).length || !baseRecipe.ingredients?.length) {
      return baseRecipe;
    }

    return {
      ...baseRecipe,
      missing_ingredients: baseRecipe.ingredients.filter((ingredient) => !pantryIds.has(ingredient.ingredient_id)),
    };
  }, [baseRecipe, pantryIds]);

  useEffect(() => {
    if (!recipe?.missing_ingredients?.length) {
      setCheckedItems({});
      return;
    }

    setCheckedItems((prev) => {
      const next = {};
      recipe.missing_ingredients.forEach((item) => {
        next[item.ingredient_id] = Boolean(prev[item.ingredient_id]);
      });
      return next;
    });
  }, [recipe]);

  if (!recipe) {
    return <Navigate to="/recipes" replace />;
  }

  cacheRecipe(recipe);

  const missingIngredients = recipe.missing_ingredients || Array();
  const allPurchased = missingIngredients.every((item) => checkedItems[item.ingredient_id]);
  const canCook = !missingIngredients.length || allPurchased;

  const toggleIngredient = (ingredientId) => {
    setCheckedItems((prev) => ({ ...prev, [ingredientId]: !prev[ingredientId] }));
  };

  const ingredientsList = (
    <div className="recipe-page__shopping-list">
      {missingIngredients.length ? (
        missingIngredients.map((ing) => (
          <label key={ing.ingredient_id} className={`recipe-page__shopping-item${checkedItems[ing.ingredient_id] ? ' recipe-page__shopping-item--checked' : ''}`}>
            <input
              className="recipe-page__shopping-checkbox"
              type="checkbox"
              checked={Boolean(checkedItems[ing.ingredient_id])}
              onChange={() => toggleIngredient(ing.ingredient_id)}
            />
            <span className="recipe-page__shopping-copy">
              <span className="recipe-page__shopping-name">{ing.name}</span>
              <span className="recipe-page__shopping-weight">{formatAmount(ing.amount, ing.unit)}</span>
            </span>
          </label>
        ))
      ) : (
        <p>Все ингредиенты уже есть. Хоть где-то вселенная не издевается.</p>
      )}
    </div>
  );

  const goCook = () => {
    if (!canCook) return;
    navigate(`/cook/${recipe.recipe_id}`, { state: { recipe } });
  };

  const cookButton = <Button size="large" variant="primary" onClick={goCook} state={canCook ? 'enabled' : 'disabled'}>Готовить</Button>;

  if (!isDesktop) {
    return (
      <div className="recipe-page">
        <div className="recipe-page__hero">
          <img className="recipe-page__image" src={recipe.image_url || '/placeholder.png'} alt={recipe.name} />
          <h1 className="recipe-page__title">{recipe.name}</h1>
          <div className="recipe-page__tags">
            <Tag icon={<IconClock size={16} />}>{formatMinutes(recipe.cooking_time_minutes)}</Tag>
            <Tag icon={null}>{getRecipePriceLabel(recipe)}</Tag>
          </div>
        </div>
        <div className="recipe-page__body">
          <h2 className="recipe-page__ingredients-title">Что нужно докупить</h2>
          {ingredientsList}
        </div>
        <div className="recipe-page__footer">
          <div className="recipe-page__footer-inner">
            <button className="recipe-page__footer-back" onClick={() => navigate(-1)} type="button"><IconArrowBack size={24} /></button>
            {cookButton}
          </div>
        </div>
      </div>
    );
  }

  const leftPanel = <div className="recipe-page__desktop-center"><img className="recipe-page__desktop-img" src={recipe.image_url || '/placeholder.png'} alt={recipe.name} /><h1 className="recipe-page__desktop-title">{recipe.name}</h1><div className="recipe-page__tags"><Tag icon={<IconClock size={16} />}>{formatMinutes(recipe.cooking_time_minutes)}</Tag><Tag icon={null}>{getRecipePriceLabel(recipe)}</Tag></div></div>;
  const rightPanel = <div className="recipe-page__desktop-right"><h2 className="recipe-page__ingredients-title" style={{ color: 'white' }}>Что нужно докупить</h2>{ingredientsList}<div className="recipe-page__desktop-footer"><button className="recipe-page__footer-back" onClick={() => navigate(-1)} type="button"><IconArrowBack size={24} /></button>{cookButton}</div></div>;

  return <DesktopSplitLayout leftContent={leftPanel} rightContent={rightPanel} rightClassName="desktop-split__right--orange" />;
}

export default RecipePage;
