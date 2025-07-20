import React from 'react';
import styles from './StatusIndicator.module.css';

interface StatusIndicatorProps {
  isActive: boolean;
  onToggle: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isActive,
  onToggle,
}) => {
  return (
    <div className={`${styles.statusIndicator} ${isActive ? styles.active : styles.inactive}`}>
      <button
        className={styles.toggleButton}
        onClick={onToggle}
        title={isActive ? 'AI 텍스트 도우미 활성화됨 (Shift+드래그)' : 'AI 텍스트 도우미 비활성화됨'}
      >
        <div className={styles.icon}>
          <span className={styles.gradient}>∇</span>
        </div>
        <span className={styles.status}>
          {isActive ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );
}; 