import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const floatingPositionAtom = atom({ x: 0, y: 0 });
export const floatingBackgroundAtom = atom<string>('glass1');
export const christoffelOpenAtom = atom<boolean>(false);
export const isDraggingFloatingUIAtom = atom<boolean>(false);
export const userProfileAtom = atomWithStorage<string | null>('userProfile', null); 