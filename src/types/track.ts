export interface Track {
  id: string;
  title: string;
  artist: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  genres: string[];
  album?: string;
  coverImage?: string;
  audioFile?: string;
  duration?: number;
}
