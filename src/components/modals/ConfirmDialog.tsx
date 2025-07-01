import React from 'react';
import { gql, useMutation } from '@apollo/client';

const DELETE_TRACK_MUTATION = gql`
  mutation DeleteTrack($id: ID!) {
    deleteTrack(id: $id)
  }
`;

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    trackId: string;
    onDeleted?: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    trackId,
    onDeleted,
}) => {
    const [deleteTrack, { loading }] = useMutation(DELETE_TRACK_MUTATION);

    const handleDelete = async () => {
        await deleteTrack({ variables: { id: trackId }, refetchQueries: ['Tracks'] });
        if (onDeleted) onDeleted();
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <h2 className="text-2xl font-bold mb-4">Видалити трек?</h2>
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Скасувати</button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Видалення...' : 'Видалити'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
