import { MutableRefObject } from 'react';
import { Track } from '../types/track';

// Type definitions for useAudioPlayer hook
interface UseAudioPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

declare const useAudioPlayer: (props: UseAudioPlayerProps) => {
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  audioProgress: number;
  audioSrc: string | null;
  handleTimeUpdate: () => void;
  handleAudioEnded: () => void;
};

export { useAudioPlayer, UseAudioPlayerProps };
