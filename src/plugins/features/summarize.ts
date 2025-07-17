import type { FeaturePlugin } from '../../types/features';
import { getOpenAICompletion } from '../../services/openai';

export const summarizePlugin: FeaturePlugin = {
  id: 'summarize',
  name: '요약하기',
  category: 'text',
  icon: 'summarize',
  description: '긴 텍스트를 핵심 내용만 간결하게 요약합니다',
  enabled: true,
  defaultPrompt: '다음 텍스트를 핵심 내용만 간결하게 한국어로 요약해 주세요.\n\n[TEXT]:\n{text}',
  execute: async (text: string) => {
    try {
      const prompt = (summarizePlugin.customPrompt || summarizePlugin.defaultPrompt || '').replace('{text}', text);
      const result = await getOpenAICompletion([
        { id: '1', role: 'user', content: prompt, timestamp: new Date() }
      ]);
      return result 
        ? { success: true, data: result } 
        : { success: false, error: 'API로부터 응답을 받지 못했습니다.' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' };
    }
  }
}; 