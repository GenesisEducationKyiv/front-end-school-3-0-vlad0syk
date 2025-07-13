import React from 'react';
import TrackFormModal from './TrackFormModal';

interface EditTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
    trackToEditSlug: string;
}

const EditTrackModal: React.FC<EditTrackModalProps> = ({ isOpen, onClose, trackToEditSlug }) => (
    <TrackFormModal
        mode="edit"
        isOpen={isOpen}
        onClose={onClose}
        trackToEditSlug={trackToEditSlug}
    />
);

export default EditTrackModal;