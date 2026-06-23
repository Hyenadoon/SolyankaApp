import React from 'react';
import { IconClock } from '../../../icons/index.jsx';
import './Tag.css';

const Tag = ({
  variant = 'neutral',
  children,
  count,
  icon,
  className = '',
}) => {
  const defaultIcon = <IconClock size={16} />;
  const renderedIcon = icon !== undefined ? icon : defaultIcon;

  return (
    <div className={`tag tag--${variant} ${className}`.trim()}>
      {renderedIcon && (
        <span className="tag__icon">{renderedIcon}</span>
      )}
      <span className="tag__text">{children}</span>
      {count !== undefined && (
        <span className="tag__count">{count}</span>
      )}
    </div>
  );
};

export default Tag;
