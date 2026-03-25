import React from 'react';
import './TabSelector.css';

function TabSelector({ items = [], activeValue, onChange, className }) {
  const containerClass = ['tab-selector', className].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {items.map((item) => {
        const isActive = item.value === activeValue;
        const tabClass = [
          'tab-selector__tab',
          isActive && 'tab-selector__tab--active',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={item.value}
            className={tabClass}
            type="button"
            onClick={() => onChange?.(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default TabSelector;
