import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputBar from '../../../components/atoms/InputBar/InputBar';
import TabSelector from '../../../components/atoms/TabSelector/TabSelector';
import Button from '../../../components/atoms/Button/Button';
import Tag from '../../../components/atoms/Tag/Tag';
import ReceiptCard from '../../../components/molecules/ReceiptCard/ReceiptCard';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { getAllRecipesCatalog } from '../../../api/recipes';
import { createCookingSession } from '../../../api/cooking';
import { cacheRecipe } from '../../../lib/auth';
import { formatMinutes } from '../../../lib/format';
import { IconFilter, IconHeart, IconClock } from '../../../icons/index.jsx';
import './AllRecipesPage.css';

const TIME_TABS = [
  { value: '15', label: 'до 15 мин' },
  { value: '30', label: 'до 30 мин' },
  { value: '60', label: 'до 60 мин' },
  { value: 'all', label: 'всё' },
];

function toCard(recipe) {
  if (!recipe) return null;
  return {
    ...recipe,
    id: recipe.recipe_id,
    title: recipe.name,
    image: recipe.image_url || '/placeholder.png',
    tags: [
      { text: formatMinutes(recipe.cooking_time_minutes) },
      { text: `${recipe.ingredients?.length || 0} ингр.` },
    ],
  };
}

function AllRecipesPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [search, setSearch] = useState('');
  const [activeTime, setActiveTime] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState(() => toCard(getAllRecipesCatalog()[0] || null));
  const [isStartingCooking, setIsStartingCooking] = useState(false);

  const recipes = useMemo(() => getAllRecipesCatalog().map(toCard), []);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
      const matchesTime = activeTime === 'all' || (r.cooking_time_minutes || 0) <= Number(activeTime);
      return matchesSearch && matchesTime;
    });
  }, [recipes, search, activeTime]);

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

  const grid = (
    <div className="all-recipes__grid">
      {filtered.map((recipe) => (
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

        <TabSelector
          items={TIME_TABS}
          activeValue={activeTime}
          onChange={setActiveTime}
        />

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

      <TabSelector
        items={TIME_TABS}
        activeValue={activeTime}
        onChange={setActiveTime}
      />

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

      <div className="all-recipes__desktop-tags">
        {selectedRecipe.tags.map((t, i) => (
          <Tag key={i} icon={i === 0 ? <IconClock size={16} /> : null}>
            {t.text}
          </Tag>
        ))}
      </div>

      <h2 className="all-recipes__desktop-title">{selectedRecipe.title}</h2>

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
