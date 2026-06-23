import React from 'react';
import './ChatChip.css';

const ChatChip = ({ image, children, className }) => {
  return (
    <div className={`chat-chip${className ? ` ${className}` : ''}`}>
      {image && (
        <img className="chat-chip__image" src={image} alt="" />
      )}
      <span className="chat-chip__text">{children}</span>
    </div>
  );
};

export default ChatChip;
