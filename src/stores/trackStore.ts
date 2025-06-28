import { create } from 'zustand';
import { TrackIdType } from '../types';

interface TrackState {
  // Track selections
  selectedTrackIds: Set<TrackIdType>;
  
  // Playing state
  playingTrackId: TrackIdType | null;
  
  // Search and filter terms
  searchTerm: string;
  artistFilterTerm: string;
  
  // Actions
  selectTrack: (id: TrackIdType) => void;
  deselectTrack: (id: TrackIdType) => void;
  clearSelections: () => void;
  setPlayingTrack: (id: TrackIdType | null) => void;
  setSearchTerm: (term: string) => void;
  setArtistFilterTerm: (term: string) => void;
  clearSearchTerms: () => void;
}

export const useTrackStore = create<TrackState>((set) => ({
  // Initial state
  selectedTrackIds: new Set(),
  playingTrackId: null,
  searchTerm: '',
  artistFilterTerm: '',
  
  // Actions
  selectTrack: (id: TrackIdType) => set((state) => {
    const newSelectedIds = new Set(state.selectedTrackIds);
    newSelectedIds.add(id);
    return { selectedTrackIds: newSelectedIds };
  }),
  
  deselectTrack: (id: TrackIdType) => set((state) => {
    const newSelectedIds = new Set(state.selectedTrackIds);
    newSelectedIds.delete(id);
    return { selectedTrackIds: newSelectedIds };
  }),
  
  clearSelections: () => set({ selectedTrackIds: new Set() }),
  
  setPlayingTrack: (id: TrackIdType | null) => set({ playingTrackId: id }),
  
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  
  setArtistFilterTerm: (term: string) => set({ artistFilterTerm: term }),
  
  clearSearchTerms: () => set({ 
    searchTerm: '', 
    artistFilterTerm: '' 
  })
})); 