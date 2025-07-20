import React from 'react';
import type { PluginBarProps } from './types';
import styles from './PluginBar.module.css';

export const PluginBar: React.FC<PluginBarProps> = ({
  plugins,
  activePlugin,
  isExecuting,
  onPluginClick,
  getPluginIcon,
}) => {
  return (
    <>
      {plugins.map((plugin) => (
        <button
          key={plugin.id}
          className={`${styles.floatingBtn} ${activePlugin === plugin.id ? styles.active : ''}`}
          onClick={() => onPluginClick(plugin.id)}
          disabled={isExecuting}
          title={plugin.name}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            {getPluginIcon(plugin.id)}
          </svg>
        </button>
      ))}
    </>
  );
}; 