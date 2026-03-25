import React from 'react';
import { IconClock } from '../../../icons/index.jsx';
import './ProcessCard.css';

const ProcessCard = ({
  stepNumber,
  time,
  ingredients = [],
  instructions,
  className,
}) => {
  return (
    <div className={`process-card${className ? ` ${className}` : ''}`}>
      <div className="process-card__header">
        <span className="process-card__step">{stepNumber}</span>
        {time && (
          <div className="process-card__time-tag">
            <IconClock size={16} color="#292d30" />
            <span className="process-card__time-text">{time}</span>
          </div>
        )}
      </div>

      {ingredients.length > 0 && (
        <div className="process-card__content">
          {ingredients.map((ingredient, index) => (
            <div className="process-card__ingredient" key={index}>
              <img
                className="process-card__ingredient-image"
                src={ingredient.image}
                alt={ingredient.name}
              />
              <div className="process-card__ingredient-info">
                <span className="process-card__ingredient-name">
                  {ingredient.name}
                </span>
                <span className="process-card__ingredient-weight">
                  {ingredient.weight}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {instructions && (
        <div className="process-card__instructions">
          <p className="process-card__instructions-text">{instructions}</p>
        </div>
      )}
    </div>
  );
};

export default ProcessCard;
