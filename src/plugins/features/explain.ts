import type { FeaturePlugin } from '../../types/features';
import { getOpenAICompletion } from '../../services/openai';

export const explainPlugin: FeaturePlugin = {
  id: 'explain',
  name: '설명하기',
  category: 'text',
  icon: 'explain',
  description: '복잡한 개념이나 용어를 쉽게 설명합니다',
  enabled: true,
  defaultPrompt: '다음 텍스트나 개념에 대해 한국어로 자세히 설명해 주세요. 일반인이 이해하기 쉽게 예시를 들어주면 좋습니다.\n\n[TEXT]:\n{text}',
  execute: async (text: string) => {
    try {
      const prompt = (explainPlugin.customPrompt || explainPlugin.defaultPrompt || '').replace('{text}', text);
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