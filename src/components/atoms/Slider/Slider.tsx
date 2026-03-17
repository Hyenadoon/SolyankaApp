import { useRef, useState, useCallback } from 'react';
import styles from './Slider.module.css';

interface SliderProps {
  min?: number;
  max?: number;
  value?: number;
  onChange?: (value: number) => void;
  showLabels?: boolean;
}

export function Slider({
  min = 0,
  max = 100,
  value: controlledValue,
  onChange,
  showLabels = false,
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(min);
  const value = controlledValue ?? internalValue;
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const updateValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newValue = Math.round(min + ratio * (max - min));
      setInternalValue(newValue);
      onChange?.(newValue);
    },
    [min, max, onChange],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateValue(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updateValue(e.clientX);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div className={styles.slider}>
      {showLabels && <span className={styles.label}>{min}</span>}
      <div
        className={styles.track}
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className={styles.unfilled} />
        <div className={styles.handle} style={{ width: `${percent}%` }}>
          <div className={styles.filled} />
          <div className={styles.knob} />
        </div>
      </div>
      {showLabels && <span className={styles.label}>{max}</span>}
    </div>
  );
}
