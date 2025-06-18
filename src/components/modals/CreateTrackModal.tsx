import React from 'react';
import { CreateTrackDto, UpdateTrackDto, Genre } from '../../types';
import TrackFormModal from './TrackFormModal';

interface CreateTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTrackDto) => void;
    isSubmitting?: boolean;
    availableGenres: Genre[];
    isLoadingGenres?: boolean;
    isErrorGenres?: boolean;
}

const CreateTrackModal: React.FC<CreateTrackModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting = false,
    availableGenres,
    isLoadingGenres = false,
    isErrorGenres = false
}) => {
    const handleSubmit = (data: CreateTrackDto | UpdateTrackDto) => {
        onSubmit(data as CreateTrackDto);
    };

    return (
        <TrackFormModal
            mode="create"
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            availableGenres={availableGenres}
            isLoadingGenres={isLoadingGenres}
            isErrorGenres={isErrorGenres}
        />
    );
};

export default CreateTrackModal;