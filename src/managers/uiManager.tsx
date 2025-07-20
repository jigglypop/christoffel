import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import FloatingUI from '../containers/FloatingUI/FloatingUI';
import { store } from '../atoms/store';
import { christoffelOpenAtom, floatingPositionAtom, isDraggingFloatingUIAtom } from '../atoms/chatAtoms';
import { handlePluginExecution } from '../plugins/PluginManager';
import type { SelectionInfo } from '../types';
import styles from '../content.module.css';

let floatingUIRoot: ReactDOM.Root | null = null;
let floatingUIContainer: HTMLElement | null = null;
let selectionHighlight: HTMLElement | null = null;
let currentActiveElement: HTMLInputElement | HTMLTextAreaElement | null = null;
const queryClient = new QueryClient();

export function createFloatingUI(selection: SelectionInfo) {
  if (store.get(christoffelOpenAtom)) return;
  removeFloatingUI();
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
  floatingUIContainer.style.zIndex = '2147483647';

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

  const currentActiveEl = document.activeElement;

  if (selection.mousePosition) {
    store.set(floatingPositionAtom, { x: selection.mousePosition.x, y: selection.mousePosition.y });
  } else if (currentActiveEl && (currentActiveEl.tagName === 'INPUT' || currentActiveEl.tagName === 'TEXTAREA')) {
    const elRect = currentActiveEl.getBoundingClientRect();
    const left = elRect.left;
    const bottomY = elRect.bottom + 4;
    store.set(floatingPositionAtom, { x: left, y: bottomY });
  } else {
    const rect = document.getSelection()?.getRangeAt(0).getBoundingClientRect();
    if (rect) {
      const left = rect.left;
      const bottomY = rect.bottom + 4;
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

export function removeFloatingUI() {
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