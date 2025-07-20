import React from 'react';
import styles from './ErrorBanner.module.css';

interface ErrorBannerProps {
  message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className={styles.errorBanner}>
      <span>{message}</span>
    </div>
  );
}; 