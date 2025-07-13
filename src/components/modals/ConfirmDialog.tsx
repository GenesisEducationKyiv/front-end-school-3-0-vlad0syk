import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { useTrackStore } from '../../stores/trackStore';

const DELETE_TRACK_MUTATION = gql`
  mutation DeleteTrack($id: ID!) {
    deleteTrack(id: $id)
  }
`;

const BATCH_DELETE_TRACKS_MUTATION = gql`
  mutation DeleteTracks($ids: [ID!]!) {
    deleteTracks(ids: $ids) {
      success
      failed
    }
  }
`;

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    trackId?: string;
    trackIds?: string[];
    onDeleted?: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    trackId,
    trackIds,
    onDeleted,
}) => {
    const [deleteTrack, { loading: deletingOne }] = useMutation(DELETE_TRACK_MUTATION);
    const [deleteMultipleTracks, { loading: deletingMultiple }] = useMutation(BATCH_DELETE_TRACKS_MUTATION);
    const clearSelections = useTrackStore(state => state.clearSelections);

    const isMultipleDelete = trackIds && trackIds.length > 1;
    const loading = deletingOne || deletingMultiple;

    const handleDelete = async () => {
        try {
            if (isMultipleDelete) {
                await deleteMultipleTracks({ 
                    variables: { ids: trackIds }, 
                    refetchQueries: ['Tracks'] 
                });
                // Очищуємо вибрані треки після успішного видалення
                clearSelections();
                toast.success(`Успішно видалено ${trackIds!.length} треків!`);
            } else {
                const id = trackId || (trackIds && trackIds[0]);
                if (id) {
                    await deleteTrack({ 
                        variables: { id }, 
                        refetchQueries: ['Tracks'] 
                    });
                    toast.success('Трек успішно видалено!');
                }
            }
            if (onDeleted) onDeleted();
            onClose();
        } catch (error) {
            console.error('Помилка видалення:', error);
            toast.error('Помилка при видаленні треку');
        }
    };

    if (!isOpen) {
        return null;
    }

    const trackCount = isMultipleDelete ? trackIds!.length : 1;
    const title = trackCount > 1 ? `Видалити ${trackCount} треків?` : 'Видалити трек?';
    const confirmText = trackCount > 1 ? `Видалити ${trackCount} треків` : 'Видалити';

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Скасувати</button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Видалення...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
