"use client";

import { ArrowUpRight, ListMusic, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { PlaylistSummary } from "@/lib/types";

type PlaylistCardProps = {
  playlist: PlaylistSummary;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
};

const SPOTIFY_URL = "https://open.spotify.com/playlist/";

/** Index-style playlist row — click opens the detail modal. */
export function PlaylistCard({ playlist, onDelete, onSelect }: PlaylistCardProps) {
  const [confirming, setConfirming] = useState(false);
  const isDemo = playlist.spotify_playlist_id.startsWith("demo");

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(timer);
  }, [confirming]);

  return (
    <div className="group flex items-center justify-between gap-3 border-t border-line px-1 py-3.5 transition-colors first:border-t-0 hover:bg-white/[0.03]">
      <button
        type="button"
        onClick={() => onSelect(playlist.id)}
        className="focus-ring flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <ListMusic className="h-4 w-4 shrink-0 text-faint" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{playlist.name}</p>
          <p className="text-[11px] text-faint">
            {playlist.track_count} lagu{isDemo && " · demo"}
          </p>
        </div>
      </button>
      <div className="flex shrink-0 items-center gap-0.5">
        {!isDemo && (
          <a
            href={`${SPOTIFY_URL}${playlist.spotify_playlist_id}`}
            target="_blank"
            rel="noreferrer"
            className="focus-ring p-2 text-faint transition-colors hover:text-brand"
            aria-label="Open in Spotify"
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
        {confirming ? (
          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              onDelete(playlist.id);
            }}
            className="focus-ring border border-red-400/50 px-3 py-1.5 text-[12px] font-semibold text-red-400 transition-colors hover:bg-red-400/10"
          >
            Yakin hapus?
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="focus-ring p-2 text-faint transition-colors hover:text-red-400"
            aria-label="Delete playlist"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
