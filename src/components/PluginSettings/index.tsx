import React from 'react';
import type { PluginSettingsProps } from './types';
import styles from './PluginSettings.module.css';

export const PluginSettings: React.FC<PluginSettingsProps> = ({
  prompt,
  onPromptChange,
  onSavePrompt,
  onResetPrompt,
  shortcut,
  isSettingShortcut,
  onSetShortcut,
  onClearShortcut,
  onStopSettingShortcut,
  shortcutInputRef,
  handleKeyDown,
}) => {
  return (
    <div className={styles.pluginSettings}>
      <div className={styles.promptSection}>
        <label className={styles.promptLabel}>프롬프트 설정</label>
        <p className={styles.promptHelp}>
          {'{text}'} 부분이 선택된 텍스트로 치환됩니다.
        </p>
        <textarea
          className={styles.promptInput}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={4}
          placeholder="프롬프트를 입력하세요..."
        />
        <div className={styles.promptActions}>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onResetPrompt}
          >
            기본값으로 재설정
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={onSavePrompt}
          >
            저장
          </button>
        </div>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.shortcutSection}>
        <label className={styles.shortcutLabel}>단축키 설정</label>
        {isSettingShortcut ? (
          <div className={styles.shortcutInputWrapper}>
            <div
              ref={shortcutInputRef}
              tabIndex={0}
              className={styles.shortcutInput}
              onKeyDown={handleKeyDown}
              onBlur={onStopSettingShortcut}
            >
              키를 누르세요...
            </div>
            <div className={styles.shortcutActions}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={onStopSettingShortcut}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.shortcutDisplayWrapper}>
            <div className={styles.shortcutDisplay}>{shortcut || '지정되지 않음'}</div>
            <div className={styles.shortcutActions}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={onClearShortcut}
                disabled={!shortcut}
              >
                초기화
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={onSetShortcut}
              >
                {shortcut ? '변경' : '설정'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 