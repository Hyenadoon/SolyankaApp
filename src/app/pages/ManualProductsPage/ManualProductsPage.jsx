import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TitleBlock from '../../../components/atoms/TitleBlock/TitleBlock';
import Button from '../../../components/atoms/Button/Button';
import InputBar from '../../../components/atoms/InputBar/InputBar';
import IngredientUnit from '../../../components/atoms/IngredientUnit/IngredientUnit';
import PopUp from '../../../components/atoms/PopUp/PopUp';
import Mascot from '../../../components/quarks/Mascot/Mascot';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { getPantryItems, createPantryItem, deletePantryItem } from '../../../api/pantry';
import { searchIngredients } from '../../../api/ingredients';
import { formatAmount } from '../../../lib/format';
import { IconArrowBack, IconPlus } from '../../../icons/index.jsx';
import './ManualProductsPage.css';

const PLACEHOLDER = '/placeholder.png';

function ManualProductsPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingPantryItem, setEditingPantryItem] = useState(null);
  const [weightInput, setWeightInput] = useState('200');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPantry() {
      try {
        const items = await getPantryItems();
        if (!cancelled) setProducts(items);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Не удалось загрузить продукты');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPantry();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      const query = searchQuery.trim();
      if (!query) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const results = await searchIngredients(query);
        if (!cancelled) setSearchResults(results);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Не удалось найти ингредиенты');
      } finally {
        if (!cancelled) setSearching(false);
      }
    }

    const timer = setTimeout(() => void runSearch(), 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const pantryIds = useMemo(() => new Set(products.map((p) => p.ingredient_id)), [products]);

  const closeModals = () => {
    setShowAddModal(false);
    setShowWeightModal(false);
    setSelectedProduct(null);
    setEditingPantryItem(null);
  };

  const openAddModal = () => {
    setError('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProduct(null);
    setEditingPantryItem(null);
    setShowWeightModal(false);
    setShowAddModal(true);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setEditingPantryItem(null);
    setWeightInput('200');
    setShowAddModal(false);
    setShowWeightModal(true);
  };

  const handleEditProduct = (pantryItem) => {
    setSelectedProduct({
      id: pantryItem.ingredient_id,
      name: pantryItem.ingredient_name,
      image_url: pantryItem.ingredient_image_url,
    });
    setEditingPantryItem(pantryItem);
    setWeightInput(String(pantryItem.amount || 200));
    setShowAddModal(false);
    setShowWeightModal(true);
  };

  const handleConfirmWeight = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    setError('');

    try {
      const amount = Number(weightInput) || 200;

      if (editingPantryItem) {
        await deletePantryItem(editingPantryItem.id);
        const recreated = await createPantryItem({
          ingredient_id: editingPantryItem.ingredient_id,
          amount,
          unit: editingPantryItem.unit || 'г',
        });
        setProducts((prev) => prev.map((item) => item.id === editingPantryItem.id ? recreated : item));
      } else {
        const created = await createPantryItem({
          ingredient_id: selectedProduct.id,
          amount,
          unit: 'г',
        });
        setProducts((prev) => [...prev, created]);
      }

      closeModals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить количество');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProduct = async (pantryItemId) => {
    try {
      await deletePantryItem(pantryItemId);
      setProducts((prev) => prev.filter((p) => p.id !== pantryItemId));
      if (editingPantryItem?.id === pantryItemId) {
        closeModals();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить ингредиент');
    }
  };

  const addModalContent = (
    <PopUp title="Добавить продукт" onClose={closeModals}>
      <InputBar placeholder="Введите продукт" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <div className="manual-products__modal-search-results">
        {searching ? <p>Ищу ингредиенты...</p> : null}
        {!searching && !searchResults.length && searchQuery.trim() ? <p>Ничего не найдено</p> : null}
        {searchResults.map((p) => {
          const existing = products.find((item) => item.ingredient_id === p.id);
          const isAdded = pantryIds.has(p.id);
          return (
            <IngredientUnit
              key={p.id}
              image={p.image_url || PLACEHOLDER}
              name={p.name}
              state={isAdded ? 'added' : 'enabled'}
              weight={existing ? formatAmount(existing.amount, existing.unit) : undefined}
              onAdd={() => handleSelectProduct(p)}
              onEdit={() => existing && handleEditProduct(existing)}
              onRemove={() => existing && handleRemoveProduct(existing.id)}
            />
          );
        })}
      </div>
    </PopUp>
  );

  const weightModalContent = selectedProduct && (
    <PopUp title={editingPantryItem ? 'Изменить количество' : selectedProduct.name} onClose={closeModals}>
      <div className="manual-products__weight-controls">
        <IngredientUnit image={selectedProduct.image_url || PLACEHOLDER} name={selectedProduct.name} state="enabled" />
        <InputBar placeholder="Введите вес в граммах" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} icon={false} />
        <Button size="large" variant="primary" onClick={handleConfirmWeight} state={saving ? 'disabled' : 'enabled'}>
          {saving ? 'Сохраняю...' : editingPantryItem ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>
    </PopUp>
  );

  const productList = loading ? (
    <p>Гружу холодильник. Люди и это почему-то называют UX.</p>
  ) : (
    products.map((p) => (
      <IngredientUnit
        key={p.id}
        image={p.ingredient_image_url || PLACEHOLDER}
        name={p.ingredient_name}
        weight={formatAmount(p.amount, p.unit) || 'Без количества'}
        state="added"
        onEdit={() => handleEditProduct(p)}
        onRemove={() => handleRemoveProduct(p.id)}
      />
    ))
  );

  const pageContent = (
    <div className="manual-products__right-content">
      <TitleBlock title="Введите ваши продукты" subtitle="Из них составлю рецепты для вас!" />
      {error ? <p className="manual-products__error">{error}</p> : null}
      <div className="manual-products__list">
        {productList}
        <div className="manual-products__empty">
          <Button size="large" variant="secondary" iconLeft={<IconPlus size={24} />} onClick={openAddModal}>
            Добавить продукты
          </Button>
        </div>
      </div>
      <div className="manual-products__footer">
        <div className="manual-products__footer-inner">
          <button className="manual-products__footer-back" onClick={() => navigate(-1)} type="button">
            <IconArrowBack size={24} />
          </button>
          <Button size="large" variant="primary" state={products.length ? 'enabled' : 'disabled'} onClick={() => navigate('/recipes')}>
            Смотреть рецепты
          </Button>
        </div>
      </div>
    </div>
  );

  const modalOverlay = (
    <>
      {showAddModal && (
        <div className="manual-products__modal-overlay" onClick={closeModals}>
          <div className="manual-products__modal" onClick={(e) => e.stopPropagation()}>{addModalContent}</div>
        </div>
      )}
      {showWeightModal && selectedProduct && (
        <div className="manual-products__modal-overlay" onClick={closeModals}>
          <div className="manual-products__modal" onClick={(e) => e.stopPropagation()}>{weightModalContent}</div>
        </div>
      )}
    </>
  );

  if (!isDesktop) {
    return (
      <div className="manual-products">
        <div className="manual-products__header">
          <TitleBlock title="Введите ваши продукты" subtitle="Из них составлю рецепты для вас!" />
        </div>
        {error ? <p className="manual-products__error">{error}</p> : null}
        <div className="manual-products__list">
          {productList}
          <div className="manual-products__empty">
            <Button size="large" variant="secondary" iconLeft={<IconPlus size={24} />} onClick={openAddModal}>
              Добавить продукты
            </Button>
          </div>
        </div>
        <div className="manual-products__footer">
          <div className="manual-products__footer-inner">
            <button className="manual-products__footer-back" onClick={() => navigate(-1)} type="button">
              <IconArrowBack size={24} />
            </button>
            <Button size="large" variant="primary" state={products.length ? 'enabled' : 'disabled'} onClick={() => navigate('/recipes')}>
              Смотреть рецепты
            </Button>
          </div>
        </div>
        {modalOverlay}
      </div>
    );
  }

  const leftPanel = (
    <div className="manual-products__desktop-center">
      <Mascot width={115} height={54} />
      <TitleBlock title="Перепроверьте ваше имущество" subtitle="Текущее содержимое холодильника" />
    </div>
  );

  return (
    <>
      <DesktopSplitLayout leftContent={leftPanel} rightContent={pageContent} showVideo={false} />
      {modalOverlay}
    </>
  );
}

export default ManualProductsPage;
