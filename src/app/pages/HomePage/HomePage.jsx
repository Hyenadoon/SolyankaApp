import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tag from '../../../components/atoms/Tag/Tag';
import Button from '../../../components/atoms/Button/Button';
import Mascot from '../../../components/quarks/Mascot/Mascot';
import TabSelector from '../../../components/atoms/TabSelector/TabSelector';
import Picker from '../../../components/atoms/Picker/Picker';
import DesktopSplitLayout from '../../layouts/DesktopSplitLayout';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { getMe } from '../../../api/auth';
import { clearToken } from '../../../lib/auth';
import { IconHeart, IconCamera } from '../../../icons/index.jsx';
import './HomePage.css';

const TIME_TABS = [
  { value: '15', label: 'до 15 мин' },
  { value: '30', label: 'до 30 мин' },
  { value: '60', label: 'до 60 мин' },
];

const RESTRICTIONS = ['Без мяса', 'Без рыбы', 'Без орехов', 'Без молочки', 'Без сахара'];

function HomePage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [activeTime, setActiveTime] = useState('15');
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((user) => {
        if (!cancelled) setEmail(user.email);
      })
      .catch(() => {
        clearToken();
        navigate('/auth', { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const toggleRestriction = (r) => {
    setSelectedRestrictions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const tagText = email ? `На кухне: ${email}` : 'Сэкономили в казне';

  const mobileContent = (
    <div className="home-page">
      <div className="home-page__hero">
        <Tag variant="neutral" icon={<IconHeart size={16} />}>
          {tagText}
        </Tag>
        <h1 className="home-page__savings">3024р</h1>
      </div>

      <div className="home-page__actions">
        <Mascot className="home-page__actions-mascot" width={115} height={54} />
        <Button
          size="large"
          variant="primary"
          iconLeft={<IconCamera size={24} color="#fff" />}
          onClick={() => navigate('/scan')}
        >
          Распознать продукты
        </Button>
        <Button
          size="large"
          variant="secondary"
          onClick={() => navigate('/products/manual')}
        >
          Ввести вручную
        </Button>
      </div>
    </div>
  );

  if (!isDesktop) {
    return mobileContent;
  }

  const leftPanel = (
    <div className="home-page__desktop-center">
      <Mascot width={115} height={54} />
      <Tag variant="neutral" icon={<IconHeart size={16} />}>
        {tagText}
      </Tag>
      <h1 className="home-page__savings home-page__savings--desktop">3024р</h1>
    </div>
  );

  const rightPanel = (
    <div className="home-page__desktop-right">
      <div className="home-page__desktop-actions">
        <Button
          size="large"
          variant="primary"
          iconLeft={<IconCamera size={24} color="#fff" />}
          onClick={() => navigate('/scan')}
        >
          Загрузить фото продуктов
        </Button>
        <Button
          size="large"
          variant="secondary"
          onClick={() => navigate('/products/manual')}
        >
          Ввести вручную
        </Button>
      </div>

      <div className="home-page__desktop-preferences">
        <div className="home-page__pref-section">
          <p className="home-page__pref-label">Время приготовления</p>
          <TabSelector items={TIME_TABS} activeValue={activeTime} onChange={setActiveTime} />
        </div>
        <div className="home-page__pref-section">
          <p className="home-page__pref-label">Ваши ограничения в еде</p>
          <div className="home-page__pref-pickers">
            {RESTRICTIONS.map((r) => (
              <Picker key={r} selected={selectedRestrictions.includes(r)} onClick={() => toggleRestriction(r)}>
                {r}
              </Picker>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return <DesktopSplitLayout leftContent={leftPanel} rightContent={rightPanel} showVideo={false} />;
}

export default HomePage;
