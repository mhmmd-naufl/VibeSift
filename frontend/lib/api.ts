import { useStore } from "./store";
import type {
  PlaylistResponse,
  PlaylistSummary,
  Stats,
  SyncResult,
  TokenResponse,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Error raised for any non-2xx backend response. */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  /** Attach the user's AI key from the store. */
  aiKey?: boolean;
  /** Attach the Spotify bearer token. Defaults to true. */
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { accessToken, aiKey } = useStore.getState();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth !== false && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (options.aiKey && aiKey) headers["X-AI-API-Key"] = aiKey;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(
      payload.code ?? "UNKNOWN",
      payload.detail ?? "Terjadi kesalahan. Coba lagi.",
      response.status,
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Typed client for the VibeSift backend. */
export const api = {
  loginUrl: (): string => `${BASE_URL}/api/auth/spotify/login`,
  exchangeCode: (code: string): Promise<TokenResponse> =>
    request<TokenResponse>(`/api/auth/spotify/callback?code=${encodeURIComponent(code)}`, {
      auth: false,
    }),
  stats: (): Promise<Stats> => request<Stats>("/api/stats"),
  sync: (): Promise<SyncResult> =>
    request<SyncResult>("/api/sync/liked-songs", { method: "POST" }),
  playlists: (): Promise<PlaylistSummary[]> => request<PlaylistSummary[]>("/api/playlists"),
  generate: (prompt: string, provider: string, model: string): Promise<PlaylistResponse> =>
    request<PlaylistResponse>("/api/generate-playlist", {
      method: "POST",
      body: { prompt, provider, model },
      aiKey: true,
    }),
  deletePlaylist: (id: string): Promise<void> =>
    request<void>(`/api/playlists/${id}`, { method: "DELETE" }),
};
