import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Track } from '../types';
import { isHTMLAudioElement } from '../lib/tg';

const API_BASE_URL = 'http://localhost:8000';

export const useAudioPlayer = (
    track: Track,
    isPlaying: boolean,
    onPlayToggle: (id: Track['id']) => void
) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [audioProgress, setAudioProgress] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            if (isPlaying) {
                audio.play().catch(error => {
                    console.error(`Playback error for track ${track.id}:`, error);
                    toast.error(`Failed to play track ${track.title}.`);
                });
            } else {
                audio.pause();
            }
        }
    }, [isPlaying, track.id, track.title]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleLoadedMetadata = () => {
                setAudioProgress(0);
            };
            audio.addEventListener('loadedmetadata', handleLoadedMetadata);
            setAudioProgress(0);

            return () => {
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [track.id, track.audioFile]);

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
        if (isHTMLAudioElement(e.currentTarget)) {
            const audio = e.currentTarget;
            if (!isNaN(audio.duration) && audio.duration > 0) {
                const progress = (audio.currentTime / audio.duration) * 100;
                setAudioProgress(progress);
            } else {
                setAudioProgress(0);
            }
        }
    };

    const handleAudioEnded = () => {
        onPlayToggle(track.id);
        setAudioProgress(0);
    };

    const audioSrc = track.audioFile ? `${API_BASE_URL}/api/files/${track.audioFile}` : '';

    return {
        audioRef,
        audioProgress,
        audioSrc,
        handleTimeUpdate,
        handleAudioEnded
    };
};