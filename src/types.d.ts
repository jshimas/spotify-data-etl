export interface Artist {
  id: string;
  followers: number;
  genres: string;
  name: string;
  popularity: number;
}

interface Track {
  id: string;
  name: string;
  popularity: number;
  duration_ms: number;
  explicit: number;
  artists: string[] | string;
  id_artists: string[] | string;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  time_signature: number;
}

export interface RawTrack extends Track {
  release_date: string;
  danceability: number;
}

export interface CleanTrack extends Track {
  release_year: number | string;
  release_month: number | string;
  release_day: number | string;
  danceability: string;
}

export interface ArtistTrack {
  artistId: string;
  trackId: string;
}
