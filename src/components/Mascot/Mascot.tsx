import styles from './Mascot.module.css';

interface MascotProps {
  size?: number;
  color?: string;
  variant?: 'default' | 'sleeping' | 'white';
}

export function Mascot({ size = 115, color = '#ff7300', variant = 'default' }: MascotProps) {
  const c = variant === 'white' ? '#ffffff' : color;

  if (variant === 'sleeping') {
    return (
      <svg width={size} height={size * 0.47} viewBox="0 0 115 54" fill="none" className={styles.mascot}>
        <path d="M10 48 Q57.5 0 105 48" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="40" cy="40" r="3.5" fill={c} />
        <circle cx="52" cy="43" r="2.5" fill={c} />
        <circle cx="75" cy="40" r="3.5" fill={c} />
        <text x="88" y="20" fill={c} fontSize="14" fontWeight="700" fontFamily="SF Pro Display, sans-serif">z</text>
        <text x="96" y="10" fill={c} fontSize="10" fontWeight="700" fontFamily="SF Pro Display, sans-serif">z</text>
      </svg>
    );
  }

  return (
    <svg width={size} height={size * 0.47} viewBox="0 0 115 54" fill="none" className={styles.mascot}>
      <path d="M10 48 Q57.5 0 105 48" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="40" r="3.5" fill={c} />
      <circle cx="52" cy="43" r="2.5" fill={c} />
      <circle cx="75" cy="40" r="3.5" fill={c} />
    </svg>
  );
}
