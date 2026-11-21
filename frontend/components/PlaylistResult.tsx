"use client";

import { TrackList } from "./TrackList";
import type { PlaylistResponse } from "@/lib/types";

type PlaylistResultProps = {
  playlist: PlaylistResponse;
  demoMode: boolean;
};

/** Editorial result panel — hairline frame plus the generated track list. */
export function PlaylistResult({ playlist, demoMode }: PlaylistResultProps) {
  const tracks = playlist.tracks ?? [];

  return (
    <div className="animate-fade-up border border-white/20 bg-panel">
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-brand">Playlist dibuat</p>
          <h3 className="mt-1 truncate text-xl font-semibold leading-tight text-ink">
            {playlist.name}
          </h3>
        </div>
        {playlist.spotify_url && (
          <a
            href={playlist.spotify_url}
            target="_blank"
            rel="noreferrer"
            className="focus-ring mt-1 inline-flex shrink-0 items-center bg-brand px-4 py-2 text-[12px] font-semibold text-canvas transition-colors hover:bg-brand-dark"
          >
            Spotify
          </a>
        )}
      </div>

      <div className="space-y-1.5 px-5 py-4">
        <p className="text-[12px] font-medium text-sub">
          {playlist.track_count} lagu
          {playlist.fallback_applied && (
            <span className="ml-2 font-normal normal-case tracking-normal text-faint">
              filter dilonggarkan otomatis
            </span>
          )}
        </p>
        {playlist.description && (
          <p className="text-sm leading-relaxed text-sub">{playlist.description}</p>
        )}
      </div>

      <TrackList tracks={tracks} />

      {!playlist.spotify_url && (
        <p className="border-t border-line px-5 py-2.5 text-xs text-faint">
          {demoMode
            ? "Mode demo — playlist disimpan lokal, belum dikirim ke Spotify."
            : "Playlist dibuat, tetapi URL Spotify tidak tersedia."}
        </p>
      )}
    </div>
  );
}
