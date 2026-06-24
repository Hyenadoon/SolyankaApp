import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TitleBlock from '../../../components/atoms/TitleBlock/TitleBlock';
import Button from '../../../components/atoms/Button/Button';
import Mascot from '../../../components/quarks/Mascot/Mascot';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { recognizeFridge } from '../../../api/fridge';
import { IconArrowBack, IconArrowForward, IconCamera } from '../../../icons/index.jsx';
import './ScanPhotoPage.css';

function ScanPhotoPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [photo, setPhoto] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPhoto(URL.createObjectURL(selected));
    setError('');
  };

  const handleRecognize = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const result = await recognizeFridge(file);
      navigate('/products/scanned', { state: { suggestedIngredients: result.suggested_ingredients, preview: photo } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось распознать продукты');
    } finally {
      setLoading(false);
    }
  };

  const preview = (
    <div className="scan-page__preview">
      {photo ? (
        <img src={photo} alt="Фото продуктов" />
      ) : (
        <div className="scan-page__placeholder">
          <IconCamera size={48} color="#919395" />
          <p>Сделайте фото или загрузите из галереи</p>
        </div>
      )}
    </div>
  );

  const controls = (
    <div className="scan-page__controls">
      <button className="scan-page__icon-btn" onClick={() => navigate(-1)} type="button">
        <IconArrowBack size={24} />
      </button>
      <label className="scan-page__capture-btn" aria-label="Сделать фото">
        <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
      </label>
      <label className="scan-page__icon-btn" aria-label="Загрузить из галереи">
        <IconCamera size={24} />
        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
      </label>
    </div>
  );

  const actionButton = photo ? (
    <Button size="large" variant="primary" iconRight={<IconArrowForward size={24} color="#fff" />} onClick={handleRecognize} state={loading ? 'disabled' : 'enabled'}>
      {loading ? 'Распознаю...' : 'Распознать'}
    </Button>
  ) : null;

  if (!isDesktop) {
    return (
      <div className="scan-page">
        {preview}
        {controls}
        {error ? <p>{error}</p> : null}
        {actionButton}
      </div>
    );
  }

  const leftPanel = <div className="scan-page__desktop-center"><Mascot width={115} height={54} /><TitleBlock title="Загрузите фото продуктов" subtitle="Сфотографируйте холодильник — я распознаю, что внутри" /></div>;
  const rightPanel = <div className="scan-page__desktop-right">{preview}{controls}{error ? <p>{error}</p> : null}{actionButton}</div>;

  return <DesktopSplitLayout leftContent={leftPanel} rightContent={rightPanel} showVideo={false} />;
}

export default ScanPhotoPage;
