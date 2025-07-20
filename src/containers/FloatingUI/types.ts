import type { FeatureResult } from '../../types/features';

export interface FloatingUIProps {
  selectedText: string;
  onClose: () => void;
  onExecutePlugin: (pluginId: string, text: string) => Promise<FeatureResult>;
  activeElement?: HTMLInputElement | HTMLTextAreaElement | null;
  selectionWidth?: number;
}