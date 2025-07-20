import type { FeaturePlugin } from '../../types/features';

export interface PluginListItemProps {
  plugin: FeaturePlugin;
  isExpanded: boolean;
  prompt: string;
  onTogglePlugin: (pluginId: string, enabled: boolean) => void;
  onToggleExpand: (pluginId: string) => void;
  onPromptChange: (pluginId: string, newPrompt: string) => void;
  onSavePrompt: (pluginId: string) => void;
  onResetPrompt: (pluginId: string) => void;
  getPluginIcon: (pluginId: string) => React.ReactNode;
  shortcut?: string;
  isSettingShortcut: boolean;
  onSetShortcut: (pluginId: string) => void;
  onShortcutChange: (pluginId: string, shortcut: string) => void;
  onClearShortcut: (pluginId: string) => void;
  onStopSettingShortcut: () => void;
} 