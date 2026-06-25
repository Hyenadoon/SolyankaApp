import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tag from '../../../components/atoms/Tag/Tag';
import Button from '../../../components/atoms/Button/Button';
import Mascot from '../../../components/quarks/Mascot/Mascot';
import ReceiptCard from '../../../components/molecules/ReceiptCard/ReceiptCard';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { getMe } from '../../../api/auth';
import { getAllRecipesCatalog } from '../../../api/recipes';
import { clearToken } from '../../../lib/auth';
import { formatMinutes } from '../../../lib/format';
import { IconHeart, IconCamera } from '../../../icons/index.jsx';
import './HomePage.css';

function toRecipeCard(recipe) {
  return {
    ...recipe,
    id: recipe.recipe_id,
    title: recipe.name,
    image: recipe.image_url || recipe.image || '/placeholder.png',
    tags: [
      { text: formatMinutes(recipe.cooking_time_minutes) },
      { text: `${recipe.ingredients?.length || 0} ингр.` },
    ],
  };
}

function pickRandomRecipes(count = 8) {
  return getAllRecipesCatalog()
    .map(toRecipeCard)
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

function HomePage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [email, setEmail] = useState('');
  const randomRecipes = useMemo(() => pickRandomRecipes(isDesktop ? 7 : 8), [isDesktop]);
  const carouselRecipes = useMemo(() => [...randomRecipes, ...randomRecipes], [randomRecipes]);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((user) => {
        if (!cancelled) setEmail(user.email);
      })
      .catch(() => {
        clearToken();
        navigate('/auth', { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const tagText = email ? `Сэкономили в казне` : 'Сэкономили в казне';

  const openCatalogRecipe = (recipe) => {
    navigate(`/recipes/all?recipe=${recipe.id}`, {
      state: { selectedRecipeId: recipe.id },
    });
  };

  const recipeCarousel = randomRecipes.length ? (
    <div className="home-page__recipe-carousel" aria-label="Случайные рецепты">
      <div className="home-page__recipe-track">
        {carouselRecipes.map((recipe, index) => (
          <ReceiptCard
            key={`${recipe.id}-${index}`}
            size="small"
            className="home-page__recipe-card"
            image={recipe.image}
            title={recipe.title}
            tags={recipe.tags.slice(0, 1)}
            cookLabel="Смотреть"
            onCardClick={() => openCatalogRecipe(recipe)}
            onCook={() => openCatalogRecipe(recipe)}
          />
        ))}
      </div>
    </div>
  ) : null;

  const mobileContent = (
    <div className="home-page">
      <div className="home-page__hero">
        <Tag variant="neutral" icon={<IconHeart size={16} />}>
          Cэкономили в казне
        </Tag>
        <h1 className="home-page__savings">3024р</h1>
        {recipeCarousel}
      </div>

      <div className="home-page__actions">
        <Mascot className="home-page__actions-mascot" width={115} height={54} />
        <Button
          size="large"
          variant="secondary"
          iconLeft={<IconCamera size={24} color="#292d30" />}
          onClick={() => navigate('/scan')}
        >
          Сфотографировать
        </Button>
        <Button
          size="large"
          variant="primary"
          onClick={() => navigate('/products/manual')}
        >
          Ввести вручную
        </Button>
      </div>
    </div>
  );

  if (!isDesktop) {
    return mobileContent;
  }

  const leftPanel = (
    <div className="home-page__desktop-center">
      <Mascot width={115} height={54} />
      <Tag variant="neutral" icon={<IconHeart size={16} />}>
        {tagText}
      </Tag>
      <h1 className="home-page__savings home-page__savings--desktop">3024р</h1>
      {recipeCarousel}
    </div>
  );

  const rightPanel = (
    <div className="home-page__desktop-right">
      <div className="home-page__desktop-actions">
        <Button
          size="large"
          variant="secondary"
          iconLeft={<IconCamera size={24} color="#292d30" />}
          onClick={() => navigate('/scan')}
        >
          Сфотографировать
        </Button>
        <Button
          size="large"
          variant="primary"
          onClick={() => navigate('/products/manual')}
        >
          Ввести вручную
        </Button>
      </div>
    </div>
  );

  return <DesktopSplitLayout leftContent={leftPanel} rightContent={rightPanel} showVideo={false} />;
}

export default HomePage;
