import React, { useState } from 'react';
import styles from './Settings.module.css';
import { useSettingsState } from '../../hooks/useSettingsState';
import { usePluginSettings } from '../../hooks/usePluginSettings';
import { useGeneralSettings } from '../../hooks/useGeneralSettings';
import { SettingsHeader } from '../../components/SettingsHeader';
import { TabNavigation, type TabType } from '../../components/TabNavigation';
import { PluginListSimple } from '../../components/PluginListSimple';
import { ShortcutSettings } from '../../components/ShortcutSettings';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorBanner } from '../../components/ErrorBanner';
import { GeneralSettings } from '../../components/GeneralSettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  
  const {
    error,
    setError,
    loading,
    setLoading,
    expandedPlugin,
    toggleExpanded,
    shortcuts,
    settingShortcutFor,
    handleSetShortcut,
    handleShortcutChange,
    handleClearShortcut,
    handleStopSettingShortcut,
  } = useSettingsState();
  const {
    plugins,
    promptChanges,
    onToggle,
    handlePromptChange,
    savePrompt,
    resetPrompt,
  } = usePluginSettings(setError, setLoading);
  const {
    isActive,
    activationMode,
    loading: generalLoading,
    updateActiveState,
    updateActivationMode,
  } = useGeneralSettings();

  const getPluginIcon = (pluginId: string) => {
    switch (pluginId) {
      case 'summarize':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/></svg>;
      case 'translate':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>;
      case 'explain':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>;
      case 'rewrite':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    if (error && activeTab !== 'general') {
      return <ErrorBanner message={error} />;
    }

    switch (activeTab) {
      case 'general':
        return (
          <>
            {error && <ErrorBanner message={error} />}
            {generalLoading ? (
              <LoadingSpinner text="설정을 불러오는 중" />
            ) : (
              <GeneralSettings
                isActive={isActive}
                activationMode={activationMode}
                onActiveChange={updateActiveState}
                onModeChange={updateActivationMode}
              />
            )}
          </>
        );
      
      case 'plugins':
        return (
          <>
            {loading ? (
              <LoadingSpinner text="플러그인을 불러오는 중" />
            ) : (
              <PluginListSimple
                plugins={plugins}
                expandedPlugin={expandedPlugin}
                promptChanges={promptChanges}
                onToggle={onToggle}
                onExpand={toggleExpanded}
                onPromptChange={handlePromptChange}
                onSavePrompt={savePrompt}
                onResetPrompt={resetPrompt}
                getPluginIcon={getPluginIcon}
              />
            )}
          </>
        );
      
      case 'shortcuts':
        return (
          <>
            {loading ? (
              <LoadingSpinner text="플러그인을 불러오는 중" />
            ) : (
              <ShortcutSettings
                plugins={plugins}
                shortcuts={shortcuts}
                settingShortcutFor={settingShortcutFor}
                onSetShortcut={handleSetShortcut}
                onShortcutChange={handleShortcutChange}
                onClearShortcut={handleClearShortcut}
                onStopSettingShortcut={handleStopSettingShortcut}
                getPluginIcon={getPluginIcon}
              />
            )}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <SettingsHeader />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className={styles.settingsMain}>
        {renderTabContent()}
      </main>
    </div>
  );
}
