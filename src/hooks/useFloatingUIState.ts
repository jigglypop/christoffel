import { useState } from 'react';

export const useFloatingUIState = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activePlugin, setActivePlugin] = useState<string | null>(null);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return {
    isExpanded,
    setIsExpanded,
    isExecuting,
    setIsExecuting,
    result,
    setResult,
    error,
    setError,
    activePlugin,
    setActivePlugin,
    toggleExpanded,
  };
}; 