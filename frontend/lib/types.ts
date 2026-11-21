/** Shared API types mirroring the backend schemas. */

export type SpotifyUser = {
  id: string;
  display_name: string | null;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string | null;
  expires_in: number;
  user: SpotifyUser;
};

export type AppConfig = {
  demo_mode: boolean;
  demo_available?: boolean;
  default_provider: string;
  default_model: string;
  has_server_ai_key?: boolean;
};

export type Stats = {
  total_tracks: number;
  total_playlists: number;
  last_sync: string | null;
};

export type SyncResult = {
  synced_count: number;
  last_sync: string;
};

export type AudioFilters = {
  min_energy?: number | null;
  max_energy?: number | null;
  min_valence?: number | null;
  max_valence?: number | null;
  min_danceability?: number | null;
  max_danceability?: number | null;
  min_acousticness?: number | null;
  max_acousticness?: number | null;
  min_instrumentalness?: number | null;
  max_instrumentalness?: number | null;
  min_tempo?: number | null;
  max_tempo?: number | null;
};

export type TrackItem = {
  name: string;
  artists: string[];
  album: string | null;
  duration_ms: number | null;
};

export type PlaylistResponse = {
  playlist_id: string;
  name: string;
  description: string | null;
  track_count: number;
  spotify_url: string;
  ai_parameters: AudioFilters;
  fallback_applied?: boolean;
  tracks?: TrackItem[];
};

export type PlaylistSummary = {
  id: string;
  spotify_playlist_id: string;
  name: string;
  track_count: number;
  created_at: string;
};

export type PlaylistDetail = PlaylistSummary & {
  description: string | null;
  prompt: string;
  tracks: TrackItem[];
};

export type SyncProgressInfo = {
  phase?: "fetching_tracks" | "fetching_features" | "saving" | "done";
  tracks?: number;
  features_done?: number;
  features_total?: number;
  done?: boolean;
  error?: string | null;
};

export type AiProvider =
  | "gemini"
  | "groq"
  | "openai"
  | "anthropic"
  | "ollama"
  | "openrouter";
