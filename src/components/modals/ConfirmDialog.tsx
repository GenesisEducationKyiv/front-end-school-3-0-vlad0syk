import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
    isConfirming?: boolean;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    message,
    isConfirming = false,
    confirmButtonText = 'Видалити',
    cancelButtonText = 'Скасувати',
}) => {
    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isConfirming) {
            // onClose();
        }
    };

    const handleCancelClick = () => {
        if (!isConfirming) {
            onClose();
        }
    };

    const handleConfirmClick = () => {
        if (!isConfirming) {
            onConfirm();
        }
    };

    return (
        <div
            data-testid="confirm-dialog-overlay"
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div
                data-testid="confirm-dialog"
                className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full max-w-sm relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl"
                    onClick={handleCancelClick}
                    disabled={isConfirming}
                    aria-label="Close dialog"
                >
                    &times;
                </button>

                <p className="text-lg mb-6">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        data-testid="cancel-button"
                        type="button"
                        onClick={handleCancelClick}
                        disabled={isConfirming}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelButtonText}
                    </button>
                    <button
                        data-testid="confirm-button"
                        type="button"
                        onClick={handleConfirmClick}
                        disabled={isConfirming}
                        className={`
                            px-4 py-2 rounded-md text-white font-semibold transition-colors
                            ${isConfirming ? 'bg-gray-500' : 'bg-red-600 hover:bg-red-700'}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {isConfirming ? 'Виконання...' : confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
