import { IconClock, IconCoin } from '@tabler/icons-react';
import { Tag } from '../../atoms/Tag';
import { Button } from '../../atoms/Button';
import styles from './ReceiptCard.module.css';

interface ReceiptCardProps {
  image: string;
  title: string;
  time: string;
  price: string;
  onSelect?: () => void;
}

export function ReceiptCard({
  image,
  title,
  time,
  price,
  onSelect,
}: ReceiptCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img className={styles.image} src={image} alt={title} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.tags}>
          <Tag icon={<IconClock size={20} fill="currentColor" stroke={0} />}>
            {time}
          </Tag>
          <Tag icon={<IconCoin size={20} fill="currentColor" stroke={0} />}>
            {price}
          </Tag>
        </div>
      </div>
      <Button size="medium" variant="accent" round="absolute" onClick={onSelect}>
        Выбрать
      </Button>
    </div>
  );
}
