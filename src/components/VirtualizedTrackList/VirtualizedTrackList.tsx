import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import TrackItem from '../TrackItem/TrackItem';
import { Track } from '../../types';

interface VirtualizedTrackListProps {
  tracks: Track[];
  isLoading: boolean;
  height?: number;
  itemHeight?: number;
}

const TrackItemRenderer = memo(({ index, style, data }: {
  index: number;
  style: React.CSSProperties;
  data: Track[];
}) => {
  const track = data[index];
  
  if (!track) {
    return (
      <div style={style} className="p-2">
        <div className="track-item-skeleton"></div>
      </div>
    );
  }
  
  return (
    <div style={style}>
      <div className="p-2">
        <TrackItem
          track={track}
          testId={`track-item-${track.id}`}
        />
      </div>
    </div>
  );
});

TrackItemRenderer.displayName = 'TrackItemRenderer';

const VirtualizedTrackList: React.FC<VirtualizedTrackListProps> = memo(({
  tracks,
  isLoading,
  height = 600,
  itemHeight = 200,
}) => {
  const memoizedTracks = useMemo(() => tracks, [tracks]);
  
  const getItemKey = useCallback((index: number, data: Track[]) => {
    const track = data[index];
    return track?.id || `skeleton-${index}`;
  }, []);

  if (isLoading) {
    return (
      <div data-testid="loading-tracks" className="text-center text-gray-400 py-10">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p>Завантаження треків...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <p>Треків не знайдено.</p>
      </div>
    );
  }

  return (
    <div className="w-full" role="list" aria-label="Список треків">
      <List
        height={height}
        width="100%"
        itemCount={tracks.length}
        itemSize={itemHeight}
        itemData={memoizedTracks}
        itemKey={getItemKey}
        overscanCount={5}
        className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {TrackItemRenderer}
      </List>
    </div>
  );
});

VirtualizedTrackList.displayName = 'VirtualizedTrackList';

export default VirtualizedTrackList;
