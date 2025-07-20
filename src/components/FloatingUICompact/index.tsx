import React, { useRef } from 'react';
import type { FloatingUICompactProps } from './types';
import styles from './FloatingUICompact.module.css';

export const FloatingUICompact: React.FC<FloatingUICompactProps> = ({
  position,
  theme,
  currentBg,
  onToggleExpand,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={styles.compactContainer}
      style={{
        '--chat-bg': currentBg.value,
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
      } as React.CSSProperties}
      data-theme={theme}
    >
      <button className={styles.compactButton} onClick={onToggleExpand} title="AI Assistant (Ctrl 키로도 열기)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill={theme === 'dark' ? 'white' : '#1a1a1a'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
      <span className={styles.tooltip}>AI 어시스턴트</span>
    </div>
  );
}; 