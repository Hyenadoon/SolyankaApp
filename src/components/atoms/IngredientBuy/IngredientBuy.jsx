import React from 'react';
import { IconCheckmark } from '../../../icons/index.jsx';
import './IngredientBuy.css';

const IngredientBuy = ({
  image,
  name,
  weight,
  price,
  checked = false,
  onToggle,
  className = '',
}) => {
  return (
    <div className={`ingredient-buy ${className}`.trim()}>
      <img className="ingredient-buy__image" src={image} alt={name} />
      <div className="ingredient-buy__info">
        <span className="ingredient-buy__name">{name}</span>
        <div className="ingredient-buy__details">
          <span className="ingredient-buy__weight">{weight}</span>
          <span className="ingredient-buy__price">{price}</span>
        </div>
      </div>
      <button
        className={`ingredient-buy__checkbox${checked ? ' ingredient-buy__checkbox--checked' : ''}`}
        onClick={onToggle}
        type="button"
      >
        {checked ? (
          <IconCheckmark size={24} color="#ffffff" />
        ) : (
          <span className="ingredient-buy__circle" />
        )}
      </button>
    </div>
  );
};

export default IngredientBuy;
