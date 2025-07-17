export interface Message {
  type: 'SELECTION_CHANGED' | 'COMMAND'
  payload?: {
    selectedText?: string
    position?: { x: number; y: number }
    command?: string
  }
}

export interface SelectionInfo {
  text: string
  position: { x: number; y: number }
} 