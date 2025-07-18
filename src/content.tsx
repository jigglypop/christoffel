import React from 'react'
import ReactDOM from 'react-dom/client'
import type { Message, SelectionInfo } from './types'
import FloatingUI from './containers/FloatingUI/FloatingUI'
import styles from './content.module.css'
import { Provider } from 'jotai'
import { store } from './atoms/store'
import { floatingPositionAtom, christoffelOpenAtom, isDraggingFloatingUIAtom } from './atoms/chatAtoms'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

let floatingUIRoot: ReactDOM.Root | null = null
let floatingUIContainer: HTMLElement | null = null
let selectionHighlight: HTMLElement | null = null
let christoffelButtonContainer: HTMLElement | null = null
// 상태는 jotai store atom으로 관리
let currentActiveElement: HTMLInputElement | HTMLTextAreaElement | null = null;
const queryClient = new QueryClient()

let pluginShortcuts: Record<string, string> = {};

// 페이지 로드 시 저장된 단축키 불러오기
if (chrome.storage?.sync) {
  chrome.storage.sync.get(['plugin_shortcuts'], (result) => {
    if (result.plugin_shortcuts) {
      pluginShortcuts = result.plugin_shortcuts;
    }
  });
}

// 단축키 업데이트 리스너
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'UPDATE_SHORTCUTS') {
    pluginShortcuts = message.shortcuts;
  }
});

// 키보드 이벤트 리스너
document.addEventListener('keydown', (e) => {
  // 현재 눌린 키 조합 확인
  const keys: string[] = [];
  if (e.ctrlKey) keys.push('Ctrl');
  if (e.altKey) keys.push('Alt');
  if (e.shiftKey) keys.push('Shift');
  if (e.metaKey) keys.push('Meta');
  
  if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
    keys.push(e.key.toUpperCase());
  }
  
  const shortcut = keys.join('+');
  
  // 해당 단축키에 매핑된 플러그인 찾기
  const pluginId = Object.entries(pluginShortcuts).find(([_, s]) => s === shortcut)?.[0];
  
  if (pluginId) {
    e.preventDefault();
    e.stopPropagation();
    
    // 현재 선택된 텍스트 가져오기
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    if (selectedText) {
      // 플러그인 실행
      handlePluginExecution(pluginId, selectedText).then(() => {
        // 플로팅 UI 표시
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
      });
    }
  }
});

function toggleChristoffel() {
  if (store.get(christoffelOpenAtom)) {
    removeFloatingUI();
  } else {
    // This logic is flawed because it requires a selection.
    // For now, the button only closes the UI.
    // A better implementation would be to open a default chat window.
  }
}

function createFloatingUI(selection: SelectionInfo) {
  if (store.get(christoffelOpenAtom)) return;
  removeFloatingUI();
  
  // 선택 영역 하이라이트 생성
  selectionHighlight = document.createElement('div');
  selectionHighlight.style.position = 'fixed';
  selectionHighlight.style.left = `${selection.position.x}px`;
  selectionHighlight.style.top = `${selection.position.y}px`;
  selectionHighlight.style.width = `${selection.size?.width || 0}px`;
  selectionHighlight.style.height = `${selection.size?.height || 0}px`;
  selectionHighlight.style.border = '2px solid rgba(99, 102, 241, 0.6)';
  selectionHighlight.style.borderRadius = '4px';
  selectionHighlight.style.background = 'rgba(99, 102, 241, 0.1)';
  selectionHighlight.style.pointerEvents = 'none';
  selectionHighlight.style.zIndex = '9999';
  selectionHighlight.style.animation = 'highlightPulse 2s infinite';
  document.body.appendChild(selectionHighlight);
  
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    currentActiveElement = activeElement as HTMLInputElement | HTMLTextAreaElement;
  } else {
    currentActiveElement = null;
  }
  floatingUIContainer = document.createElement('div');
  floatingUIContainer.id = 'christoffel-floating-ui';
  floatingUIContainer.className = styles.floatingUI;
  floatingUIContainer.style.position = 'fixed';
  
  // 선택 영역과 동일한 크기 설정
  if (selection.size) {
    floatingUIContainer.style.width = `${selection.size.width}px`;
    floatingUIContainer.style.minWidth = `${selection.size.width}px`;
    floatingUIContainer.style.maxWidth = `${selection.size.width}px`;
  }
  
  floatingUIContainer.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement;
    let currentElement: HTMLElement | null = target;
    while (currentElement && currentElement !== floatingUIContainer) {
      if (currentElement.getAttribute('data-draggable') === 'true') {
        store.set(isDraggingFloatingUIAtom, true);
        break;
      }
      currentElement = currentElement.parentElement;
    }
  });

  // 플로팅 UI를 선택 영역 바로 아래에 표시 (viewport 기준)
  const currentActiveEl = document.activeElement;
  
  if (currentActiveEl && (currentActiveEl.tagName === 'INPUT' || currentActiveEl.tagName === 'TEXTAREA')) {
    // input/textarea의 경우 요소 하단에 표시
    const elRect = currentActiveEl.getBoundingClientRect();
    const left = elRect.left;
    const bottomY = elRect.bottom + 4;
    store.set(floatingPositionAtom, { x: left, y: bottomY });
  } else {
    // 일반 텍스트 선택의 경우
    const rect = document.getSelection()?.getRangeAt(0).getBoundingClientRect();
    if (rect) {
      const left = rect.left;
      const bottomY = rect.bottom + 4; // 선택 영역 아래에 4px 간격
      store.set(floatingPositionAtom, { x: left, y: bottomY });
    } else {
      const left = selection.position.x;
      const bottomY = selection.position.y + (selection.size?.height || 0) + 4;
      store.set(floatingPositionAtom, { x: left, y: bottomY });
    }
  }
  document.body.appendChild(floatingUIContainer);
  floatingUIRoot = ReactDOM.createRoot(floatingUIContainer);
  floatingUIRoot.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <FloatingUI
            selectedText={selection.text}
            onClose={removeFloatingUI}
            onExecutePlugin={handlePluginExecution}
            activeElement={currentActiveElement}
            selectionWidth={selection.size?.width}
          />
        </Provider>
      </QueryClientProvider>
    </React.StrictMode>
  );
  store.set(christoffelOpenAtom, true);
}

