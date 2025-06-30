import React from 'react';
import { CreateTrackDto, UpdateTrackDto, Genre } from '../../types';
import TrackFormModal from './TrackFormModal';

interface EditTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: UpdateTrackDto) => void;
    trackToEditSlug: string | null;
    isSaving?: boolean;
    availableGenres: Genre[];
    isLoadingGenres?: boolean;
    isErrorGenres?: boolean;
}

const EditTrackModal: React.FC<EditTrackModalProps> = ({
    isOpen,
    onClose,
    onSave,
    trackToEditSlug,
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
            trackToEditSlug={trackToEditSlug}
            isSubmitting={isSaving}
            availableGenres={availableGenres}
            isLoadingGenres={isLoadingGenres}
            isErrorGenres={isErrorGenres}
        />
    );
};

export default EditTrackModal;