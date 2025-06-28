import { create } from 'zustand';

interface UIState {
  // Modal states
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isConfirmDialogOpen: boolean;
  
  // Modal data
  trackToEditId: string | null;
  confirmDialogMessage: string;
  pendingDeleteContext: { type: 'track'; id: string | string[] } | { type: 'file'; id: string } | null;
  
  // Loading states
  isControlsLoading: boolean;
  
  // Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (trackId: string) => void;
  closeEditModal: () => void;
  openConfirmDialog: (message: string, context: { type: 'track'; id: string | string[] } | { type: 'file'; id: string }) => void;
  closeConfirmDialog: () => void;
  setControlsLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isConfirmDialogOpen: false,
  trackToEditId: null,
  confirmDialogMessage: '',
  pendingDeleteContext: null,
  isControlsLoading: false,
  
  // Actions
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  
  openEditModal: (trackId: string) => set({ 
    isEditModalOpen: true, 
    trackToEditId: trackId 
  }),
  closeEditModal: () => set({ 
    isEditModalOpen: false, 
    trackToEditId: null 
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