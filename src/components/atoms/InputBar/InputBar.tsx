import { Unit } from '../../quarks/Unit';
import styles from './InputBar.module.css';

interface InputBarProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  unit?: string;
}

export function InputBar({
  value,
  onChange,
  placeholder = '0',
  unit = 'гр',
}: InputBarProps) {
  return (
    <div className={styles.inputBar}>
      <input
        className={styles.input}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
      <Unit label={unit} />
    </div>
  );
}
