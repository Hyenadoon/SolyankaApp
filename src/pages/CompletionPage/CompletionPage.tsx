import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import { Button, Mascot } from '../../components';
import type { CookingSessionResponse, RecommendedRecipe } from '../../types/api';
import styles from './CompletionPage.module.css';

const PLACEHOLDER_FOOD = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

interface CompletionLocationState {
  recipe?: RecommendedRecipe;
  session?: CookingSessionResponse;
}

export function CompletionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as CompletionLocationState | null) ?? null;

  useEffect(() => {
    if (!state?.session) {
      navigate('/', { replace: true });
    }
  }, [navigate, state?.session]);

  if (!state?.session) {
    return null;
  }

  const title = `Приятного\nаппетита,\n${state.session.recipe_name}!`;

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.mascotWrap}>
          <Mascot variant="sleeping" size={115} />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.dishImage}>
          <img src={state.recipe?.image_url || PLACEHOLDER_FOOD} alt="Ready dish" />
        </div>
      </div>

      <div className={styles.bottomBar}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <IconArrowLeft size={24} />
        </button>
        <div className={styles.flexButton}>
          <Button size="large" variant="primary" onClick={() => navigate('/')}>
            Пасиба
          </Button>
        </div>
      </div>
    </div>
  );
}
