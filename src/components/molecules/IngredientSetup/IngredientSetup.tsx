import { IconX } from '@tabler/icons-react';
import { Button } from '../../atoms/Button';
import { InputBar } from '../../atoms/InputBar';
import { IngredientUnit } from '../IngredientUnit';
import styles from './IngredientSetup.module.css';

interface IngredientSetupProps {
  image: string;
  name: string;
  value: string;
  unit?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onAdd?: () => void;
  onCancel?: () => void;
}

export function IngredientSetup({
  image,
  name,
  value,
  unit = 'гр',
  disabled = false,
  onChange,
  onAdd,
  onCancel,
}: IngredientSetupProps) {
  return (
    <div className={styles.setup}>
      <IngredientUnit image={image} name={name} />
      <InputBar value={value} onChange={onChange} unit={unit} />
      <div className={styles.actions}>
        <button className={styles.cancelButton} onClick={onCancel}>
          <IconX size={32} />
        </button>
        <Button
          size="large"
          variant={disabled ? 'secondary' : 'primary'}
          round="absolute"
          disabled={disabled}
          onClick={onAdd}
        >
          Добавить
        </Button>
      </div>
    </div>
  );
}
