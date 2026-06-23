import React from 'react';
import './Tab.css';

function Tab({ selected = false, children, onClick, className }) {
  const classNames = [
    'tab',
    selected && 'tab--selected',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} onClick={onClick} type="button">
      {children}
    </button>
  );
}

export default Tab;
