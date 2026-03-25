import React from 'react';
import { IconClose } from '../../../icons/index.jsx';
import './PopUp.css';

const PopUp = ({ title, onClose, children, className }) => {
  return (
    <div className={`popup${className ? ` ${className}` : ''}`}>
      <div className="popup__header">
        <h3 className="popup__title">{title}</h3>
        <button className="popup__close" onClick={onClose} type="button" aria-label="Close">
          <IconClose size={20} />
        </button>
      </div>
      <div className="popup__content">{children}</div>
    </div>
  );
};

export default PopUp;