function removeFloatingUI() {
  if (floatingUIRoot) {
    floatingUIRoot.unmount();
    floatingUIRoot = null;
  }
  if (floatingUIContainer) {
    floatingUIContainer.remove();
    floatingUIContainer = null;
  }
  if (selectionHighlight) {
    selectionHighlight.remove();
    selectionHighlight = null;
  }
  currentActiveElement = null;
  store.set(christoffelOpenAtom, false);
}

// 텍스트 선택 처리 함수
function handleTextSelection() {
  const activeElement = document.activeElement;
  let selectedText = '';
  let rect: DOMRect | null = null;
  
  // input/textarea에서의 선택 처리
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    const inputEl = activeElement as HTMLInputElement | HTMLTextAreaElement;
    const start = inputEl.selectionStart || 0;
    const end = inputEl.selectionEnd || 0;
    
    if (start !== end) {
      selectedText = inputEl.value.substring(start, end);
      
      // input/textarea의 위치를 기준으로 계산
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
    // 일반 텍스트 선택
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      if (floatingUIContainer && !floatingUIContainer.contains(document.activeElement as Node)) {
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
      }
    };

    createFloatingUI(selectionInfo);
  } else {
    removeFloatingUI();
  }
}

// 일반 텍스트 선택 (mouseup)
document.addEventListener('mouseup', (e) => {
  if (store.get(isDraggingFloatingUIAtom)) {
    store.set(isDraggingFloatingUIAtom, false);
    return;
  }
  
  if (floatingUIContainer && floatingUIContainer.contains(e.target as Node)) {
    return;
  }

  setTimeout(handleTextSelection, 10);
});

// input/textarea 내부 텍스트 선택
let selectionTimeout: NodeJS.Timeout | null = null;

document.addEventListener('selectionchange', () => {
  const activeElement = document.activeElement;
  
  // input 또는 textarea에서만 처리
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    // 이전 타임아웃 취소
    if (selectionTimeout) {
      clearTimeout(selectionTimeout);
    }
    
    // 짧은 지연 후 처리 (선택이 완료되도록)
    selectionTimeout = setTimeout(handleTextSelection, 100);
  }
});

// input/textarea에서 mouseup 이벤트도 처리
document.addEventListener('mouseup', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    setTimeout(handleTextSelection, 50);
  }
}, true); // capture phase에서 처리

function resizeChristoffelWindow(direction: 'larger' | 'smaller') {
  if (!store.get(christoffelOpenAtom) || !floatingUIRoot) return
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
        case 'toggle-christoffel':
          toggleChristoffel();
          break;
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


const handlePluginExecution = (pluginId: string, text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'EXECUTE_PLUGIN', pluginId, text }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }

      if (response?.success) {
        resolve();
      } else {
        const errorMessage = response?.error || '플러그인 실행 중 오류가 발생했습니다.';
        reject(new Error(errorMessage));
      }
    });
  });
};