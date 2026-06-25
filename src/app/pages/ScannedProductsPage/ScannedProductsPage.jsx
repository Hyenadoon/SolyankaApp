import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TitleBlock from '../../../components/atoms/TitleBlock/TitleBlock';
import Button from '../../../components/atoms/Button/Button';
import IngredientUnit from '../../../components/atoms/IngredientUnit/IngredientUnit';
import InputBar from '../../../components/atoms/InputBar/InputBar';
import PopUp from '../../../components/atoms/PopUp/PopUp';
import Mascot from '../../../components/quarks/Mascot/Mascot';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { createPantryItem } from '../../../api/pantry';
import { formatAmount } from '../../../lib/format';
import { IconArrowBack, IconPlus } from '../../../icons/index.jsx';
import './ScannedProductsPage.css';

const PLACEHOLDER = '/placeholder2.png';

function getProductKey(product, index) {
  return String(product.local_id || product.ingredient_id || product.id || `recognized-${index + 1}`);
}

function isGramUnit(unit) {
  const normalized = String(unit || '').trim().toLowerCase();
  return ['', 'г', 'гр', 'грамм', 'грамма', 'граммов', 'g', 'gr', 'gram', 'grams'].includes(normalized);
}

function getGramAmount(product) {
  const rawAmount = product.grams ?? (isGramUnit(product.unit) ? (product.amount ?? product.quantity) : null);
  const amount = Number(String(rawAmount ?? '').replace(',', '.'));

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount);
}

function formatRecognizedWeight(product) {
  if (product.matched === false || !product.ingredient_id) {
    return 'Не найдено в базе';
  }

  const amount = getGramAmount(product);
  return amount ? formatAmount(amount, 'г') : 'Укажите граммы';
}

function normalizeRecognizedProduct(product, index) {
  const amount = getGramAmount(product);

  return {
    ...product,
    local_id: getProductKey(product, index),
    amount,
    grams: amount,
    quantity: null,
    unit: amount ? 'г' : null,
  };
}

function ScannedProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [weightInput, setWeightInput] = useState('200');
  const initialProducts = location.state?.recognizedItems?.length
    ? location.state.recognizedItems
    : location.state?.suggestedIngredients || [];
  const [products, setProducts] = useState(() => initialProducts.map(normalizeRecognizedProduct));

  const normalizedProducts = useMemo(() => products.map((p, index) => {
    const amount = getGramAmount(p);

    return {
      id: getProductKey(p, index),
      ingredient_id: p.ingredient_id || null,
      name: p.ingredient_name || p.name,
      weight: formatRecognizedWeight({ ...p, amount, grams: amount, unit: amount ? 'г' : null }),
      amount,
      unit: amount ? 'г' : null,
      image: p.ingredient_image_url || p.image_url || PLACEHOLDER,
      matched: p.matched !== false && Boolean(p.ingredient_id),
    };
  }), [products]);

  const saveableProducts = useMemo(
    () => normalizedProducts.filter((item) => item.ingredient_id && item.amount),
    [normalizedProducts]
  );

  const closeModals = () => {
    setShowWeightModal(false);
    setEditingProduct(null);
  };

  const openWeightModal = (product) => {
    setError('');
    setEditingProduct(product);
    setWeightInput(String(product.amount || 200));
    setShowWeightModal(true);
  };

  const handleConfirmWeight = () => {
    if (!editingProduct) return;

    const amount = Number(String(weightInput).replace(',', '.')) || 200;
    setProducts((prev) => prev.map((product, index) => {
      const id = getProductKey(product, index);
      if (id !== editingProduct.id) return product;

      return {
        ...product,
        amount,
        grams: amount,
        quantity: amount,
        unit: 'г',
      };
    }));
    closeModals();
  };

  const handleSave = async () => {
    if (!saveableProducts.length || saving) return;

    setSaving(true);
    setError('');
    try {
      await Promise.all(
        saveableProducts.map((item) => createPantryItem({
          ingredient_id: item.ingredient_id,
          amount: item.amount,
          unit: item.unit || 'г',
        }))
      );

      navigate('/recipes', {
        state: {
          fromScan: true,
          scannedIngredientIds: saveableProducts.map((item) => item.ingredient_id),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить распознанные продукты');
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (id) => {
    setProducts((prev) => prev.filter((p, index) => getProductKey(p, index) !== id));
    if (editingProduct?.id === id) closeModals();
  };

  const weightModalContent = editingProduct && (
    <PopUp title="Изменить количество" onClose={closeModals}>
      <div className="scanned-products__weight-controls">
        <IngredientUnit
          image={editingProduct.image || PLACEHOLDER}
          name={editingProduct.name}
          state="enabled"
        />
        <InputBar
          placeholder="Введите вес в граммах"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          icon={false}
        />
        <Button size="large" variant="primary" onClick={handleConfirmWeight}>
          Сохранить
        </Button>
      </div>
    </PopUp>
  );

  const productList = (
    <>
      <div className="scanned-products__list">
        {!normalizedProducts.length ? <p>Не удалось распознать продукты. Добавьте их вручную.</p> : null}
        {normalizedProducts.map((p) => (
          <IngredientUnit
            key={p.id}
            image={p.image}
            name={p.name}
            weight={p.weight}
            state="added"
            onEdit={() => openWeightModal(p)}
            onRemove={() => removeItem(p.id)}
            className={p.matched ? '' : 'scanned-products__item--unmatched'}
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
          <Button size="large" variant="primary" onClick={handleSave} state={!saveableProducts.length || saving ? 'disabled' : 'enabled'}>
            {saving ? 'Сохраняю...' : 'Смотреть рецепты'}
          </Button>
        </div>
      </div>
    </>
  );

  const modalOverlay = showWeightModal && editingProduct ? (
    <div className="scanned-products__modal-overlay" onClick={closeModals}>
      <div className="scanned-products__modal" onClick={(e) => e.stopPropagation()}>{weightModalContent}</div>
    </div>
  ) : null;

  if (!isDesktop) {
    return (
      <div className="scanned-products">
        <TitleBlock title="Проверьте продукты" subtitle="Я нашёл это на фото" />
        {error ? <p className="scanned-products__error">{error}</p> : null}
        {productList}
        {modalOverlay}
      </div>
    );
  }

  const leftPanel = <div className="scanned-products__desktop-center"><Mascot width={115} height={54} /><TitleBlock title="Проверьте продукты" subtitle="Я нашёл это на фото" /></div>;
  const rightPanel = <div className="scanned-products__desktop-right">{error ? <p className="scanned-products__error">{error}</p> : null}{productList}</div>;

  return (
    <>
      <DesktopSplitLayout leftContent={leftPanel} rightContent={rightPanel} showVideo={false} />
      {modalOverlay}
    </>
  );
}

export default ScannedProductsPage;
