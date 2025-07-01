import React from 'react';
import { Track } from '../../types';
import { useAudioPlayer } from '../../lib/useAudioPlayer';

interface AudioPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ track, isPlaying, onPlayToggle }) => {
  const { audioRef, audioProgress, audioSrc, handleTimeUpdate, handleAudioEnded } = useAudioPlayer(
    track,
    isPlaying,
    onPlayToggle
  );

  return (
    <audio
      ref={audioRef}
      src={audioSrc}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleAudioEnded}
    />
  );
};

export default AudioPlayer; 