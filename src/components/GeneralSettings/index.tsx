import React from 'react';
import type { ActivationMode } from '../../hooks/useGeneralSettings';
import styles from './GeneralSettings.module.css';

interface GeneralSettingsProps {
  isActive: boolean;
  activationMode: ActivationMode;
  onActiveChange: (active: boolean) => void;
  onModeChange: (mode: ActivationMode) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  isActive,
  activationMode,
  onActiveChange,
  onModeChange,
}) => {
  return (
    <div className={styles.generalSettings}>
      <div className={styles.settingItem}>
        <div className={styles.settingHeader}>
          <label className={styles.settingLabel}>AI 텍스트 도우미</label>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => onActiveChange(e.target.checked)}
            />
            <span className={`${styles.slider} ${styles.round}`}></span>
          </label>
        </div>
        <p className={styles.settingDescription}>
          웹페이지에서 선택한 텍스트에 대해 AI 기능을 제공합니다.
        </p>
      </div>

      {isActive && (
        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>활성화 방법</label>
          <p className={styles.settingDescription}>
            플로팅 UI가 나타나는 조건을 선택하세요.
          </p>
          <div className={styles.radioGroup}>
            <label className={styles.radioItem}>
              <input
                type="radio"
                name="activationMode"
                value="auto"
                checked={activationMode === 'auto'}
                onChange={() => onModeChange('auto')}
              />
              <span className={styles.radioLabel}>자동 (텍스트 선택 시)</span>
              <span className={styles.radioDescription}>
                텍스트를 선택하면 자동으로 플로팅 UI가 나타납니다.
              </span>
            </label>
            
            <label className={styles.radioItem}>
              <input
                type="radio"
                name="activationMode"
                value="shift"
                checked={activationMode === 'shift'}
                onChange={() => onModeChange('shift')}
              />
              <span className={styles.radioLabel}>Shift + 드래그</span>
              <span className={styles.radioDescription}>
                Shift 키를 누른 상태로 텍스트를 선택할 때만 나타납니다. (권장)
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}; 