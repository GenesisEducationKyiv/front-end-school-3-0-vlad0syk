import { create } from 'zustand';
import { Track } from '../types';

interface UIState {
  // Modal states
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isConfirmDialogOpen: boolean;
  
  // Modal data
  trackToEdit: Track | null;
  confirmDialogMessage: string;
  pendingDeleteContext: { type: 'track'; id: string | string[] } | { type: 'file'; id: string } | null;
  
  // Loading states
  isControlsLoading: boolean;
  
  // Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (track: Track) => void;
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
  trackToEdit: null,
  confirmDialogMessage: '',
  pendingDeleteContext: null,
  isControlsLoading: false,
  
  // Actions
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  
  openEditModal: (track: Track) => set({ 
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