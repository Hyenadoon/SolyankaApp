import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ChatChip from '../../../components/atoms/ChatChip/ChatChip';
import Tag from '../../../components/atoms/Tag/Tag';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { createCookingSession } from '../../../api/cooking';
import { formatMinutes } from '../../../lib/format';
import { IconClock } from '../../../icons/index.jsx';
import './CookingPage.css';

function CookingPage() {
  const location = useLocation();
  const { id } = useParams();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [session, setSession] = useState(location.state?.session || null);
  const [loading, setLoading] = useState(!location.state?.session);
  const [error, setError] = useState('');
  const recipe = location.state?.recipe || null;

  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      if (session) return;
      setLoading(true);
      setError('');
      try {
        const created = await createCookingSession(Number(id));
        if (!cancelled) setSession(created);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Не удалось начать готовку');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void ensureSession();
    return () => { cancelled = true; };
  }, [id, session]);

  const steps = session?.steps || Array();
  const chatMessage = loading ? 'Разворачиваю рецепт...' : `${steps.length || 0} шагов, просто листайте вниз`;

  const stepsList = (
    <div className="cooking-page__steps">
      {loading ? <p>Разворачиваю рецепт...</p> : null}
      {error ? <p>{error}</p> : null}
      {steps.map((step, index) => (
        <div key={step.step_id} className="cooking-page__step">
          <div className="cooking-page__step-header">
            <span className="cooking-page__step-number">шаг {index + 1}</span>
            <Tag icon={<IconClock size={16} />}>{formatMinutes(step.estimated_minutes)}</Tag>
          </div>
          <p className="cooking-page__step-instruction">{step.title || step.description}</p>
          {step.title ? <p className="cooking-page__step-instruction">{step.description}</p> : null}
        </div>
      ))}
    </div>
  );

  if (!isDesktop) {
    return (
      <div className="cooking-page">
        <ChatChip className="cooking-page__chat-chip">{chatMessage}</ChatChip>
        {stepsList}
      </div>
    );
  }

  const leftPanel = (
    <div className="cooking-page__desktop-center">
      <img
        className="cooking-page__desktop-img"
        src={recipe?.image_url || recipe?.image || '/placeholder.png'}
        alt={recipe?.name || recipe?.title || session?.recipe_name || 'Блюдо'}
      />
      <h1 className="cooking-page__desktop-title">{recipe?.name || recipe?.title || session?.recipe_name || 'Готовка'}</h1>
      <div className="cooking-page__desktop-tags">
        <Tag icon={<IconClock size={16} />}>{recipe ? formatMinutes(recipe.cooking_time_minutes) : `${steps.length} шагов`}</Tag>
        <Tag icon={null}>Листайте шаги</Tag>
      </div>
    </div>
  );

  const rightPanel = <div className="cooking-page__desktop-right">{stepsList}</div>;

  return <DesktopSplitLayout leftContent={leftPanel} rightContent={rightPanel} rightClassName="desktop-split__right--orange" />;
}

export default CookingPage;
