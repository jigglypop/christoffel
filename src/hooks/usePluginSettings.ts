import { useState, useEffect } from 'react';
import type { FeaturePlugin } from '../types/features';

export const usePluginSettings = (
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
) => {
  const [plugins, setPlugins] = useState<FeaturePlugin[]>([]);
  const [promptChanges, setPromptChanges] = useState<Record<string, string>>({});

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_ALL_PLUGINS' }, (response) => {
      if (chrome.runtime.lastError) {
        setError('플러그인 목록을 불러오는 데 실패했습니다.');
      } else if (response) {
        setPlugins(response);
        const initialPrompts: Record<string, string> = {};
        response.forEach((plugin: FeaturePlugin) => {
          initialPrompts[plugin.id] = plugin.customPrompt || plugin.defaultPrompt || '';
        });
        setPromptChanges(initialPrompts);
      }
      setLoading(false);
    });
  }, [setError, setLoading]);

  const updatePluginState = (enabled: boolean, pluginId: string) =>
    setPlugins(prevPlugins => prevPlugins.map(p => (p.id === pluginId ? { ...p, enabled } : p)));

  const onToggle = (pluginId: string) => {
    const originalState = plugins.find(p => p.id === pluginId)?.enabled;
    updatePluginState(!originalState, pluginId);

    chrome.runtime.sendMessage({ type: 'TOGGLE_PLUGIN', pluginId }, (response) => {
      if (chrome.runtime.lastError || !response?.success) {
        setError('플러그인 상태 변경에 실패했습니다.');
        updatePluginState(originalState || false, pluginId);
        setTimeout(() => setError(null), 3000);
      }
    });
  };

  const handlePromptChange = (pluginId: string, newPrompt: string) => {
    setPromptChanges(prev => ({ ...prev, [pluginId]: newPrompt }));
  };

  const savePrompt = (pluginId: string) => {
    const newPrompt = promptChanges[pluginId];
    chrome.runtime.sendMessage(
      { type: 'UPDATE_PLUGIN_PROMPT', pluginId, prompt: newPrompt },
      (response) => {
        if (chrome.runtime.lastError || !response?.success) {
          setError('프롬프트 저장에 실패했습니다.');
          setTimeout(() => setError(null), 3000);
        } else {
          setPlugins(prevPlugins =>
            prevPlugins.map(p => (p.id === pluginId ? { ...p, customPrompt: newPrompt } : p))
          );
        }
      }
    );
  };

  const resetPrompt = (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (plugin) {
      setPromptChanges(prev => ({ ...prev, [pluginId]: plugin.defaultPrompt || '' }));
    }
  };

  return {
    plugins,
    promptChanges,
    onToggle,
    handlePromptChange,
    savePrompt,
    resetPrompt,
  };
}; 