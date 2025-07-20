import React from 'react';
import type { ResultDisplayProps } from './types';
import styles from './ResultDisplay.module.css';

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  error,
  isExecuting,
  activeElement,
  onCopy,
  onReplace,
}) => {
  if (!result && !error && !isExecuting) {
    return null;
  }

  return (
    <div className={styles.resultArea}>
      {isExecuting && <div className={styles.loading}>처리 중...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {result && !isExecuting && (
        <div className={styles.resultContent}>
          <div className={styles.resultText}>{result}</div>
          <div className={styles.resultActions}>
            <button className={styles.actionBtn} onClick={onCopy} title="복사">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
            </button>
            {activeElement && (
              <button className={styles.actionBtn} onClick={onReplace} title="텍스트 교체">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 