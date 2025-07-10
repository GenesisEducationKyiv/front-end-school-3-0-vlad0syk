import React from 'react';
import { Track } from '../../types';
import TrackItem from '../TrackItem/TrackItem';
import { useTracksQuery } from '../../hooks/useTrackQueries';

interface TrackListProps {
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  search?: string;
  genre?: string;
  artist?: string;
  meta?: any;
  onPageChange?: (page: number) => void;
}

const TrackList: React.FC<TrackListProps> = ({
  page = 1,
  limit = 10,
  sort,
  order,
  search,
  genre,
  artist,
  meta,
  onPageChange,
}) => {
  // Приводимо sort та order до потрібних типів
  const sortValue = (sort === 'title' || sort === 'artist' || sort === 'album' || sort === 'createdAt') ? sort : undefined;
  const orderValue = (order === 'asc' || order === 'desc') ? order : undefined;
  const { data, loading, error } = useTracksQuery({ page, limit, sort: sortValue, order: orderValue, search, genre, artist });

  if (loading) return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mr-4"></div>
      <span className="text-lg text-gray-400">Завантаження треків...</span>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
      <span className="font-semibold">Помилка завантаження треків:</span> {error.message}
    </div>
  );

  const tracks = data?.tracks?.data ?? [];
  const metaData = meta || data?.tracks?.meta;

  return (
    <div className="w-full mx-auto max-w-7xl py-6">
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <span className="text-2xl text-gray-400 mb-2">😕</span>
          <span className="text-gray-400 text-lg">Треків не знайдено</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {tracks.map((track: Track) => (
              <div key={track.id} className="h-full">
                <TrackItem track={track} />
              </div>
            ))}
          </div>
          {metaData && metaData.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-blue-100 dark:hover:bg-blue-800 transition disabled:opacity-50"
                onClick={() => metaData.page > 1 && onPageChange && onPageChange(metaData.page - 1)}
                disabled={metaData.page === 1}
              >
                &larr;
              </button>
              {Array.from({ length: metaData.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`px-3 py-1 rounded font-semibold transition ${metaData.page === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-700'}`}
                  onClick={() => onPageChange && onPageChange(pageNum)}
                  disabled={metaData.page === pageNum}
                >
                  {pageNum}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-blue-100 dark:hover:bg-blue-800 transition disabled:opacity-50"
                onClick={() => metaData.page < metaData.totalPages && onPageChange && onPageChange(metaData.page + 1)}
                disabled={metaData.page === metaData.totalPages}
              >
                &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrackList;