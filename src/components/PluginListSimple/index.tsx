import React from 'react';
import type { FeaturePlugin } from '../../types/features';
import { PluginListItemSimple } from '../PluginListItemSimple';
import styles from './PluginListSimple.module.css';

interface PluginListSimpleProps {
  plugins: FeaturePlugin[];
  expandedPlugin: string | null;
  promptChanges: Record<string, string>;
  onToggle: (pluginId: string) => void;
  onExpand: (pluginId: string) => void;
  onPromptChange: (pluginId: string, newPrompt: string) => void;
  onSavePrompt: (pluginId: string) => void;
  onResetPrompt: (pluginId: string) => void;
  getPluginIcon: (pluginId: string) => React.ReactNode;
}

export const PluginListSimple: React.FC<PluginListSimpleProps> = ({
  plugins,
  expandedPlugin,
  promptChanges,
  onToggle,
  onExpand,
  onPromptChange,
  onSavePrompt,
  onResetPrompt,
  getPluginIcon,
}) => {
  return (
    <ul className={styles.pluginList}>
      {plugins.map((plugin) => (
        <PluginListItemSimple
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
        />
      ))}
    </ul>
  );
}; 