import type { FeaturePlugin } from '../../types/features';
import type { Background } from '../../components/BGSelector/types';

export interface FloatingUIExpandedProps {
  position: { x: number; y: number };
  theme: string;
  currentBg: { id: string; value: string; name: string };
  selectionWidth?: number;
  containerRef: React.RefObject<HTMLDivElement>;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, element: HTMLDivElement) => void;
  plugins: FeaturePlugin[];
  activePlugin: string | null;
  isExecuting: boolean;
  showBgSelector: boolean;
  background: Background['id'];
  setBackground: (id: Background['id']) => void;
  onClose: () => void;
  onPluginClick: (pluginId: string) => void;
  getPluginIcon: (pluginId: string) => React.ReactNode;
  result: string;
  error: string | null;
  activeElement: HTMLInputElement | HTMLTextAreaElement | null;
  onCopy: () => void;
  onReplace: () => void;
} 