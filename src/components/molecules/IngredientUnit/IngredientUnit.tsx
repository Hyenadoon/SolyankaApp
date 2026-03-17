import styles from './IngredientUnit.module.css';

interface IngredientUnitProps {
  image: string;
  name: string;
  weight?: string;
}

export function IngredientUnit({ image, name, weight }: IngredientUnitProps) {
  return (
    <div className={styles.ingredientUnit}>
      <div className={styles.image}>
        <img src={image} alt={name} />
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        {weight && <span className={styles.weight}>{weight}</span>}
      </div>
    </div>
  );
}
