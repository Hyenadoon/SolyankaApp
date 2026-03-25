import React from 'react';
import './Slider.css';

function Slider({
  min = 0,
  max = 100,
  value,
  onChange,
  startLabel,
  endLabel,
  className,
}) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const handleChange = (e) => {
    onChange?.(Number(e.target.value));
  };

  const containerClass = ['slider', className].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {startLabel && <span className="slider__label">{startLabel}</span>}
      <div className="slider__track-wrapper">
        <div className="slider__track">
          <div
            className="slider__track-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          className="slider__input"
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
        />
      </div>
      {endLabel && <span className="slider__label">{endLabel}</span>}
    </div>
  );
}

export default Slider;
