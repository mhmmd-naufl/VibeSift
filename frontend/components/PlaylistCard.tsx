"use client";

import { ExternalLink, Trash2 } from "lucide-react";

import type { PlaylistSummary } from "@/lib/types";

type PlaylistCardProps = {
  playlist: PlaylistSummary;
  onDelete: (id: string) => void;
};

const SPOTIFY_URL = "https://open.spotify.com/playlist/";

/** Compact card for a generated playlist. */
export function PlaylistCard({ playlist, onDelete }: PlaylistCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{playlist.name}</p>
        <p className="text-xs text-slate-500">{playlist.track_count} lagu</p>
      </div>
      <div className="flex items-center gap-1">
        <a
          href={`${SPOTIFY_URL}${playlist.spotify_playlist_id}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Open in Spotify"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={() => onDelete(playlist.id)}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Delete playlist"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
