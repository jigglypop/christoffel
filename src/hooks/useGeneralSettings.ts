import { useState, useEffect } from 'react';

export type ActivationMode = 'auto' | 'shift' | 'disabled';

export const useGeneralSettings = () => {
  const [isActive, setIsActive] = useState(true);
  const [activationMode, setActivationMode] = useState<ActivationMode>('shift');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chrome.storage?.sync) {
      chrome.storage.sync.get(['ai_assistant_active', 'activation_mode'], (result) => {
        if (result.ai_assistant_active !== undefined) {
          setIsActive(result.ai_assistant_active);
        }
        if (result.activation_mode) {
          setActivationMode(result.activation_mode);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const updateActiveState = (active: boolean) => {
    setIsActive(active);
    if (chrome.storage?.sync) {
      chrome.storage.sync.set({ ai_assistant_active: active });
    }
    
    // content script에 상태 변경 알림
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'UPDATE_AI_ASSISTANT_STATE',
          isActive: active
        });
      }
    });
  };

  const updateActivationMode = (mode: ActivationMode) => {
    setActivationMode(mode);
    if (chrome.storage?.sync) {
      chrome.storage.sync.set({ activation_mode: mode });
    }
    
    // content script에 모드 변경 알림
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'UPDATE_ACTIVATION_MODE',
          mode
        });
      }
    });
  };

  return {
    isActive,
    activationMode,
    loading,
    updateActiveState,
    updateActivationMode,
  };
}; 