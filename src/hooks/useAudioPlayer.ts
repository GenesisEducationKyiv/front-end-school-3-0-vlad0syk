import { useRef, useState, useEffect, useCallback } from 'react';
import { Track } from '../types';

interface UseAudioPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

export const useAudioPlayer = ({ track, isPlaying, onPlayToggle }: UseAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  // Update audio source when track changes
  useEffect(() => {
    if (track?.audioFile) {
      setAudioSrc(track.audioFile);
    }
    return () => {
      // Cleanup if needed
    };
  }, [track]);

  // Handle play/pause based on isPlaying prop
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        onPlayToggle();
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, onPlayToggle]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    if (duration) {
      const progress = (currentTime / duration) * 100;
      setAudioProgress(progress);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setAudioProgress(0);
    onPlayToggle();
  }, [onPlayToggle]);

  return {
    audioRef,
    audioProgress,
    audioSrc,
    handleTimeUpdate,
    handleAudioEnded,
  };
};
