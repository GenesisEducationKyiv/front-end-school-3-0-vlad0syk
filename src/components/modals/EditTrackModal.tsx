import React from 'react';
import TrackFormModal from './TrackFormModal';

interface EditTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
    trackToEditId: string;
}

const EditTrackModal: React.FC<EditTrackModalProps> = ({ isOpen, onClose, trackToEditId }) => (
    <TrackFormModal
        mode="edit"
        isOpen={isOpen}
        onClose={onClose}
        trackToEditId={trackToEditId}
    />
);

export default EditTrackModal;