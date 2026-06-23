import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TitleBlock from '../../../components/atoms/TitleBlock/TitleBlock';
import Button from '../../../components/atoms/Button/Button';
import Mascot from '../../../components/quarks/Mascot/Mascot';
import { login, register } from '../../../api/auth';
import { hasVkLaunchParams, loginWithVkLaunchParams } from '../../../api/vk';
import { setToken } from '../../../lib/auth';
import { IconArrowForward } from '../../../icons/index.jsx';
import './AuthPage.css';

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('demo@solyanka.app');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const vkLoginStartedRef = useRef(false);

  const redirectTo = location.state?.from || '/';


  useEffect(() => {
    if (!hasVkLaunchParams() || vkLoginStartedRef.current) {
      return;
    }

    vkLoginStartedRef.current = true;

    const loginWithVk = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await loginWithVkLaunchParams();
        setToken(response.access_token);
        navigate(redirectTo, { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось авторизоваться через VK');
      } finally {
        setLoading(false);
      }
    };

    loginWithVk();
  }, [navigate, redirectTo]);

  const handleAuth = async (mode) => {
    setLoading(true);
    setError('');
    try {
      const response = mode === 'register'
        ? await register(email.trim(), password)
        : await login(email.trim(), password);

      setToken(response.access_token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось авторизоваться');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAuth('login');
  };

  return (
    <div className="auth-page">
      <div className="auth-page__header">
        <Mascot className="auth-page__mascot" width={115} height={48} />
        <TitleBlock
          title={<>Войдите{'\n'}в Солянку</>}
          subtitle="Войдите, чтобы сохранить продукты и получить рекомендации рецептов."
        />
      </div>

      <form className="auth-page__form" onSubmit={handleSubmit}>
        <input
          className="auth-page__input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="auth-page__input"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error ? <div className="auth-page__error">{error}</div> : null}

        <Button
          size="large"
          variant="primary"
          iconRight={<IconArrowForward size={24} color="#fff" />}
          onClick={handleSubmit}
          state={loading ? 'disabled' : 'enabled'}
        >
          {loading ? 'Входим...' : 'Войти'}
        </Button>

        <Button
          size="large"
          variant="secondary"
          onClick={() => handleAuth('register')}
          state={loading ? 'disabled' : 'enabled'}
        >
          Создать аккаунт
        </Button>
      </form>
    </div>
  );
}

export default AuthPage;
