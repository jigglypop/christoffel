import React from 'react';
import styles from './TabNavigation.module.css';

export type TabType = 'general' | 'plugins' | 'shortcuts';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'general' as TabType, label: '일반 설정', icon: '' },
    { id: 'plugins' as TabType, label: '플러그인', icon: '' },
    { id: 'shortcuts' as TabType, label: '단축키', icon: '' },
  ];

  return (
    <nav className={styles.tabNavigation}>
      <div className={styles.tabList}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}; 