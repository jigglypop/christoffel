export interface FloatingUICompactProps {
  position: { x: number; y: number };
  theme: string;
  currentBg: { id: string; value: string; name: string };
  onToggleExpand: () => void;
} 