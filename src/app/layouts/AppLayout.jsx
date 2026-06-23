import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import MenuBar from '../../components/molecules/MenuBar/MenuBar';
import { useMediaQuery, BREAKPOINTS } from '../hooks/useMediaQuery';
import { clearToken } from '../../lib/auth';

const menuItems = [
  { label: 'Главная', path: '/' },
  { label: 'Рецепты', path: '/recipes/all' },
  { label: 'Холодильник', path: '/products/manual' },
  { label: 'Выйти', action: 'logout' },
];

function AppLayout() {
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = menuItems.map((item) => ({
    label: item.label,
    onClick: () => {
      if (item.action === 'logout') {
        clearToken();
        navigate('/auth');
      } else {
        navigate(item.path);
      }
      setMenuOpen(false);
    },
  }));

  const handleCtaClick = () => {
    navigate('/products/manual');
    setMenuOpen(false);
  };

  const menuVariant = menuOpen ? (isDesktop ? 'desktopOpened' : 'mobileOpened') : 'collapsed';

  return (
    <div className={`app-layout${isDesktop ? ' app-layout--desktop' : ''}`}>
      <div className="app-header">
        {menuOpen && !isDesktop && <div className="app-header__overlay" onClick={() => setMenuOpen(false)} />}
        <MenuBar
          variant={menuVariant}
          menuItems={navItems}
          ctaText="Приготовить что-то"
          onCtaClick={handleCtaClick}
          onToggle={() => setMenuOpen((prev) => !prev)}
        />
      </div>
      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
