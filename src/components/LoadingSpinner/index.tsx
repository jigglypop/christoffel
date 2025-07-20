import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = '불러오는 중...' }) => {
  return (
    <div className={styles.loadingState}>
      <div className={styles.spinner}></div>
      <p>{text}</p>
    </div>
  );
}; 