import type { FeaturePlugin } from '../../types/features';

export interface PluginBarProps {
  plugins: FeaturePlugin[];
  activePlugin: string | null;
  isExecuting: boolean;
  onPluginClick: (pluginId: string) => void;
  getPluginIcon: (pluginId: string) => React.ReactNode;
} 