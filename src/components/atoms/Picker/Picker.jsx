import React from 'react';
import './Picker.css';

const Picker = ({
  selected = false,
  children,
  onClick,
  className = '',
}) => {
  const stateClass = selected ? 'picker--selected' : 'picker--unselected';

  return (
    <button
      className={`picker ${stateClass} ${className}`.trim()}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};

export default Picker;
