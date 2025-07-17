export type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}


export interface APISettings {
    modelType: 'openai' | 'claude' | 'custom';
    endpoint: string;
    apiKey: string;
}