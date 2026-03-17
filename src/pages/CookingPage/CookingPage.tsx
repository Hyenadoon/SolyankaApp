import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IconX, IconChevronDown, IconClock } from '@tabler/icons-react';
import { Tag, Mascot } from '../../components';
import { finishCookingSession, getCookingSession, updateCookingStep } from '../../api/cooking';
import { formatMinutes } from '../../lib/format';
import type { CookingSessionResponse, RecommendedRecipe } from '../../types/api';
import styles from './CookingPage.module.css';

interface CookingLocationState {
  recipe?: RecommendedRecipe;
  session?: CookingSessionResponse;
}

const CHAT_MESSAGES = ['Начнем!', 'Отлично идёт!', 'Так держать!', 'Почти готово!', 'Последний штрих!'];

export function CookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const state = (location.state as CookingLocationState | null) ?? null;
  const [session, setSession] = useState<CookingSessionResponse | null>(state?.session ?? null);
  const [loading, setLoading] = useState(!state?.session);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const activeCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      if (!sessionId || state?.session) {
        return;
      }

      setLoading(true);
      setError('');
      try {
        const loadedSession = await getCookingSession(Number(sessionId));
        if (!cancelled) {
          setSession(loadedSession);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить шаги готовки');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [sessionId, state?.session]);

  const currentStep = useMemo(
    () => session?.steps.findIndex((step) => !step.completed) ?? 0,
    [session],
  );

  useEffect(() => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentStep]);

  const handleNext = async () => {
    if (!session || currentStep < 0) {
      return;
    }

    const step = session.steps[currentStep];
    if (!step) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await updateCookingStep(session.id, step.step_id, true);
      const updatedSession = await getCookingSession(session.id);
      setSession(updatedSession);

      const allDone = updatedSession.steps.every((item) => item.completed);
      if (allDone) {
        const finishedSession = await finishCookingSession(session.id);
        navigate('/complete', {
          state: {
            recipe: state?.recipe,
            session: finishedSession,
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить шаг');
    } finally {
      setSubmitting(false);
    }
  };

  const chatMessage = CHAT_MESSAGES[Math.min(Math.max(currentStep, 0), CHAT_MESSAGES.length - 1)] ?? 'Готовим';

  return (
    <div className={styles.page}>
      <div className={styles.chatChip}>
        <div className={styles.chipAvatar}>
          <Mascot size={38} />
        </div>
        <span className={styles.chipText}>{chatMessage}</span>
      </div>

      {error ? <p style={{ padding: '0 24px', color: '#7a1f17' }}>{error}</p> : null}
      {loading ? <p style={{ padding: '0 24px' }}>Разворачиваю рецепт...</p> : null}

      <div className={styles.steps}>
        {session?.steps.map((step, index) => {
          const isActive = index === currentStep;
          const isPast = step.completed || index < currentStep;
          return (
            <div
              key={step.step_id}
              ref={isActive ? activeCardRef : null}
              className={`${styles.stepCard} ${
                isActive ? styles.stepActive : isPast ? styles.stepPast : styles.stepInactive
              }`}
            >
              <div className={styles.stepInner}>
                <Tag icon={<IconClock size={20} fill="currentColor" stroke={0} />}>
                  {formatMinutes(step.estimated_minutes)}
                </Tag>
                <p className={styles.stepDescription}>{step.title || step.description}</p>
                {step.title ? <p>{step.description}</p> : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.buttonRow}>
          <button className={styles.closeButton} onClick={() => navigate('/')}>
            <IconX size={24} />
          </button>
          <div className={styles.spacer} />
          <button className={styles.nextButton} disabled={submitting || !session || currentStep < 0} onClick={() => void handleNext()}>
            <IconChevronDown size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
