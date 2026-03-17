import type { ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonSize = 'large' | 'medium' | 'small';
type ButtonVariant = 'accent' | 'primary' | 'secondary';
type ButtonRound = 'absolute' | '16px';

interface ButtonProps {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  round?: ButtonRound;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  count?: string | number;
  onClick?: () => void;
  className?: string;
}

export function Button({
  children,
  size = 'large',
  variant = 'accent',
  round = 'absolute',
  disabled = false,
  iconLeft,
  iconRight,
  count,
  onClick,
  className,
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[size],
    styles[variant],
    round === 'absolute' ? styles.roundFull : styles.round16,
    disabled ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} disabled={disabled} onClick={onClick}>
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      <span className={styles.text}>{children}</span>
      {count !== undefined && <span className={styles.count}>{count}</span>}
      {iconRight && <span className={styles.icon}>{iconRight}</span>}
    </button>
  );
}
