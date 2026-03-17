import { IconClock } from '@tabler/icons-react';
import { Tag } from '../../atoms/Tag';
import { IngredientUnit } from '../IngredientUnit';
import styles from './ProcessCard.module.css';

interface Ingredient {
  image: string;
  name: string;
  weight?: string;
}

interface ProcessCardProps {
  time: string;
  description: string;
  ingredients?: Ingredient[];
  active?: boolean;
}

export function ProcessCard({
  time,
  description,
  ingredients = [],
  active = false,
}: ProcessCardProps) {
  return (
    <div className={`${styles.card} ${active ? styles.active : styles.inactive}`}>
      <div className={styles.inner}>
        <Tag icon={<IconClock size={20} fill="currentColor" stroke={0} />}>
          {time}
        </Tag>
        <p className={styles.description}>{description}</p>
      </div>
      {active && ingredients.length > 0 && (
        <div className={styles.ingredients}>
          {ingredients.map((ing, i) => (
            <IngredientUnit
              key={i}
              image={ing.image}
              name={ing.name}
              weight={ing.weight}
            />
          ))}
        </div>
      )}
    </div>
  );
}
