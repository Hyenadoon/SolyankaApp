import React from 'react';
import { IconHeart } from '../../../icons/index.jsx';
import './ReceiptCard.css';

const ReceiptCard = ({
  size = 'big',
  image,
  title,
  tags = [],
  onCook,
  onFavorite,
  cookLabel = 'Готовить',
  className,
}) => {
  const isBig = size === 'big';

  return (
    <div
      className={`receipt-card receipt-card--${size}${className ? ` ${className}` : ''}`}
    >
      {tags.length > 0 && (
        <div className="receipt-card__tags">
          {tags.map((tag, index) => (
            <div className="receipt-card__tag" key={index}>
              {tag.icon && (
                <span className="receipt-card__tag-icon">{tag.icon}</span>
              )}
              <span className="receipt-card__tag-text">{tag.text}</span>
            </div>
          ))}
        </div>
      )}

      <img className="receipt-card__image" src={image} alt={title} />

      <div className="receipt-card__title">{title}</div>

      <div className="receipt-card__buttons">
        <button className="receipt-card__cook-button" onClick={onCook}>
          <span className="receipt-card__cook-button-text">
{cookLabel}
          </span>
        </button>
        {isBig && onFavorite && (
          <button className="receipt-card__favorite-button" onClick={onFavorite}>
            <IconHeart size={24} color="#292d30" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReceiptCard;
