import React from 'react';
import { Track, CreateTrackDto, UpdateTrackDto, Genre } from '../../types';
import TrackFormModal from './TrackFormModal';

interface EditTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: UpdateTrackDto) => void;
    trackToEdit: Track | null;
    isSaving?: boolean;
    availableGenres: Genre[];
    isLoadingGenres?: boolean;
    isErrorGenres?: boolean;
}

const EditTrackModal: React.FC<EditTrackModalProps> = ({
    isOpen,
    onClose,
    onSave,
    trackToEdit,
    isSaving = false,
    availableGenres,
    isLoadingGenres = false,
    isErrorGenres = false
}) => {
    const handleSubmit = (data: CreateTrackDto | UpdateTrackDto) => {
        onSave(data as UpdateTrackDto);
    };

    return (
        <TrackFormModal
            mode="edit"
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            trackToEdit={trackToEdit}
            isSubmitting={isSaving}
            availableGenres={availableGenres}
            isLoadingGenres={isLoadingGenres}
            isErrorGenres={isErrorGenres}
        />
    );
};

export default EditTrackModal;