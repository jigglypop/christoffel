import { useState, useEffect, RefObject } from 'react';

export const useUIEffects = (
  containerRef: RefObject<HTMLDivElement>,
  setIsExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
) => {
  const [showBgSelector, setShowBgSelector] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        const actualWidth = containerRef.current.offsetWidth;
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
  }, [containerRef]);

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
  }, [setIsExpanded]);

  return { showBgSelector };
}; 