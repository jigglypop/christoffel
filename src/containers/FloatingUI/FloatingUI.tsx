import React, { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import styles from './FloatingUI.module.css';
import { getOpenAICompletion } from '../../services/openai';
import type { FeaturePlugin, FeatureResult } from '../../types/features';
import { BackgroundSelector } from '../../components/BGSelector';
import { backgrounds } from '../../components/BGSelector/constants';
import { floatingPositionAtom, floatingBackgroundAtom } from '../../atoms/chatAtoms';
import { useResize } from '../../hooks/useResize';
import type { Message } from './types';

interface FloatingUIProps {
  selectedText: string;
  onClose: () => void;
  onExecutePlugin: (pluginId: string, text: string) => Promise<FeatureResult>;
  activeElement?: HTMLInputElement | HTMLTextAreaElement | null;
  selectionWidth?: number;
}

const FloatingUI: React.FC<FloatingUIProps> = ({ selectedText, onClose, onExecutePlugin, activeElement, selectionWidth }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activePlugin, setActivePlugin] = useState<string | null>(null);
  const [plugins, setPlugins] = useState<FeaturePlugin[]>([]);
  const [position] = useAtom(floatingPositionAtom);
  const [background, setBackground] = useAtom(floatingBackgroundAtom);
  const [showBgSelector, setShowBgSelector] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  // 드래그 기능을 위한 useResize 훅 사용
  const { handleMouseDown } = useResize(true);

  const currentBg = backgrounds.find(bg => bg.id === background) || backgrounds[0];
  const isDarkTheme = ['gradient6'].includes(background); // 검정색만 다크 테마로 처리

  // 컨테이너 너비 모니터링
  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        const actualWidth = containerRef.current.offsetWidth;
        // 180px 미만이면 배경 선택기 숨김 (최소 너비와 동일)
        setShowBgSelector(actualWidth >= 180);
      }
    };

    checkWidth();
    const resizeObserver = new ResizeObserver(checkWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadPlugins = () => {
      if (chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'GET_ALL_PLUGINS' }, (response) => {
          if (!chrome.runtime.lastError && response) {
            // 활성화된 플러그인만 필터링
            const enabledPlugins = response.filter((p: FeaturePlugin) => p.enabled);
            setPlugins(enabledPlugins);
          }
        });
      }
    };

    loadPlugins();

    // storage 변경 감지
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'sync' && (changes.plugin_states || changes.plugin_prompts)) {
        loadPlugins();
      }
    };

    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    return () => {
      if (chrome?.storage?.onChanged) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setIsExpanded(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePluginClick = async (pluginId: string) => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    setError(null);
    setResult('');
    setActivePlugin(pluginId);
    
    try {
      const result = await onExecutePlugin(pluginId, selectedText);
      if (result.success) {
        setResult(result.data || '작업을 완료했습니다.');
      } else {
        throw new Error(result.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  const getPromptForPlugin = (plugin: FeaturePlugin, text: string): string => {
    const promptTemplate = plugin.customPrompt || plugin.defaultPrompt || '다음 텍스트를 처리해주세요: {text}';
    return promptTemplate.replace('{text}', text);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
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
      // 이벤트 발생시켜 React 등의 상태 업데이트 트리거
      const event = new Event('input', { bubbles: true });
      activeElement.dispatchEvent(event);
      
      // 포커스 복원
      activeElement.focus();
      activeElement.setSelectionRange(start + result.length, start + result.length);
    }
  };
  const getPluginIcon = (pluginId: string) => {
    switch (pluginId) {
      case 'summarize':
        return <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/>;
      case 'translate':
        return <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>;
      case 'explain':
        return <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>;
      case 'rewrite':
        return <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>;
      default:
        return null;
    }
  };
  // 활성화된 플러그인이 없으면 컴팩트 모드도 표시하지 않음
  if (plugins.length === 0) {
    return null;
  }
  // 컴팩트 모드
  if (!isExpanded) {
    return (
      <div 
        ref={containerRef} 
        className={styles.compactContainer}
        style={{ 
          '--chat-bg': currentBg.value,
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
        } as React.CSSProperties}
        data-theme={isDarkTheme ? 'dark' : 'light'}
      >
        <button className={styles.compactButton} onClick={toggleExpanded} title="AI Assistant (Ctrl 키로도 열기)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isDarkTheme ? 'white' : '#1a1a1a'}>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
          </svg>
        </button>
        <span className={styles.tooltip}>AI 어시스턴트</span>
      </div>
    );
  }
  // 확장 모드
  return (
    <div 
      ref={containerRef} 
      className={styles.floatingContainer}
      style={{ 
        '--chat-bg': currentBg.value,
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: selectionWidth ? `${selectionWidth}px` : 'auto',
      } as React.CSSProperties}
      data-theme={isDarkTheme ? 'dark' : 'light'}
    >
      {/* 한 줄 푸터: 좌측 플러그인, 우측 테마/닫기 */}
      <div 
        className={styles.floatingFooter}
        onMouseDown={(e) => {
          // 버튼 클릭 시에는 드래그하지 않음
          const target = e.target as HTMLElement;
          if (target.closest('button') || target.closest(`.${styles.bgSelectorWrapper}`)) {
            return;
          }
          handleMouseDown(e, containerRef.current!);
        }}
        style={{ cursor: 'move' }}
      >
        <div className={styles.footerLeft}>
          {plugins.map((plugin) => (
            <button 
              key={plugin.id}
              className={`${styles.floatingBtn} ${activePlugin === plugin.id ? styles.active : ''}`}
              onClick={() => handlePluginClick(plugin.id)} 
              disabled={isExecuting}
              title={plugin.name}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                {getPluginIcon(plugin.id)}
              </svg>
            </button>
          ))}
        </div>
        <div className={styles.footerRight}>
          {showBgSelector && (
            <div className={styles.bgSelectorWrapper}>
              <BackgroundSelector background={background} setBackground={setBackground} />
            </div>
          )}
          <button className={styles.closeBtn} onClick={onClose} title="닫기">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* 결과 영역 */}
      {(result || error || isExecuting) && (
        <div className={styles.resultArea}>
          {isExecuting && <div className={styles.loading}>처리 중...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {result && !isExecuting && (
            <div className={styles.resultContent}>
              <div className={styles.resultText}>{result}</div>
              <div className={styles.resultActions}>
                <button className={styles.actionBtn} onClick={handleCopyResult} title="복사">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                </button>
                {activeElement && (
                  <button className={styles.actionBtn} onClick={handleReplaceText} title="텍스트 교체">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingUI; 