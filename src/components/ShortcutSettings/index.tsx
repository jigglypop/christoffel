import React, { useRef, useEffect } from 'react';
import type { FeaturePlugin } from '../../types/features';
import styles from './ShortcutSettings.module.css';

interface ShortcutSettingsProps {
  plugins: FeaturePlugin[];
  shortcuts: Record<string, string>;
  settingShortcutFor: string | null;
  onSetShortcut: (pluginId: string) => void;
  onShortcutChange: (pluginId: string, shortcut: string) => void;
  onClearShortcut: (pluginId: string) => void;
  onStopSettingShortcut: () => void;
  getPluginIcon: (pluginId: string) => React.ReactNode;
}

export const ShortcutSettings: React.FC<ShortcutSettingsProps> = ({
  plugins,
  shortcuts,
  settingShortcutFor,
  onSetShortcut,
  onShortcutChange,
  onClearShortcut,
  onStopSettingShortcut,
  getPluginIcon,
}) => {
  const shortcutInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settingShortcutFor && shortcutInputRef.current) {
      shortcutInputRef.current.focus();
    }
  }, [settingShortcutFor]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, pluginId: string) => {
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
      onShortcutChange(pluginId, keys.join('+'));
    }
  };

  return (
    <div className={styles.shortcutSettings}>
      <div className={styles.header}>
        <h3>단축키 설정</h3>
        <p className={styles.description}>
          각 플러그인에 대한 단축키를 설정하여 텍스트 선택 후 빠르게 기능을 실행할 수 있습니다.
        </p>
      </div>

      <div className={styles.shortcutList}>
        {plugins.map((plugin) => (
          <div key={plugin.id} className={styles.shortcutItem}>
            <div className={styles.pluginInfo}>
              <div className={styles.pluginIcon}>
                {getPluginIcon(plugin.id)}
              </div>
              <div className={styles.pluginDetails}>
                <h4 className={styles.pluginName}>{plugin.name}</h4>
                <p className={styles.pluginDescription}>{plugin.description}</p>
              </div>
            </div>

            <div className={styles.shortcutControls}>
              {settingShortcutFor === plugin.id ? (
                <div className={styles.shortcutInputWrapper}>
                  <div
                    ref={shortcutInputRef}
                    tabIndex={0}
                    className={styles.shortcutInput}
                    onKeyDown={(e) => handleKeyDown(e, plugin.id)}
                    onBlur={onStopSettingShortcut}
                  >
                    키를 누르세요...
                  </div>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={onStopSettingShortcut}
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className={styles.shortcutDisplayWrapper}>
                  <div className={styles.shortcutDisplay}>
                    {shortcuts[plugin.id] || (
                      <span className={styles.noShortcut}>지정되지 않음</span>
                    )}
                  </div>
                  <div className={styles.shortcutActions}>
                    {shortcuts[plugin.id] && (
                      <button
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={() => onClearShortcut(plugin.id)}
                      >
                        초기화
                      </button>
                    )}
                    <button
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={() => onSetShortcut(plugin.id)}
                    >
                      {shortcuts[plugin.id] ? '변경' : '설정'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 