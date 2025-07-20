import { useState, useEffect } from 'react';
import type { FeaturePlugin } from '../types/features';

export const usePlugins = () => {
  const [plugins, setPlugins] = useState<FeaturePlugin[]>([]);

  useEffect(() => {
    const loadPlugins = () => {
      if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'GET_ALL_PLUGINS' }, (response) => {
          if (!chrome.runtime.lastError && response) {
            const enabledPlugins = response.filter((p: FeaturePlugin) => p.enabled);
            setPlugins(enabledPlugins);
          }
        });
      }
    };

    loadPlugins();

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'sync' && (changes.plugin_states || changes.plugin_prompts)) {
        loadPlugins();
      }
    };

    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    return () => {
      if (chrome?.storage?.onChanged) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
    };
  }, []);

  return plugins;
}; 