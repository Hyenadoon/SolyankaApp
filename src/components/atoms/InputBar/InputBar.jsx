import React from 'react';
import { IconSearch } from '../../../icons/index.jsx';
import './InputBar.css';

const InputBar = ({
  placeholder = 'Введите продукт',
  value,
  onChange,
  icon = true,
  className = '',
}) => {
  return (
    <div className={`input-bar ${className}`.trim()}>
      {icon && (
        <span className="input-bar__icon">
          <IconSearch size={24} />
        </span>
      )}
      <input
        className="input-bar__input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default InputBar;
