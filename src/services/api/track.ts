import { gql } from '@apollo/client';
import { apolloClient } from '../../lib/apollo-client';
import { QueryParams, PaginatedResponse, Track, CreateTrackDto, UpdateTrackDto, BatchDeleteResponse, Result, ok, err } from '../../types';

export const TRACKS_QUERY = gql`
  query Tracks(
    $page: Int
    $limit: Int
    $sort: String
    $order: String
    $search: String
    $genre: String
    $artist: String
  ) {
    tracks(
      page: $page
      limit: $limit
      sort: $sort
      order: $order
      search: $search
      genre: $genre
      artist: $artist
    ) {
      data {
        id
        title
        artist
        album
        genres
        slug
        coverImage
        audioFile
        createdAt
        updatedAt
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

export const TRACK_BY_SLUG_QUERY_V2 = gql`
  query Track($slug: String!) {
    track(slug: $slug) {
      id
      title
      artist
      album
      genres
      slug
      coverImage
      audioFile
      createdAt
      updatedAt
    }
  }
`;

export const TRACK_BY_SLUG_QUERY = gql`
  query TrackBySlug($slug: String!) {
    trackBySlug(slug: $slug) {
      id
      title
      artist
      album
      genres
      slug
      coverImage
      audioFile
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TRACK_MUTATION = gql`
  mutation CreateTrack($input: CreateTrackInput!) {
    createTrack(input: $input) {
      id
      title
      artist
      album
      genres
      slug
      coverImage
      audioFile
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TRACK_MUTATION = gql`
  mutation UpdateTrack($id: ID!, $input: UpdateTrackInput!) {
    updateTrack(id: $id, input: $input) {
      id
      title
      artist
      album
      genres
      slug
      coverImage
      audioFile
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_TRACK_MUTATION = gql`
  mutation DeleteTrack($id: ID!) {
    deleteTrack(id: $id)
  }
`;

export const BATCH_DELETE_TRACKS_MUTATION = gql`
  mutation DeleteTracks($ids: [ID!]!) {
    deleteTracks(ids: $ids) {
      success
      failed
    }
  }
`;

export const fetchTracks = async (params: QueryParams): Promise<Result<PaginatedResponse<Track>>> => {
  try {
    const { data } = await apolloClient.query<{ tracks: PaginatedResponse<Track> }>({
      query: TRACKS_QUERY,
      variables: params,
      fetchPolicy: 'network-only',
    });
    return ok(data.tracks);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to fetch tracks'));
  }
};

export const fetchTrackBySlugAlt = async (slug: string): Promise<Result<Track>> => {
  try {
    const { data } = await apolloClient.query<{ track: Track }>({
      query: TRACK_BY_SLUG_QUERY_V2,
      variables: { slug },
      fetchPolicy: 'network-only',
    });
    return ok(data.track);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to fetch track'));
  }
};

export const fetchTrackBySlug = async (slug: string): Promise<Result<Track>> => {
  try {
    const { data } = await apolloClient.query<{ trackBySlug: Track }>({
      query: TRACK_BY_SLUG_QUERY,
      variables: { slug },
      fetchPolicy: 'network-only',
    });
    return ok(data.trackBySlug);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to fetch track'));
  }
};

export const createTrack = async (newTrackData: CreateTrackDto): Promise<Result<Track>> => {
  try {
    const { data } = await apolloClient.mutate<{ createTrack: Track }>({
      mutation: CREATE_TRACK_MUTATION,
      variables: { input: newTrackData },
    });
    if (data?.createTrack) {
      return ok(data.createTrack);
    } else {
      return err(new Error('Failed to create track'));
    }
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to create track'));
  }
};

export const updateTrack = async ({ id, data: updateData }: { id: string; data: UpdateTrackDto }): Promise<Result<Track>> => {
  try {
    const { data } = await apolloClient.mutate<{ updateTrack: Track }>({
      mutation: UPDATE_TRACK_MUTATION,
      variables: { id, input: updateData },
    });
    if (data?.updateTrack) {
      return ok(data.updateTrack);
    } else {
      return err(new Error('Failed to update track'));
    }
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to update track'));
  }
};

export const deleteTrack = async (id: string): Promise<Result<boolean>> => {
  try {
    const { data } = await apolloClient.mutate<{ deleteTrack: boolean }>({
      mutation: DELETE_TRACK_MUTATION,
      variables: { id },
    });
    if (data?.deleteTrack !== undefined) {
      return ok(data.deleteTrack);
    } else {
      return err(new Error('Failed to delete track'));
    }
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to delete track'));
  }
};

export const deleteMultipleTracks = async (ids: string[]): Promise<Result<BatchDeleteResponse>> => {
  try {
    const { data } = await apolloClient.mutate<{ deleteTracks: BatchDeleteResponse }>({
      mutation: BATCH_DELETE_TRACKS_MUTATION,
      variables: { ids },
    });
    if (data?.deleteTracks) {
      return ok(data.deleteTracks);
    } else {
      return err(new Error('Failed to delete multiple tracks'));
    }
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Failed to delete multiple tracks'));
  }
};