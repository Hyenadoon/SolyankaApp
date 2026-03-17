import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Mascot } from '../../components';
import { login, register } from '../../api/auth';
import { setToken } from '../../lib/auth';
import styles from './AuthPage.module.css';

export function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@solyanka.app');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (mode: 'login' | 'register') => {
    setLoading(true);
    setError('');

    try {
      const response = mode === 'login'
        ? await login(email.trim(), password)
        : await register(email.trim(), password);

      setToken(response.access_token);
      navigate('/', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось авторизоваться';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Mascot size={115} />
          <h1 className={styles.title}>Впустите{`\n`}повара</h1>
          <p className={styles.subtitle}>Нужен JWT, иначе бек делает грустное лицо и шлёт 401.</p>
        </div>

        <div className={styles.form}>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
          />
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoComplete="current-password"
          />
        </div>

        <div className={styles.error}>{error}</div>

        <div className={styles.actions}>
          <Button size="large" variant="primary" disabled={loading} onClick={() => void handleSubmit('login')}>
            {loading ? 'Заходим...' : 'Войти'}
          </Button>
          <Button size="large" variant="secondary" disabled={loading} onClick={() => void handleSubmit('register')}>
            {loading ? 'Создаём...' : 'Создать аккаунт'}
          </Button>
        </div>
      </div>
    </div>
  );
}
