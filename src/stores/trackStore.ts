import { create } from 'zustand';
import { Track } from '../types';

interface TrackState {
  // Track selections
  selectedTrackIds: Set<Track['id']>;
  
  // Playing state
  playingTrackId: Track['id'] | null;
  
  // Search and filter terms
  searchTerm: string;
  artistFilterTerm: string;
  
  // Actions
  selectTrack: (id: Track['id']) => void;
  deselectTrack: (id: Track['id']) => void;
  clearSelections: () => void;
  setPlayingTrack: (id: Track['id'] | null) => void;
  setSearchTerm: (term: string) => void;
  setArtistFilterTerm: (term: string) => void;
  clearSearchTerms: () => void;
}

export const useTrackStore = create<TrackState>((set, get) => ({
  // Initial state
  selectedTrackIds: new Set(),
  playingTrackId: null,
  searchTerm: '',
  artistFilterTerm: '',
  
  // Actions
  selectTrack: (id: Track['id']) => set((state) => {
    const newSelectedIds = new Set(state.selectedTrackIds);
    newSelectedIds.add(id);
    return { selectedTrackIds: newSelectedIds };
  }),
  
  deselectTrack: (id: Track['id']) => set((state) => {
    const newSelectedIds = new Set(state.selectedTrackIds);
    newSelectedIds.delete(id);
    return { selectedTrackIds: newSelectedIds };
  }),
  
  clearSelections: () => set({ selectedTrackIds: new Set() }),
  
  setPlayingTrack: (id: Track['id'] | null) => set({ playingTrackId: id }),
  
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  
  setArtistFilterTerm: (term: string) => set({ artistFilterTerm: term }),
  
  clearSearchTerms: () => set({ 
    searchTerm: '', 
    artistFilterTerm: '' 
  })
})); 