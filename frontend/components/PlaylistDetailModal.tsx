"use client";

import { useEffect, useState } from "react";

import { ArrowUpRight, Loader2, X } from "lucide-react";

import { api } from "@/lib/api";
import type { PlaylistDetail } from "@/lib/types";
import { TrackList } from "./TrackList";

type PlaylistDetailModalProps = {
  playlistId: string | null;
  onClose: () => void;
};

const SPOTIFY_URL = "https://open.spotify.com/playlist/";

/** Modal showing a saved playlist's prompt and full track list. */
export function PlaylistDetailModal({ playlistId, onClose }: PlaylistDetailModalProps) {
  const [detail, setDetail] = useState<PlaylistDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!playlistId) return;
    setDetail(null);
    setError(false);
    api
      .playlistDetail(playlistId)
      .then(setDetail)
      .catch(() => setError(true));
  }, [playlistId]);

  useEffect(() => {
    if (!playlistId) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [playlistId, onClose]);

  if (!playlistId) return null;

  const isDemo = detail?.spotify_playlist_id.startsWith("demo") ?? false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg animate-scale-in flex-col border border-white/15 bg-panel"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-brand">
              {detail ? `${detail.track_count} lagu` : "Memuat…"}
            </p>
            <h2 className="mt-1 truncate text-lg font-semibold text-ink">
              {detail?.name ?? "…"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring shrink-0 p-1.5 text-faint transition-colors hover:text-ink"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {error && (
            <p className="px-5 py-8 text-center text-sm text-red-400">
              Gagal memuat detail playlist.
            </p>
          )}
          {!detail && !error && (
            <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-sub">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat…
            </div>
          )}
          {detail && (
            <>
              <div className="space-y-2 px-5 py-4">
                {detail.prompt && (
                  <p className="text-[11px] text-faint">
                    Prompt: <span className="text-sub">“{detail.prompt}”</span>
                  </p>
                )}
                {detail.description && (
                  <p className="text-sm leading-relaxed text-sub">{detail.description}</p>
                )}
              </div>
              <TrackList tracks={detail.tracks} />
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <p className="text-[11px] text-faint">
            {detail?.created_at
              ? new Date(detail.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : ""}
          </p>
          {!isDemo && detail?.spotify_playlist_id && (
            <a
              href={`${SPOTIFY_URL}${detail.spotify_playlist_id}`}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex items-center gap-1.5 bg-brand px-4 py-2 text-[12px] font-semibold text-canvas transition-colors hover:bg-brand-dark"
            >
              Spotify <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
