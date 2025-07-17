import { useAtom } from 'jotai';
import { floatingPositionAtom } from '../../atoms/chatAtoms';
import { useState, useCallback, useEffect } from 'react';

export const useResize = (isFloating = false) => {
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [position, setPosition] = useAtom(isFloating ? floatingPositionAtom : floatingPositionAtom);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0, direction: '' });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>, container: HTMLDivElement) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = container.getBoundingClientRect();
    const border = 10;
    let direction = '';

    if (e.clientX < rect.left + border) direction += 'w';
    if (e.clientX > rect.right - border) direction += 'e';
    if (e.clientY < rect.top + border) direction += 'n';
    if (e.clientY > rect.bottom - border) direction += 's';
    
    if (direction) {
      setIsResizing(true);
      setResizeStart({ width: size.width, height: size.height, x: e.clientX, y: e.clientY, direction });
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [position.x, position.y, size.width, size.height]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = position.x;
      let newY = position.y;

      if (resizeStart.direction.includes('e')) newWidth = resizeStart.width + deltaX;
      if (resizeStart.direction.includes('w')) {
        newWidth = resizeStart.width - deltaX;
        newX = position.x + deltaX;
      }
      if (resizeStart.direction.includes('s')) newHeight = resizeStart.height + deltaY;
      if (resizeStart.direction.includes('n')) {
        newHeight = resizeStart.height - deltaY;
        newY = position.y + deltaY;
      }
      
      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
    
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({
        x: newX,
        y: newY,
      });
    }
  }, [isDragging, isResizing, dragStart, resizeStart, position, setPosition, setSize]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return { handleMouseDown, handleMouseUp, isDragging, isResizing };
};