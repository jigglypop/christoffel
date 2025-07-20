import styles from './SettingsHeader.module.css';

export const SettingsHeader = () => {
  return (
    <header className={styles.settingsHeader}>
      <div className={styles.headerContent}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <svg width="24" height="24" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="128" height="128" fill="url(#christoffel-gradient)" rx="24" />
              <path d="M42 90L64 48L86 90M64 48L86 6" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="christoffel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5A67D8" />
                  <stop offset="100%" stopColor="#886AEA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className={styles.titleSection}>
            <h1>Christoffel Settings</h1>
          </div>
        </div>
      </div>
    </header>
  );
}; 