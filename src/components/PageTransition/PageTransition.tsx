import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [stage, setStage] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    if (children !== displayChildren) {
      setStage('exit');
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setStage('enter');
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [children, displayChildren, location]);

  return (
    <div className={`${styles.wrapper} ${styles[stage]}`}>
      {displayChildren}
    </div>
  );
}
