import styles from './Unit.module.css';

interface UnitProps {
  label?: string;
}

export function Unit({ label = 'гр' }: UnitProps) {
  return (
    <div className={styles.unit}>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
