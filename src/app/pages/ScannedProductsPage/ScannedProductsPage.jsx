import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TitleBlock from '../../../components/atoms/TitleBlock/TitleBlock';
import Button from '../../../components/atoms/Button/Button';
import IngredientUnit from '../../../components/atoms/IngredientUnit/IngredientUnit';
import Mascot from '../../../components/quarks/Mascot/Mascot';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { createPantryItem } from '../../../api/pantry';
import { IconArrowBack, IconPlus } from '../../../icons/index.jsx';
import './ScannedProductsPage.css';

function ScannedProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState(location.state?.suggestedIngredients || Array());

  const normalizedProducts = useMemo(() => products.map((p, index) => ({
    id: p.ingredient_id || p.id || index + 1,
    ingredient_id: p.ingredient_id || p.id,
    name: p.name,
    weight: p.confidence ? `${Math.round(p.confidence * 100)}% совпадение` : 'Распознано',
    image: '/placeholder.png',
  })), [products]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const results = await Promise.allSettled(
        normalizedProducts.map((item) => createPantryItem({ ingredient_id: item.ingredient_id }))
      );

      const fatal = results.find((result) => result.status === 'rejected' && !(result.reason instanceof Error && result.reason.message.includes('уже в холодильнике')));
      if (fatal && fatal.status === 'rejected') throw fatal.reason;

      navigate('/recipes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить распознанные продукты');
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (id) => setProducts((prev) => prev.filter((p) => (p.ingredient_id || p.id) !== id));

  const productList = (
    <>
      <div className="scanned-products__list">
        {!normalizedProducts.length ? <p>Пусто. Даже холодильник решил ничего не рассказывать.</p> : null}
        {normalizedProducts.map((p) => (
          <IngredientUnit
            key={p.id}
            image={p.image}
            name={p.name}
            weight={p.weight}
            state="added"
            onEdit={() => removeItem(p.id)}
          />
        ))}
        <div className="scanned-products__add-row">
          <Button size="large" variant="secondary" iconLeft={<IconPlus size={24} />} onClick={() => navigate('/products/manual')}>
            Добавить вручную
          </Button>
        </div>
      </div>
      <div className="scanned-products__footer">
        <div className="scanned-products__footer-inner">
          <button className="scanned-products__footer-back" onClick={() => navigate(-1)} type="button">
            <IconArrowBack size={24} />
          </button>
          <Button size="large" variant="primary" onClick={handleSave} state={!normalizedProducts.length || saving ? 'disabled' : 'enabled'}>
            {saving ? 'Сохраняю...' : 'Смотреть рецепты'}
          </Button>
        </div>
      </div>
    </>
  );

  if (!isDesktop) {
    return (
      <div className="scanned-products">
        <TitleBlock title="Перепроверьте ваше имущество" subtitle="Все богатства, что я увидел" />
        {error ? <p>{error}</p> : null}
        {productList}
      </div>
    );
  }

  const leftPanel = <div className="scanned-products__desktop-center"><Mascot width={115} height={54} /><TitleBlock title="Перепроверьте ваше имущество" subtitle="Все богатства, что я увидел" /></div>;
  const rightPanel = <div className="scanned-products__desktop-right">{error ? <p>{error}</p> : null}{productList}</div>;

  return <DesktopSplitLayout leftContent={leftPanel} rightContent={rightPanel} showVideo={false} />;
}

export default ScannedProductsPage;
