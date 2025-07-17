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
let christoffelButtonContainer: HTMLElement | null = null
// 상태는 jotai store atom으로 관리
let currentActiveElement: HTMLInputElement | HTMLTextAreaElement | null = null;
const queryClient = new QueryClient()
function createChristoffelButton() {
  if (christoffelButtonContainer) return
  christoffelButtonContainer = document.createElement('div')
  christoffelButtonContainer.id = 'christoffel-button'
  // 인라인 스타일로 position fixed 보장
  christoffelButtonContainer.style.position = 'fixed'
  christoffelButtonContainer.style.bottom = '30px'
  christoffelButtonContainer.style.right = '30px'
  christoffelButtonContainer.style.zIndex = '2147483640'
  const button = document.createElement('button')
  button.className = styles.christoffelButton
  const overlay = document.createElement('span')
  overlay.className = styles.christoffelButtonOverlay
  // 아이콘 이미지
  const christoffelIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  christoffelIcon.setAttribute('viewBox','0 0 24 24')
  christoffelIcon.setAttribute('width','24')
  christoffelIcon.setAttribute('height','24')
  christoffelIcon.setAttribute('class', `${styles.christoffelButtonImage} ${styles.christoffelIcon} christoffel-icon`)
  christoffelIcon.innerHTML = '<path d="M4 4h16v10H5.17L4 15.17V4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'
  // 버튼 색상을 흰색으로
  christoffelIcon.style.color = '#ffffff'
  // 닫기 아이콘 (SVG 유지)
  const closeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  closeIcon.setAttribute('class', `${styles.closeIcon} close-icon`)
  closeIcon.setAttribute('width', '24')
  closeIcon.setAttribute('height', '24')
  closeIcon.setAttribute('viewBox', '0 0 24 24')
  closeIcon.innerHTML = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>'
  
  button.appendChild(overlay)
  button.appendChild(christoffelIcon)
  button.appendChild(closeIcon)
  christoffelButtonContainer.appendChild(button)
  document.body.appendChild(christoffelButtonContainer)
  button.addEventListener('click', toggleChristoffel)
}

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
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    currentActiveElement = activeEl as HTMLInputElement | HTMLTextAreaElement;
  } else {
    currentActiveElement = null;
  }
  floatingUIContainer = document.createElement('div');
  floatingUIContainer.id = 'christoffel-floating-ui';
  floatingUIContainer.className = styles.floatingUI;
  floatingUIContainer.style.position = 'fixed';
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

  let left = selection.position.x - window.scrollX;
  let top = selection.position.y - window.scrollY;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const estimatedWidth = 300;
  const estimatedHeight = 200;

  if (left + estimatedWidth > viewportWidth - 10) left = viewportWidth - estimatedWidth - 10;
  if (top + estimatedHeight > viewportHeight - 10) top = viewportHeight - estimatedHeight - 10;
  if (left < 10) left = 10;
  if (top < 10) top = 10;

  store.set(floatingPositionAtom, { x: left, y: top });
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
  currentActiveElement = null;
  store.set(christoffelOpenAtom, false);
}

document.addEventListener('mouseup', (e) => {
  // 드래그가 끝났음을 표시
  if (store.get(isDraggingFloatingUIAtom)) {
    store.set(isDraggingFloatingUIAtom, false)
    return // 드래그 중이었다면 아무것도 하지 않음
  }
  
  // Do nothing if the click is inside the floating UI
  if (floatingUIContainer && floatingUIContainer.contains(e.target as Node)) {
    return
  }

  setTimeout(() => {
    let selectionInfo: SelectionInfo | null = null
    const activeEl = document.activeElement

    // Logic for input fields
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      const inputEl = activeEl as HTMLInputElement | HTMLTextAreaElement
      const start = inputEl.selectionStart
      const end = inputEl.selectionEnd

      if (start !== null && end !== null && start !== end) {
        const selectedText = inputEl.value.substring(start, end).trim()
        if (selectedText) {
          selectionInfo = {
            text: selectedText,
            position: {
              x: e.pageX + 5, // Position relative to cursor
              y: e.pageY + 5,
            },
          }
        }
      }
    } else { // Logic for general text
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) {
        const selectedText = selection.toString().trim()
        if (selectedText) {
          selectionInfo = {
            text: selectedText,
            position: {
              x: e.pageX + 5, // Position relative to cursor
              y: e.pageY + 5,
            },
          }
        }
      }
    }

    if (selectionInfo && !store.get(christoffelOpenAtom)) {
      createFloatingUI(selectionInfo)
    } else if (!selectionInfo) {
      const targetIsFloatingUI = floatingUIContainer && floatingUIContainer.contains(document.activeElement as Node);
      if (!targetIsFloatingUI) {
         removeFloatingUI();
      }
    }
  }, 10)
})

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createChristoffelButton)
} else {
  createChristoffelButton()
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