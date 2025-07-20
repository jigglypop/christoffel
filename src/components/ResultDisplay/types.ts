export interface ResultDisplayProps {
  result: string;
  error: string | null;
  isExecuting: boolean;
  activeElement: HTMLInputElement | HTMLTextAreaElement | null;
  onCopy: () => void;
  onReplace: () => void;
} 