import type { ReactNode } from 'react';
import styles from './Tag.module.css';

interface TagProps {
  icon?: ReactNode;
  children: ReactNode;
}

export function Tag({ icon, children }: TagProps) {
  return (
    <div className={styles.tag}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
    </div>
  );
}
