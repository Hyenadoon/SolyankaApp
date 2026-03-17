import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconCoin, IconCameraPlus } from '@tabler/icons-react';
import { Button, Tag, Mascot } from '../../components';
import { getMe } from '../../api/auth';
import { clearToken } from '../../lib/auth';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    void getMe()
      .then((user) => setEmail(user.email))
      .catch(() => {
        clearToken();
        navigate('/auth', { replace: true });
      });
  }, [navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.particles}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.particle} />
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.tagRow}>
          <Tag icon={<IconCoin size={20} fill="currentColor" stroke={0} />}>
            {email ? `На кухне: ${email}` : 'Сохранили в казне'}
          </Tag>
        </div>

        <div className={styles.price}>3024р</div>
      </div>

      <div className={styles.mascotArea}>
        <Mascot variant="sleeping" size={200} />
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.scanButton}>
          <Button
            size="large"
            variant="accent"
            iconLeft={<IconCameraPlus size={24} />}
            onClick={() => navigate('/preferences')}
          >
            Распознай продукты
          </Button>
        </div>
        <Button
          size="large"
          variant="secondary"
          onClick={() => navigate('/products')}
        >
          Холодильник вручную
        </Button>
      </div>
    </div>
  );
}
