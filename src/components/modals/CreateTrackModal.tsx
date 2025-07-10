import React from 'react';
import TrackFormModal from './TrackFormModal';

interface CreateTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateTrackModal: React.FC<CreateTrackModalProps> = ({ isOpen, onClose }) => (
    <TrackFormModal mode="create" isOpen={isOpen} onClose={onClose} />
);

export default CreateTrackModal;