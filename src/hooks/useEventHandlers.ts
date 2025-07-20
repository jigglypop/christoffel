import type { FeatureResult } from '../types/features';

type UseEventHandlersProps = {
  isExecuting: boolean;
  selectedText: string;
  result: string;
  activeElement: HTMLInputElement | HTMLTextAreaElement | null;
  onExecutePlugin: (pluginId: string, text: string) => Promise<FeatureResult>;
  setIsExecuting: (value: boolean) => void;
  setResult: (value: string) => void;
  setError: (value: string | null) => void;
  setActivePlugin: (value: string | null) => void;
};

export const useEventHandlers = ({
  isExecuting,
  selectedText,
  result,
  activeElement,
  onExecutePlugin,
  setIsExecuting,
  setResult,
  setError,
  setActivePlugin,
}: UseEventHandlersProps) => {
  const handlePluginClick = async (pluginId: string) => {
    if (isExecuting) return;

    setIsExecuting(true);
    setError(null);
    setResult('');
    setActivePlugin(pluginId);

    try {
      const executionResult = await onExecutePlugin(pluginId, selectedText);
      if (executionResult.success) {
        setResult(executionResult.data || '작업을 완료했습니다.');
      } else {
        throw new Error(executionResult.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  const handleReplaceText = () => {
    if (result && activeElement) {
      const start = activeElement.selectionStart || 0;
      const end = activeElement.selectionEnd || 0;
      const currentValue = activeElement.value;
      const newValue = currentValue.substring(0, start) + result + currentValue.substring(end);
      activeElement.value = newValue;
      const event = new Event('input', { bubbles: true });
      activeElement.dispatchEvent(event);
      activeElement.focus();
      activeElement.setSelectionRange(start + result.length, start + result.length);
    }
  };

  return {
    handlePluginClick,
    handleCopyResult,
    handleReplaceText,
  };
}; 