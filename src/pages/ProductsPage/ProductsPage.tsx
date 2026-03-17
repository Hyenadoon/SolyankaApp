import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconPencil, IconX, IconPlus } from '@tabler/icons-react';
import { Button, ProgressUnit, Mascot } from '../../components';
import { createPantryItem, deletePantryItem, getPantryItems } from '../../api/pantry';
import { searchIngredients } from '../../api/ingredients';
import type { PantryItem, SuggestedIngredient } from '../../types/api';
import styles from './ProductsPage.module.css';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=100&h=100&fit=crop';
const TITLE = 'Перепроверьте\nваше имущество';

type ProductItem = {
  id: number;
  ingredientId: number;
  image: string;
  name: string;
  weight: string;
  pantryItemId?: number;
};

interface ProductsLocationState {
  suggestedIngredients?: SuggestedIngredient[];
}

function toReviewItems(items: SuggestedIngredient[]): ProductItem[] {
  return items.map((item, index) => ({
    id: index + 1,
    ingredientId: item.ingredient_id,
    image: PLACEHOLDER_IMG,
    name: item.name,
    weight: 'Распознано по фото',
  }));
}

function toPantryItems(items: PantryItem[]): ProductItem[] {
  return items.map((item) => ({
    id: item.id,
    ingredientId: item.ingredient_id,
    pantryItemId: item.id,
    image: item.ingredient_image_url || PLACEHOLDER_IMG,
    name: item.ingredient_name,
    weight: item.amount && item.unit ? `${item.amount} ${item.unit}` : 'Без количества',
  }));
}

export function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ProductsLocationState | null) ?? null;
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reviewMode = useMemo(() => Boolean(state?.suggestedIngredients?.length), [state]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        if (state?.suggestedIngredients?.length) {
          if (!cancelled) {
            setProducts(toReviewItems(state.suggestedIngredients));
          }
          return;
        }

        const pantryItems = await getPantryItems();
        if (!cancelled) {
          setProducts(toPantryItems(pantryItems));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить продукты');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [state]);

  const handleDelete = async (id: number) => {
    const item = products.find((product) => product.id === id);
    if (!item) {
      return;
    }

    if (reviewMode || !item.pantryItemId) {
      setProducts((prev) => prev.filter((product) => product.id !== id));
      return;
    }

    try {
      await deletePantryItem(item.pantryItemId);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить продукт');
    }
  };

  const handleConfirm = async () => {
    if (!reviewMode) {
      navigate('/recipes');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const results = await Promise.allSettled(
        products.map((product) => createPantryItem({ ingredient_id: product.ingredientId })),
      );

      const fatalError = results.find(
        (result) => result.status === 'rejected' && !(result.reason instanceof Error && result.reason.message.includes('уже в холодильнике')),
      );

      if (fatalError && fatalError.status === 'rejected') {
        throw fatalError.reason;
      }

      navigate('/recipes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить холодильник');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const rawQuery = window.prompt('Что добавить в холодильник? Введи название ингредиента.');
    const query = rawQuery?.trim();

    if (!query) {
      return;
    }

    try {
      const result = await searchIngredients(query);
      const first = result[0];

      if (!first) {
        setError('Поиск ничего не нашёл');
        return;
      }

      if (reviewMode) {
        setProducts((prev) => [
          ...prev,
          {
            id: Date.now(),
            ingredientId: first.id,
            image: first.image_url || PLACEHOLDER_IMG,
            name: first.name,
            weight: 'Добавлено вручную',
          },
        ]);
        return;
      }

      const created = await createPantryItem({ ingredient_id: first.id });
      setProducts((prev) => [
        ...prev,
        {
          id: created.id,
          ingredientId: created.ingredient_id,
          pantryItemId: created.id,
          image: first.image_url || PLACEHOLDER_IMG,
          name: created.ingredient_name,
          weight: created.amount && created.unit ? `${created.amount} ${created.unit}` : 'Без количества',
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось добавить продукт');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.mascotWrap}>
            <Mascot size={115} />
          </div>
          <h2 className={styles.title}>{TITLE}</h2>
          <p className={styles.subtitle}>
            {reviewMode ? 'Все богатства, что я увидел' : 'Текущее содержимое холодильника'}
          </p>
        </div>

        {error ? <p style={{ padding: '0 16px', color: '#c53929' }}>{error}</p> : null}

        <div className={styles.list}>
          {loading ? <p style={{ padding: '0 16px' }}>Грузим продукты...</p> : null}
          {!loading && products.length === 0 ? <p style={{ padding: '0 16px' }}>Пока пустовато. Бездна холодильника смотрит в ответ.</p> : null}
          {products.map((item, i) => (
            <div
              key={item.id}
              className={styles.item}
              style={{ animationDelay: `${0.1 + i * 0.06}s` }}
            >
              <div className={styles.itemImage}>
                <img src={item.image} alt={item.name} />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemWeight}>{item.weight}</span>
              </div>
              <div className={styles.itemActions}>
                <button className={styles.iconButton} onClick={() => void handleAdd()}>
                  <IconPencil size={20} />
                </button>
                <button className={styles.iconButton} onClick={() => void handleDelete(item.id)}>
                  <IconX size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.progress}>
          {Array.from({ length: 7 }).map((_, i) => (
            <ProgressUnit key={i} active={i < 3} />
          ))}
        </div>
        <div className={styles.buttons}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <IconArrowLeft size={24} />
          </button>
          <div className={styles.flexButton}>
            <Button size="large" variant="primary" disabled={saving || loading} onClick={() => void handleConfirm()}>
              {saving ? 'Сохраняю...' : 'Всё хорошо'}
            </Button>
          </div>
          <button className={styles.addButton} onClick={() => void handleAdd()}>
            <IconPlus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
