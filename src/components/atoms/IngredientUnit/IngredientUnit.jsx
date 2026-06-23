import React from 'react';
import { IconPlus, IconEdit, IconCheckmark, IconClose } from '../../../icons/index.jsx';
import './IngredientUnit.css';

const IngredientUnit = ({
  image,
  name,
  weight,
  state = 'enabled',
  onAdd,
  onEdit,
  onRemove,
  className = '',
}) => {
  if (state === 'have' || state === 'haveNo') {
    return (
      <div className={`ingredient-chip ingredient-chip--${state} ${className}`.trim()}>
        <div className="ingredient-chip__avatar">
          <img className="ingredient-chip__avatar-img" src={image} alt={name} />
        </div>
        <span className="ingredient-chip__name">{name}</span>
      </div>
    );
  }

  return (
    <div className={`ingredient-unit ${className}`.trim()}>
      <img className="ingredient-unit__image" src={image} alt={name} />
      <div className="ingredient-unit__info">
        <span className="ingredient-unit__name">{name}</span>
        {state === 'added' && weight && (
          <span className="ingredient-unit__weight">{weight}</span>
        )}
      </div>
      <div className="ingredient-unit__actions">
        {state === 'enabled' && (
          <button
            className="ingredient-unit__btn ingredient-unit__btn--default"
            onClick={onAdd}
            type="button"
          >
            <IconPlus size={24} color="#292d30" />
          </button>
        )}
        {state === 'added' && (
          <>
            <button
              className="ingredient-unit__btn ingredient-unit__btn--default"
              onClick={onEdit}
              type="button"
            >
              <IconEdit size={24} color="#292d30" />
            </button>
            <button
              className={`ingredient-unit__btn ${onRemove ? 'ingredient-unit__btn--danger' : 'ingredient-unit__btn--check'}`}
              onClick={onRemove}
              type="button"
            >
              {onRemove ? <IconClose size={20} color="#ffffff" /> : <IconCheckmark size={24} color="#ffffff" />}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default IngredientUnit;
