import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ChatChip from '../../../components/atoms/ChatChip/ChatChip';
import Tag from '../../../components/atoms/Tag/Tag';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { createCookingSession, finishCookingSession, getCookingSession, updateCookingStep } from '../../../api/cooking';
import { formatMinutes } from '../../../lib/format';
import { IconArrowBack, IconArrowForward, IconClock } from '../../../icons/index.jsx';
import './CookingPage.css';

const CHAT_MESSAGES = ['Начнем!', 'Отлично идёт!', 'Так держать!', 'Почти готово!', 'Последний шаг!'];

function CookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [session, setSession] = useState(location.state?.session || null);
  const [loading, setLoading] = useState(!location.state?.session);
  const [submitting, setSubmitting] = useState(false);
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

  const currentStep = useMemo(() => {
    if (!session?.steps?.length) return 0;
    const nextIndex = session.steps.findIndex((step) => !step.completed);
    return nextIndex === -1 ? session.steps.length - 1 : nextIndex;
  }, [session]);

  const isFirst = currentStep === 0;
  const isLast = session?.steps?.length ? currentStep === session.steps.length - 1 : false;

  const syncSession = async () => {
    if (!session?.id) return;
    const fresh = await getCookingSession(session.id);
    setSession(fresh);
    return fresh;
  };

  const handleNext = async () => {
    if (!session?.steps?.length) return;
    const step = session.steps[currentStep];
    if (!step || step.completed) {
      if (session.steps.every((item) => item.completed)) navigate('/');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await updateCookingStep(session.id, step.step_id, true);
      const updated = await syncSession();
      const allDone = updated?.steps?.every((item) => item.completed);
      if (allDone) {
        await finishCookingSession(session.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить шаг');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = async () => {
    if (!session?.steps?.length) {
      navigate(-1);
      return;
    }

    if (isFirst) {
      navigate(-1);
      return;
    }

    const previous = session.steps[currentStep - 1];
    if (!previous) return;

    setSubmitting(true);
    setError('');
    try {
      await updateCookingStep(session.id, previous.step_id, false);
      await syncSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось вернуть шаг');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = session?.steps || [];
  const finished = steps.length > 0 && steps.every((item) => item.completed);
  const chatMessage = finished ? 'Готово!' : CHAT_MESSAGES[Math.min(currentStep, CHAT_MESSAGES.length - 1)] || 'Готовим';

  const stepsList = (
    <div className="cooking-page__steps">
      {loading ? <p>Разворачиваю рецепт...</p> : null}
      {error ? <p>{error}</p> : null}
      {steps.map((step, index) => (
        <div key={step.step_id} className={`cooking-page__step${index === currentStep ? ' cooking-page__step--active' : ''}`}>
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

  const footer = (
    <div className="cooking-page__footer">
      <div className="cooking-page__footer-inner">
        <button className="cooking-page__nav-btn" onClick={handleBack} type="button" disabled={submitting}>
          <IconArrowBack size={24} />
        </button>
        <button className="cooking-page__nav-btn cooking-page__nav-btn--next" onClick={() => finished ? navigate('/') : handleNext()} type="button" disabled={submitting || loading || !steps.length}>
          <IconArrowForward size={24} color="#fff" />
        </button>
      </div>
    </div>
  );

  if (!isDesktop) {
    return <div className="cooking-page"><ChatChip className="cooking-page__chat-chip">{chatMessage}</ChatChip>{stepsList}{footer}</div>;
  }

  const leftPanel = <div className="cooking-page__desktop-center"><img className="cooking-page__desktop-img" src={recipe?.image_url || '/placeholder.png'} alt={recipe?.name || session?.recipe_name || 'Блюдо'} /><h1 className="cooking-page__desktop-title">{recipe?.name || session?.recipe_name || 'Готовка'}</h1><div className="cooking-page__desktop-tags"><Tag icon={<IconClock size={16} />}>{recipe ? formatMinutes(recipe.cooking_time_minutes) : `${steps.length} шагов`}</Tag><Tag icon={null}>{finished ? 'Готово' : `${currentStep + 1}/${Math.max(steps.length, 1)}`}</Tag></div></div>;
  const rightPanel = <div className="cooking-page__desktop-right">{stepsList}{footer}</div>;

  return <DesktopSplitLayout leftContent={leftPanel} rightContent={rightPanel} rightClassName="desktop-split__right--orange" />;
}

export default CookingPage;
