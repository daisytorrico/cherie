import { useState, useEffect } from 'react';
import styles from './style.module.css';
import useIsPWA from '../../hooks/useIsPwa';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import useScrollDirection from '../../../../hooks/useScrollDirection';

export default function NetworkBanner() {
  const isPWA = useIsPWA();
  const isOnline = useNetworkStatus();
  const scrollDir = useScrollDirection();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner when status changes
    setVisible(true);

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isOnline]);

  if (!isPWA) return null;

  return (
    <div
      className={[
        styles.banner,
        isOnline ? styles.online : styles.offline,
        scrollDir === 'down' ? styles.scrollDown : '',
        !visible ? styles.hidden : '',
      ].join(' ')}
    >
      {isOnline ? 'You are connected' : 'You are offline!'}
    </div>
  );
}
