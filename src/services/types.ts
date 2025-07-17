export interface APISettings {
    modelType: 'openai' | 'claude' | 'custom';
    endpoint: string;
    apiKey: string;
}