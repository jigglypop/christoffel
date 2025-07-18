import React from 'react'
import ReactDOM from 'react-dom/client'
import type { Message, SelectionInfo } from './types'
import { store } from './atoms/store'
import { isDraggingFloatingUIAtom } from './atoms/chatAtoms'
import { createFloatingUI, removeFloatingUI } from './managers/uiManager'
import { handlePluginExecution } from './plugins/PluginManager'

let pluginShortcuts: Record<string, string> = {};

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
  }
});

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
  if (pluginId) {
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
      }
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

  setTimeout(handleTextSelection, 10);
});

let selectionTimeout: NodeJS.Timeout | null = null;
document.addEventListener('selectionchange', () => {
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    if (selectionTimeout) {
      clearTimeout(selectionTimeout);
    }
    selectionTimeout = setTimeout(handleTextSelection, 100);
  }
});

document.addEventListener('mouseup', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    setTimeout(handleTextSelection, 50);
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