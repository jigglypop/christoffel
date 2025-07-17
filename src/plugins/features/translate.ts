import type { FeaturePlugin } from '../../types/features';
import { getOpenAICompletion } from '../../services/openai';

export const translatePlugin: FeaturePlugin = {
  id: 'translate',
  name: '번역하기',
  category: 'text',
  icon: 'translate',
  description: '텍스트를 다른 언어로 번역합니다',
  enabled: true,
  defaultPrompt: '다음 텍스트를 영어로 번역해 주세요. 번역된 텍스트만 응답으로 제공해 주세요.\n\n[TEXT]:\n{text}',
  execute: async (text: string) => {
    try {
      const prompt = (translatePlugin.customPrompt || translatePlugin.defaultPrompt || '').replace('{text}', text);
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