import React from 'react';

// Props for the confirmation dialog component
interface ConfirmDialogProps {
    isOpen: boolean; // Controls dialog visibility
    onClose: () => void; // Handler for closing the dialog
    onConfirm: () => void; // Handler for confirming the action
    message: string; // Message text
    isConfirming?: boolean; // State indicating if confirmation action is in progress
    confirmButtonText?: string; // Custom text for the confirm button
    cancelButtonText?: string; // Custom text for the cancel button
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
    // Render nothing if dialog is not open
    if (!isOpen) {
        return null;
    }

    // Handler to prevent closing by clicking on overlay while action is confirming
     const handleOverlayClick = (e: React.MouseEvent) => {
         if (e.target === e.currentTarget && !isConfirming) {
             // onClose(); // Uncomment to allow closing on overlay click
         }
     };

    // Handler for Cancel button and close icon
    const handleCancelClick = () => {
        // Prevent closing if confirmation is in progress
        if (!isConfirming) {
            onClose();
        }
    };

    // Handler for Confirm button
    const handleConfirmClick = () => {
         // Prevent multiple clicks if action is in progress
         if (!isConfirming) {
             onConfirm();
         }
    };

    return (
        // Overlay and dialog container
        <div
            data-testid="confirm-dialog-overlay" // For testing
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick} // Handles overlay clicks
        >
            {/* Dialog box */}
            <div
                data-testid="confirm-dialog" // For testing
                className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full max-w-sm relative"
                onClick={e => e.stopPropagation()} // Prevent click propagation inside dialog
            >
                {/* Close button */}
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl"
                    onClick={handleCancelClick} // Uses cancel handler
                    disabled={isConfirming} // Disabled while confirming
                    aria-label="Close dialog"
                >
                    &times;
                </button>

                {/* Message text */}
                <p className="text-lg mb-6">{message}</p>

                {/* Action buttons */}
                <div className="flex justify-end gap-3">
                    {/* Cancel button */}
                    <button
                        data-testid="cancel-button" // For testing
                        type="button"
                        onClick={handleCancelClick} // Cancel handler
                        disabled={isConfirming} // Disabled while confirming
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelButtonText}
                    </button>
                    {/* Confirm button */}
                    <button
                        data-testid="confirm-button" // For testing
                        type="button"
                        onClick={handleConfirmClick} // Confirm handler
                        disabled={isConfirming} // Disabled while confirming
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