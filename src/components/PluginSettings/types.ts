export interface PluginSettingsProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  onSavePrompt: () => void;
  onResetPrompt: () => void;
  shortcut?: string;
  isSettingShortcut: boolean;
  onSetShortcut: () => void;
  onShortcutChange: (shortcut: string) => void;
  onClearShortcut: () => void;
  onStopSettingShortcut: () => void;
  shortcutInputRef: React.RefObject<HTMLDivElement>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
} 