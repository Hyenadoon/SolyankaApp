import React from 'react';
import './Button.css';

function Button({
  size = 'large',
  variant = 'accent',
  state = 'enabled',
  round = 'absolute',
  children,
  count,
  iconLeft,
  iconRight,
  onClick,
  className,
  type = 'button',
}) {
  const roundClass = round === 'absolute' ? 'button--round-absolute' : 'button--round-16';

  const classes = [
    'button',
    `button--${size}`,
    `button--${variant}`,
    `button--${state}`,
    roundClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={state === 'disabled'}
      type={type}
    >
      {iconLeft && <span className="button__icon">{iconLeft}</span>}
      <span className="button__label">
        {children}
        {count != null && <span className="button__count">{count}</span>}
      </span>
      {iconRight && <span className="button__icon">{iconRight}</span>}
    </button>
  );
}

export default Button;
