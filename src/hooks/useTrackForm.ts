import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Track, CreateTrackDto, UpdateTrackDto } from '../types';
import { fetchTrackById } from '../services/api/track';
import { z } from 'zod';

export interface TrackFormData {
    title: string;
    artist: string;
    genres: string[];
    album?: string;
    coverImage?: string;
}

interface UseTrackFormProps {
    mode: 'create' | 'edit';
    isOpen: boolean;
    trackToEditId?: string | null;
    onSubmit: (data: CreateTrackDto | UpdateTrackDto) => void;
    onClose: () => void;
}

const TrackFormSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    artist: z.string().min(1, 'Artist is required'),
    genres: z.array(z.string()).min(1, 'At least one genre is required'),
    album: z.string().optional(),
    coverImage: z.string().optional(),
});

export const useTrackForm = ({ mode, isOpen, trackToEditId, onSubmit, onClose }: UseTrackFormProps) => {
    const isEditMode = mode === 'edit';
    const [trackToEdit, setTrackToEdit] = useState<Track | null>(null);
    const [isLoadingTrack, setIsLoadingTrack] = useState(false);
    
    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<TrackFormData>({
        resolver: zodResolver(TrackFormSchema),
        defaultValues: {
            title: '',
            artist: '',
            album: '',
            genres: [],
            coverImage: ''
        }
    });

    const genres = watch('genres') || [];

    useEffect(() => {
        if (isOpen && isEditMode && trackToEditId) {
            setIsLoadingTrack(true);
            fetchTrackById(trackToEditId)
                .then(result => {
                    if (result.isOk()) {
                        setTrackToEdit(result.value);
                    } else {
                        console.error('Failed to fetch track:', result.error);
                        onClose();
                    }
                })
                .catch(error => {
                    console.error('Error fetching track:', error);
                    onClose();
                })
                .finally(() => {
                    setIsLoadingTrack(false);
                });
        } else {
            setTrackToEdit(null);
        }
    }, [isOpen, trackToEditId, isEditMode, onClose]);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && trackToEdit) {
                reset({
                    title: trackToEdit.title,
                    artist: trackToEdit.artist,
                    album: trackToEdit.album || '',
                    genres: trackToEdit.genres ?? [],
                    coverImage: trackToEdit.coverImage || ''
                });
            } else {
                reset({
                    title: '',
                    artist: '',
                    album: '',
                    genres: [],
                    coverImage: ''
                });
            }
        }
    }, [isOpen, trackToEdit, isEditMode, reset]);

    const handleAddGenre = (selectedGenre: string) => {
        if (selectedGenre && !genres.includes(selectedGenre)) {
            setValue('genres', [...genres, selectedGenre]);
        }
    };

    const handleRemoveGenre = (genreToRemove: string) => {
        setValue('genres', genres.filter(genre => genre !== genreToRemove));
    };

    const onSubmitForm = (formData: TrackFormData) => {
        if (isEditMode && trackToEdit) {
            const currentFormData = {
                title: formData.title?.trim(),
                artist: formData.artist?.trim(),
                album: formData.album?.trim(),
                genres: formData.genres || [],
                coverImage: formData.coverImage?.trim(),
            };

            const updatedData: UpdateTrackDto = {};

            if (currentFormData.title !== trackToEdit.title) {
                updatedData.title = currentFormData.title;
            }
            if (currentFormData.artist !== trackToEdit.artist) {
                updatedData.artist = currentFormData.artist;
            }

            const currentAlbum = currentFormData.album || '';
            const originalAlbum = trackToEdit.album || '';
            if (currentAlbum !== originalAlbum) {
                updatedData.album = currentFormData.album;
            }

            const sortedCurrentGenres = [...currentFormData.genres].sort();
            const sortedOriginalGenres = [...(trackToEdit.genres || [])].sort();
            if (JSON.stringify(sortedCurrentGenres) !== JSON.stringify(sortedOriginalGenres)) {
                updatedData.genres = currentFormData.genres;
            }

            const currentCoverImage = currentFormData.coverImage || '';
            const originalCoverImage = trackToEdit.coverImage || '';
            if (currentCoverImage !== originalCoverImage) {
                updatedData.coverImage = currentFormData.coverImage;
            }

            if (Object.keys(updatedData).length > 0) {
                console.log("Submitting updates:", updatedData);
                onSubmit(updatedData);
            } else {
                console.log("No changes to save.");
                onClose();
            }
        } else {
            const createData: CreateTrackDto = {
                title: formData.title,
                artist: formData.artist,
                album: formData.album || '',
                genres: formData.genres,
                coverImage: formData.coverImage || ''
            };
            onSubmit(createData);
            reset();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return {
        control,
        handleSubmit: handleSubmit(onSubmitForm),
        errors,
        genres,
        handleAddGenre,
        handleRemoveGenre,
        handleOverlayClick,
        Controller,
        isLoadingTrack
    };
};