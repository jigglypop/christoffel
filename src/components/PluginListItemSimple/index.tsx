import React from 'react';
import type { FeaturePlugin } from '../../types/features';
import { PluginSettingsSimple } from '../PluginSettingsSimple';
import styles from './PluginListItemSimple.module.css';

interface PluginListItemSimpleProps {
  plugin: FeaturePlugin;
  isExpanded: boolean;
  prompt: string;
  onTogglePlugin: (pluginId: string, enabled: boolean) => void;
  onToggleExpand: (pluginId: string) => void;
  onPromptChange: (pluginId: string, newPrompt: string) => void;
  onSavePrompt: (pluginId: string) => void;
  onResetPrompt: (pluginId: string) => void;
  getPluginIcon: (pluginId: string) => React.ReactNode;
}

const PluginListItemSimple: React.FC<PluginListItemSimpleProps> = ({
  plugin,
  isExpanded,
  prompt,
  onTogglePlugin,
  onToggleExpand,
  onPromptChange,
  onSavePrompt,
  onResetPrompt,
  getPluginIcon,
}) => {
  return (
    <li className={`${styles.pluginItem} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.pluginMain}>
        <div className={styles.pluginIcon}>{getPluginIcon(plugin.id)}</div>
        <div className={styles.pluginInfo}>
          <span className={styles.pluginName}>{plugin.name}</span>
          <p className={styles.pluginDescription}>{plugin.description}</p>
        </div>

        <div className={styles.controls}>
          <button
            onClick={() => onToggleExpand(plugin.id)}
            className={styles.settingsBtn}
            title="프롬프트 설정"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11.03C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
            </svg>
          </button>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={plugin.enabled}
              onChange={(e) => onTogglePlugin(plugin.id, e.target.checked)}
            />
            <span className={`${styles.slider} ${styles.round}`}></span>
          </label>
        </div>
      </div>
      {isExpanded && (
        <PluginSettingsSimple
          prompt={prompt}
          onPromptChange={(newPrompt) => onPromptChange(plugin.id, newPrompt)}
          onSavePrompt={() => onSavePrompt(plugin.id)}
          onResetPrompt={() => onResetPrompt(plugin.id)}
        />
      )}
    </li>
  );
};

export { PluginListItemSimple }; 