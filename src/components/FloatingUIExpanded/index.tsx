import React from 'react';
import type { FloatingUIExpandedProps } from './types';
import styles from './FloatingUIExpanded.module.css';
import { BackgroundSelector } from '../BGSelector';
import { PluginBar } from '../PluginBar';
import { ResultDisplay } from '../ResultDisplay';

export const FloatingUIExpanded: React.FC<FloatingUIExpandedProps> = ({
  position,
  theme,
  currentBg,
  selectionWidth,
  containerRef,
  handleMouseDown,
  plugins,
  activePlugin,
  isExecuting,
  showBgSelector,
  background,
  setBackground,
  onClose,
  onPluginClick,
  getPluginIcon,
  result,
  error,
  activeElement,
  onCopy,
  onReplace,
}) => {
  const isLoading = isExecuting || (!error && !result);

  return (
    <div
      ref={containerRef}
      className={`${styles.floatingContainer} ${isLoading ? styles.loading : ''}`}
      style={{
        '--chat-bg': currentBg.value,
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
      } as React.CSSProperties}
      data-theme={theme}
    >
      <div
        className={styles.floatingFooter}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('button') || target.closest(`.${styles.bgSelectorWrapper}`)) {
            return;
          }
          handleMouseDown(e, containerRef.current!);
        }}
        style={{ cursor: 'move' }}
      >
        <div className={styles.footerLeft}>
          <PluginBar
            plugins={plugins}
            activePlugin={activePlugin}
            isExecuting={isExecuting}
            onPluginClick={onPluginClick}
            getPluginIcon={getPluginIcon}
          />
        </div>
        <div className={styles.footerRight}>
          {showBgSelector && (
            <div className={styles.bgSelectorWrapper}>
              <BackgroundSelector background={background} setBackground={setBackground} />
            </div>
          )}
          <button className={styles.closeBtn} onClick={onClose} title="닫기">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </div>

      <ResultDisplay
        result={result}
        error={error}
        isExecuting={isExecuting}
        activeElement={activeElement}
        onCopy={onCopy}
        onReplace={onReplace}
      />
    </div>
  );
}; 