import { useStore } from "./store";
import type {
  AppConfig,
  PlaylistDetail,
  PlaylistResponse,
  PlaylistSummary,
  Stats,
  SyncProgressInfo,
  SyncResult,
  TokenResponse,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

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

let refreshing: Promise<boolean> | null = null;

function buildHeaders(options: RequestOptions): Record<string, string> {
  const { accessToken, aiKey } = useStore.getState();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth !== false && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (options.aiKey && aiKey) headers["X-AI-API-Key"] = aiKey;
  return headers;
}

function send(path: string, options: RequestOptions): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: buildHeaders(options),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

async function performRefresh(): Promise<boolean> {
  const { refreshToken, displayName } = useStore.getState();
  if (!refreshToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/auth/spotify/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) return false;
    const token = (await response.json()) as TokenResponse;
    useStore.getState().setSession({
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? refreshToken,
      displayName: token.user.display_name ?? displayName,
      expiresIn: token.expires_in,
    });
    return true;
  } catch {
    return false;
  }
}

function refreshSession(): Promise<boolean> {
  refreshing ??= performRefresh().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await send(path, options);
  if (response.status === 401 && options.auth !== false && (await refreshSession())) {
    response = await send(path, options);
  }

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
  demoLogin: (): Promise<TokenResponse> =>
    request<TokenResponse>("/api/auth/demo", { method: "POST", auth: false }),
  config: (): Promise<AppConfig> => request<AppConfig>("/api/config", { auth: false }),
  exchangeCode: (code: string): Promise<TokenResponse> =>
    request<TokenResponse>(`/api/auth/spotify/callback?code=${encodeURIComponent(code)}`, {
      auth: false,
    }),
  stats: (): Promise<Stats> => request<Stats>("/api/stats"),
  sync: (): Promise<SyncResult> =>
    request<SyncResult>("/api/sync/liked-songs", { method: "POST" }),
  syncProgress: (): Promise<SyncProgressInfo> => request<SyncProgressInfo>("/api/sync/progress"),
  playlists: (): Promise<PlaylistSummary[]> => request<PlaylistSummary[]>("/api/playlists"),
  playlistDetail: (id: string): Promise<PlaylistDetail> =>
    request<PlaylistDetail>(`/api/playlists/${id}`),
  generate: (prompt: string, provider: string, model: string): Promise<PlaylistResponse> =>
    request<PlaylistResponse>("/api/generate-playlist", {
      method: "POST",
      body: { prompt, provider, model },
      aiKey: true,
    }),
  deletePlaylist: (id: string): Promise<void> =>
    request<void>(`/api/playlists/${id}`, { method: "DELETE" }),
};
