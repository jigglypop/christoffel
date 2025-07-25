import type { Message } from './types'
import { getPluginManager } from './plugins/PluginManager'
import { sseClient } from './utils/sse'

chrome.runtime.onInstalled.addListener(() => {
  console.log('christoffel extension installed or updated.')
  getPluginManager().then(manager => {
    manager.saveState()
  })
})
// 단축키 이벤트 리스너 등록
chrome.storage.sync.get(['plugin_shortcuts'], (result) => {
  if (result.plugin_shortcuts) {
    registerShortcuts(result.plugin_shortcuts);
  }
});
// storage 변경 감지하여 단축키 재등록
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.plugin_shortcuts) {
    const shortcuts = changes.plugin_shortcuts.newValue;
    if (shortcuts) {
      registerShortcuts(shortcuts);
    }
  }
});

function registerShortcuts(shortcuts: Record<string, string>) {
  // content script에 단축키 정보 전달
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'UPDATE_SHORTCUTS',
          shortcuts: shortcuts
        });
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  const messageType = request.type
  if (messageType === 'EXECUTE_PLUGIN') {
    (async () => {
      try {
        const pluginManager = await getPluginManager()
        const result = await pluginManager.executePlugin(request.pluginId, request.text)
        sendResponse(result)
      } catch (error) {
        sendResponse({ success: false, error: 'Plugin execution failed.' })
      }
    })()
    return true
  }

  if (messageType === 'GET_ALL_PLUGINS') {
    getPluginManager().then(pm => sendResponse(pm.getAllPlugins()))
    return true
  }

  if (messageType === 'TOGGLE_PLUGIN') {
    getPluginManager().then(pm => {
      pm.togglePlugin(request.pluginId)
      sendResponse({ success: true })
    })
    return true
  }

  if (messageType === 'UPDATE_PLUGIN_PROMPT') {
    (async () => {
      try {
        const pluginManager = await getPluginManager()
        const plugin = pluginManager.getPlugin(request.pluginId)
        if (plugin) {
          plugin.customPrompt = request.prompt
          await pluginManager.saveState()
          sendResponse({ success: true })
        } else {
          sendResponse({ success: false, error: 'Plugin not found' })
        }
      } catch (error) {
        sendResponse({ success: false, error: 'Failed to update prompt' })
      }
    })()
    return true
  }
  if (messageType === 'SSE_START') {
    return true;
  }
  return true;
})

// Context menu setup
chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: 'Christoffel-ai',
    title: 'Christoffel AI Assistant',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'lovebug-ai' && info.selectionText) {
    chrome.tabs.sendMessage(tab?.id ?? 0, {
      type: 'SELECTION_CHANGED',
      payload: { selectedText: info.selectionText },
    });
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiEndpoint || changes.apiKey) {
    chrome.storage.sync.get(['apiEndpoint', 'apiKey'], (result) => {
      if (result.apiEndpoint && result.apiKey) {
        sseClient.setConfig(result.apiEndpoint, result.apiKey)
      }
    })
  }
})

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'COMMAND',
        payload: { command }
      } as Message)
    }
  })
})

export {} 