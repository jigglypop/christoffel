export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export type ModelType = 'openai' | 'claude' | 'custom';

export interface APISettings {
  modelType: ModelType;
  endpoint: string;
  apiKey: string;
}
