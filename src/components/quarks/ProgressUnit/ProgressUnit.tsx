import styles from './ProgressUnit.module.css';

interface ProgressUnitProps {
  active?: boolean;
}

export function ProgressUnit({ active = false }: ProgressUnitProps) {
  return (
    <div
      className={`${styles.progressUnit} ${active ? styles.active : styles.static}`}
    />
  );
}
