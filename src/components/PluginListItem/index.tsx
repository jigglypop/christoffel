import React, { useRef, useEffect } from 'react';
import type { PluginListItemProps } from './types';
import styles from './PluginListItem.module.css';
import { PluginSettings } from '../PluginSettings';

const PluginListItem: React.FC<PluginListItemProps> = ({
  plugin,
  isExpanded,
  prompt,
  onTogglePlugin,
  onToggleExpand,
  onPromptChange,
  onSavePrompt,
  onResetPrompt,
  getPluginIcon,
  shortcut,
  isSettingShortcut,
  onSetShortcut,
  onShortcutChange,
  onClearShortcut,
  onStopSettingShortcut,
}) => {
  const shortcutInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSettingShortcut) {
      shortcutInputRef.current?.focus();
    }
  }, [isSettingShortcut]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const keys: string[] = [];
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    if (e.metaKey) keys.push('Meta');
    
    const key = e.key.toUpperCase();
    if (!['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key)) {
      keys.push(key);
    }
    
    if (keys.length > 0) {
      onShortcutChange(plugin.id, keys.join('+'));
    }
  };

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
            title="설정"
          >
            {/* ... settings icon ... */}
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
        <PluginSettings
          prompt={prompt}
          onPromptChange={(newPrompt) => onPromptChange(plugin.id, newPrompt)}
          onSavePrompt={() => onSavePrompt(plugin.id)}
          onResetPrompt={() => onResetPrompt(plugin.id)}
          shortcut={shortcut}
          isSettingShortcut={isSettingShortcut}
          onSetShortcut={() => onSetShortcut(plugin.id)}
          onShortcutChange={(newShortcut) => onShortcutChange(plugin.id, newShortcut)}
          onClearShortcut={() => onClearShortcut(plugin.id)}
          onStopSettingShortcut={onStopSettingShortcut}
          shortcutInputRef={shortcutInputRef}
          handleKeyDown={handleKeyDown}
        />
      )}
    </li>
  );
};

export default PluginListItem; 