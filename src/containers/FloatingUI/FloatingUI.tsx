import React, { useRef } from 'react';
import { useAtom } from 'jotai';
import type { FloatingUIProps } from './types';
import { backgrounds } from '../../components/BGSelector/constants';
import { floatingPositionAtom, floatingBackgroundAtom } from '../../atoms/chatAtoms';
import { useResize } from '../../hooks/useResize';
import { useFloatingUIState } from '../../hooks/useFloatingUIState';
import { usePlugins } from '../../hooks/usePlugins';
import { useUIEffects } from '../../hooks/useUIEffects';
import { useEventHandlers } from '../../hooks/useEventHandlers';
import { FloatingUICompact } from '../../components/FloatingUICompact';
import { FloatingUIExpanded } from '../../components/FloatingUIExpanded';

const FloatingUI: React.FC<FloatingUIProps> = ({
  selectedText,
  onClose,
  onExecutePlugin,
  activeElement,
  selectionWidth,
}) => {
  const containerRef = useRef<HTMLDivElement>(null!);
  const [position] = useAtom(floatingPositionAtom);
  const [background, setBackground] = useAtom(floatingBackgroundAtom);

  const {
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
  } = useFloatingUIState();

  const plugins = usePlugins();
  const { showBgSelector } = useUIEffects(containerRef, setIsExpanded);
  const { handleMouseDown } = useResize(true);

  const { handlePluginClick, handleCopyResult, handleReplaceText } = useEventHandlers({
    isExecuting,
    selectedText,
    result,
    activeElement: activeElement || null,
    onExecutePlugin,
    setIsExecuting,
    setResult,
    setError,
    setActivePlugin,
  });

  const currentBg = backgrounds.find((bg) => bg.id === background) || backgrounds[0];
  const isDarkTheme = ['gradient6'].includes(background);

  const getPluginIcon = (pluginId: string) => {
    switch (pluginId) {
      case 'summarize':
        return <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z" />;
      case 'translate':
        return <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />;
      case 'explain':
        return <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />;
      case 'rewrite':
        return <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />;
      default:
        return null;
    }
  };

  if (plugins.length === 0) {
    return null;
  }

  if (!isExpanded) {
    return (
      <FloatingUICompact
        position={position}
        theme={isDarkTheme ? 'dark' : 'light'}
        currentBg={currentBg}
        onToggleExpand={toggleExpanded}
      />
    );
  }

  return (
    <FloatingUIExpanded
      position={position}
      theme={isDarkTheme ? 'dark' : 'light'}
      currentBg={currentBg}
      selectionWidth={selectionWidth}
      containerRef={containerRef}
      handleMouseDown={handleMouseDown}
      plugins={plugins}
      activePlugin={activePlugin}
      isExecuting={isExecuting}
      showBgSelector={showBgSelector}
      background={background}
      setBackground={setBackground}
      onClose={onClose}
      onPluginClick={handlePluginClick}
      getPluginIcon={getPluginIcon}
      result={result}
      error={error}
      activeElement={activeElement || null}
      onCopy={handleCopyResult}
      onReplace={handleReplaceText}
    />
  );
};

export default FloatingUI; 