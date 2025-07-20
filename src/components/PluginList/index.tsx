import React from 'react';
import type { FeaturePlugin } from '../../types/features';
import { PluginListItem } from '../PluginListItem';
import styles from './PluginList.module.css';

interface PluginListProps {
  plugins: FeaturePlugin[];
  expandedPlugin: string | null;
  promptChanges: Record<string, string>;
  onToggle: (pluginId: string) => void;
  onExpand: (pluginId: string) => void;
  onPromptChange: (pluginId: string, newPrompt: string) => void;
  onSavePrompt: (pluginId: string) => void;
  onResetPrompt: (pluginId: string) => void;
  getPluginIcon: (pluginId: string) => React.ReactNode;
  shortcuts: Record<string, string>;
  settingShortcutFor: string | null;
  onSetShortcut: (pluginId:string) => void;
  onShortcutChange: (pluginId:string, shortcut: string) => void;
  onClearShortcut: (pluginId:string) => void;
  onStopSettingShortcut: () => void;
}

export const PluginList: React.FC<PluginListProps> = ({
  plugins,
  expandedPlugin,
  promptChanges,
  onToggle,
  onExpand,
  onPromptChange,
  onSavePrompt,
  onResetPrompt,
  getPluginIcon,
  shortcuts,
  settingShortcutFor,
  onSetShortcut,
  onShortcutChange,
  onClearShortcut,
  onStopSettingShortcut,
}) => {
  return (
    <ul className={styles.pluginList}>
      {plugins.map((plugin) => (
        <PluginListItem
          key={plugin.id}
          plugin={plugin}
          isExpanded={expandedPlugin === plugin.id}
          prompt={promptChanges[plugin.id]}
          onTogglePlugin={onToggle}
          onToggleExpand={onExpand}
          onPromptChange={onPromptChange}
          onSavePrompt={onSavePrompt}
          onResetPrompt={onResetPrompt}
          getPluginIcon={getPluginIcon}
          shortcut={shortcuts[plugin.id]}
          isSettingShortcut={settingShortcutFor === plugin.id}
          onSetShortcut={onSetShortcut}
          onShortcutChange={onShortcutChange}
          onClearShortcut={onClearShortcut}
          onStopSettingShortcut={onStopSettingShortcut}
        />
      ))}
    </ul>
  );
}; 