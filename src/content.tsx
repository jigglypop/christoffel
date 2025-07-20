import React from 'react'
import ReactDOM from 'react-dom/client'
import type { Message, SelectionInfo } from './types'
import { store } from './atoms/store'
import { isDraggingFloatingUIAtom } from './atoms/chatAtoms'
import { createFloatingUI, removeFloatingUI } from './managers/uiManager'
import { handlePluginExecution } from './plugins/PluginManager'
import { StatusIndicator } from './components/StatusIndicator'

let pluginShortcuts: Record<string, string> = {};
let isShiftPressed = false;
let wasShiftPressedDuringDrag = false;
let isAIAssistantActive = true; // 기본값: 활성화
let statusIndicatorRoot: ReactDOM.Root | null = null;

if (chrome.storage?.sync) {
  chrome.storage.sync.get(['plugin_shortcuts'], (result) => {
    if (result.plugin_shortcuts) {
      pluginShortcuts = result.plugin_shortcuts;
    }
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'UPDATE_SHORTCUTS') {
    pluginShortcuts = message.shortcuts;
  } else if (message.type === 'UPDATE_AI_ASSISTANT_STATE') {
    isAIAssistantActive = message.isActive;
    renderStatusIndicator();
    if (!isAIAssistantActive) {
      removeFloatingUI();
    }
  } else if (message.type === 'UPDATE_ACTIVATION_MODE') {
    // 향후 자동 모드 구현 시 사용
    const activationMode = message.mode;
    if (chrome.storage?.sync) {
      chrome.storage.sync.set({ activation_mode: activationMode });
    }
  }
});

// Shift 키 상태 추적
document.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') {
    isShiftPressed = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') {
    isShiftPressed = false;
  }
});

// 마우스 다운 시 Shift 키 상태 기록
document.addEventListener('mousedown', (e) => {
  wasShiftPressedDuringDrag = isShiftPressed;
});

// 상태 표시기 관리 함수들
function createStatusIndicator() {
  if (statusIndicatorRoot) return;

  const statusContainer = document.createElement('div');
  statusContainer.id = 'christoffel-status-indicator';
  document.body.appendChild(statusContainer);
  
  statusIndicatorRoot = ReactDOM.createRoot(statusContainer);
  renderStatusIndicator();
}

function renderStatusIndicator() {
  if (!statusIndicatorRoot) return;
  
  statusIndicatorRoot.render(
    <React.StrictMode>
      <StatusIndicator
        isActive={isAIAssistantActive}
        onToggle={toggleAIAssistant}
      />
    </React.StrictMode>
  );
}

function removeStatusIndicator() {
  if (statusIndicatorRoot) {
    statusIndicatorRoot.unmount();
    statusIndicatorRoot = null;
  }
  
  const statusContainer = document.getElementById('christoffel-status-indicator');
  if (statusContainer) {
    statusContainer.remove();
  }
}

function toggleAIAssistant() {
  isAIAssistantActive = !isAIAssistantActive;
  
  // 상태를 chrome.storage에 저장
  if (chrome.storage?.sync) {
    chrome.storage.sync.set({ ai_assistant_active: isAIAssistantActive });
  }
  
  // 상태 표시기 업데이트
  renderStatusIndicator();
  
  // 비활성화 시 기존 플로팅 UI 제거
  if (!isAIAssistantActive) {
    removeFloatingUI();
  }
}

// 초기화 시 저장된 상태 로드
if (chrome.storage?.sync) {
  chrome.storage.sync.get(['ai_assistant_active'], (result) => {
    if (result.ai_assistant_active !== undefined) {
      isAIAssistantActive = result.ai_assistant_active;
    }
    createStatusIndicator();
  });
} else {
  createStatusIndicator();
}

