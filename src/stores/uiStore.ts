import { create } from 'zustand';

interface UIState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isConfirmDialogOpen: boolean;
  
  trackToEdit: { id: string; slug: string } | null;
  confirmDialogMessage: string;
  pendingDeleteContext: { type: 'track'; id: string | string[] } | { type: 'file'; id: string } | null;
  
  isControlsLoading: boolean;
  
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (track: { id: string; slug: string }) => void;
  closeEditModal: () => void;
  openConfirmDialog: (message: string, context: { type: 'track'; id: string | string[] } | { type: 'file'; id: string }) => void;
  closeConfirmDialog: () => void;
  setControlsLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isConfirmDialogOpen: false,
  trackToEdit: null,
  confirmDialogMessage: '',
  pendingDeleteContext: null,
  isControlsLoading: false,
  
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  
  openEditModal: (track: { id: string; slug: string }) => set({ 
    isEditModalOpen: true, 
    trackToEdit: track 
  }),
  closeEditModal: () => set({ 
    isEditModalOpen: false, 
    trackToEdit: null 
  }),
  
  openConfirmDialog: (message: string, context: { type: 'track'; id: string | string[] } | { type: 'file'; id: string }) => set({
    isConfirmDialogOpen: true,
    confirmDialogMessage: message,
    pendingDeleteContext: context
  }),
  closeConfirmDialog: () => set({
    isConfirmDialogOpen: false,
    confirmDialogMessage: '',
    pendingDeleteContext: null
  }),
  
  setControlsLoading: (loading: boolean) => set({ isControlsLoading: loading })
})); 