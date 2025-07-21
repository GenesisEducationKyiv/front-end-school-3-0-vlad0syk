import { create } from 'zustand';
import { TrackIdType } from '../types';

interface TrackState {
  selectedTrackIds: Set<TrackIdType>;
  playingTrackId: TrackIdType | null;
  searchTerm: string;
  artistFilterTerm: string;
  selectTrack: (id: TrackIdType) => void;
  deselectTrack: (id: TrackIdType) => void;
  clearSelections: () => void;
  setPlayingTrack: (id: TrackIdType | null) => void;
  setSearchTerm: (term: string) => void;
  setArtistFilterTerm: (term: string) => void;
  clearSearchTerms: () => void;
  isTrackSelected: (id: TrackIdType) => boolean;
  isTrackPlaying: (id: TrackIdType) => boolean;
}

export const useTrackStore = create<TrackState>((set, get) => ({
  selectedTrackIds: new Set(),
  playingTrackId: null,
  searchTerm: '',
  artistFilterTerm: '',
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
  }),

  isTrackSelected: (id: TrackIdType) => get().selectedTrackIds.has(id),
  
  isTrackPlaying: (id: TrackIdType) => get().playingTrackId === id
})); 