document.addEventListener('keydown', (e) => {
  const keys: string[] = [];
  if (e.ctrlKey) keys.push('Ctrl');
  if (e.altKey) keys.push('Alt');
  if (e.shiftKey) keys.push('Shift');
  if (e.metaKey) keys.push('Meta');
  
  if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
    keys.push(e.key.toUpperCase());
  }
  
  const shortcut = keys.join('+');
  const pluginId = Object.entries(pluginShortcuts).find(([_, s]) => s === shortcut)?.[0];
  if (pluginId && isAIAssistantActive) {
    e.preventDefault();
    e.stopPropagation();
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (selectedText) {
      handlePluginExecution(pluginId, selectedText).then((result) => {
        if (result.success) {
          const range = selection!.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const selectionInfo: SelectionInfo = {
            text: selectedText,
            position: {
              x: rect.left,
              y: rect.top,
            },
            size: {
              width: rect.width,
              height: rect.height,
            }
          };
          
          createFloatingUI(selectionInfo);
        }
      });
    }
  }
});

function handleTextSelection() {
  // AI 어시스턴트가 비활성화되어 있거나 Shift 키가 눌렸던 상태가 아니면 처리하지 않음
  if (!isAIAssistantActive || !wasShiftPressedDuringDrag) {
    return;
  }

  const activeElement = document.activeElement;
  let selectedText = '';
  let rect: DOMRect | null = null;
  
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    const inputEl = activeElement as HTMLInputElement | HTMLTextAreaElement;
    const start = inputEl.selectionStart || 0;
    const end = inputEl.selectionEnd || 0;
    
    if (start !== end) {
      selectedText = inputEl.value.substring(start, end);
      
      const elRect = inputEl.getBoundingClientRect();
      rect = {
        left: elRect.left,
        right: elRect.right,
        top: elRect.top,
        bottom: elRect.bottom,
        x: elRect.x,
        y: elRect.y,
        width: elRect.width,
        height: elRect.height,
        toJSON: () => ({})
      } as DOMRect;
    }
  } else {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      if (document.getElementById('christoffel-floating-ui') && !document.getElementById('christoffel-floating-ui')?.contains(document.activeElement as Node)) {
        removeFloatingUI();
      }
      return;
    }
    
    selectedText = selection.toString().trim();
    if (selectedText) {
      const range = selection.getRangeAt(0);
      rect = range.getBoundingClientRect();
    }
  }
  if (selectedText && rect) {
    const selectionInfo: SelectionInfo = {
      text: selectedText,
      position: {
        x: rect.left,
        y: rect.top,
      },
      size: {
        width: rect.width,
        height: rect.height,
      },
    };

    createFloatingUI(selectionInfo);
  } else {
    removeFloatingUI();
  }
}

document.addEventListener('mouseup', (e) => {
  if (store.get(isDraggingFloatingUIAtom)) {
    store.set(isDraggingFloatingUIAtom, false);
    return;
  }
  
  const floatingUIContainer = document.getElementById('christoffel-floating-ui');
  if (floatingUIContainer && floatingUIContainer.contains(e.target as Node)) {
    return;
  }

  // AI 어시스턴트가 활성화되고 Shift + 드래그일 때만 플로팅 UI 활성화
  if (!isAIAssistantActive || !wasShiftPressedDuringDrag) {
    return;
  }

  const selection = window.getSelection();
  const target = e.target as HTMLElement;
  
  // 일반 텍스트 선택 처리
  if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const selectionInfo: SelectionInfo = {
      text: selection.toString().trim(),
      position: {
        x: rect.left,
        y: rect.top,
      },
      mousePosition: {
        x: e.clientX,
        y: e.clientY,
      },
      size: {
        width: rect.width,
        height: rect.height,
      },
    };
    createFloatingUI(selectionInfo);
  }
  // 입력 폼 내 텍스트 선택 처리
  else if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    setTimeout(() => handleTextSelection(), 50);
  }
});

document.addEventListener('wheel', () => {
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) {
    selection.removeAllRanges();
    removeFloatingUI();
  }
}, true);

function resizeChristoffelWindow(direction: 'larger' | 'smaller') {
  if (!document.getElementById('christoffel-floating-ui')) return
  window.postMessage({
    type: 'RESIZE_CHRISTOFFEL',
    direction: direction,
  }, '*')
}
if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message: Message) => {
    if (message.type === 'COMMAND' && message.payload?.command) {
      const command = message.payload.command;
      switch (command) {
        case 'resize-larger':
          resizeChristoffelWindow('larger');
          break;
        case 'resize-smaller':
          resizeChristoffelWindow('smaller');
          break;
      }
    }
  });
}