import React from 'react';
import styles from './PluginSettingsSimple.module.css';

interface PluginSettingsSimpleProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  onSavePrompt: () => void;
  onResetPrompt: () => void;
}

export const PluginSettingsSimple: React.FC<PluginSettingsSimpleProps> = ({
  prompt,
  onPromptChange,
  onSavePrompt,
  onResetPrompt,
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
    </div>
  );
}; 