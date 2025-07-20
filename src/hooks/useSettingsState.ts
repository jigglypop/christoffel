import { useState, useEffect, useCallback } from 'react';

export const useSettingsState = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPlugin, setExpandedPlugin] = useState<string | null>(null);
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({});
  const [settingShortcutFor, setSettingShortcutFor] = useState<string | null>(null);

  useEffect(() => {
    if (chrome.storage?.sync) {
      chrome.storage.sync.get(['plugin_shortcuts'], (result) => {
        if (result.plugin_shortcuts) {
          setShortcuts(result.plugin_shortcuts);
        }
      });
    }
  }, []);

  const toggleExpanded = (pluginId: string) => {
    setExpandedPlugin((prev) => (prev === pluginId ? null : pluginId));
  };

  const handleSetShortcut = (pluginId: string) => {
    setSettingShortcutFor(pluginId);
  };

  const handleShortcutChange = useCallback((pluginId: string, shortcut: string) => {
    const newShortcuts = { ...shortcuts, [pluginId]: shortcut };
    setShortcuts(newShortcuts);
    if (chrome.storage?.sync) {
      chrome.storage.sync.set({ plugin_shortcuts: newShortcuts });
    }
    setSettingShortcutFor(null);
  }, [shortcuts]);
  
  const handleClearShortcut = useCallback((pluginId: string) => {
    const { [pluginId]: _, ...rest } = shortcuts;
    setShortcuts(rest);
    if (chrome.storage?.sync) {
      chrome.storage.sync.set({ plugin_shortcuts: rest });
    }
  }, [shortcuts]);

  const handleStopSettingShortcut = useCallback(() => {
    setSettingShortcutFor(null);
  }, []);

  return {
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
  };
}; 