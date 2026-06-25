import React from 'react';
import Mascot from '../../quarks/Mascot/Mascot';
import { IconBurgerMenu, IconClose } from '../../../icons/index.jsx';
import './MenuBar.css';

const defaultMenuItems = [
  { label: 'Рецепты' },
  { label: 'О проекте' },
  { label: 'Войти' },
];

const MenuBar = ({
  variant = 'collapsed',
  menuItems = defaultMenuItems,
  ctaText = 'Приготовить что-то',
  onCtaClick,
  onToggle,
  className,
}) => {
  if (variant === 'collapsed') {
    return (
      <div
        className={`menu-bar menu-bar--collapsed${className ? ` ${className}` : ''}`}
      >
        <Mascot width={52} height={24} />
        <button className="menu-bar__burger-button" onClick={onToggle}>
          <IconBurgerMenu size={24} color="#292d30" />
        </button>
      </div>
    );
  }

  if (variant === 'mobileOpened') {
    return (
      <div
        className={`menu-bar menu-bar--mobileOpened${className ? ` ${className}` : ''}`}
      >
        <div className="menu-bar__top-row">
          <Mascot width={52} height={24} />
          <button className="menu-bar__close-button" onClick={onToggle}>
            <IconClose size={24} color="#ff7300" />
          </button>
        </div>

        <div className="menu-bar__menu-items--mobile">
          {menuItems.map((item, index) => (
            <button
              className="menu-bar__menu-item--mobile"
              key={index}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button className="menu-bar__cta--mobile" onClick={onCtaClick}>
          <span className="menu-bar__cta-text--mobile">{ctaText}</span>
        </button>
      </div>
    );
  }

  if (variant === 'desktopOpened') {
    return (
      <div
        className={`menu-bar menu-bar--desktopOpened${className ? ` ${className}` : ''}`}
      >
        <div className="menu-bar__wrapper">
          <Mascot width={52} height={24} />

          <div className="menu-bar__menu-items--desktop">
            {menuItems.map((item, index) => (
              <button
                className="menu-bar__menu-item--desktop"
                key={index}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button className="menu-bar__cta--desktop" onClick={onCtaClick}>
            <span className="menu-bar__cta-text--desktop">{ctaText}</span>
          </button>

          <button className="menu-bar__icon-button" onClick={onToggle}>
            <IconClose size={24} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MenuBar;
