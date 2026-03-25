import React from 'react';
import './TitleBlock.css';

const TitleBlock = ({ tag, title, subtitle, className }) => {
  return (
    <div className={`title-block${className ? ` ${className}` : ''}`}>
      {tag && <div className="title-block__tag">{tag}</div>}
      <h2 className="title-block__title">{title}</h2>
      {subtitle && <p className="title-block__subtitle">{subtitle}</p>}
    </div>
  );
};

export default TitleBlock;
