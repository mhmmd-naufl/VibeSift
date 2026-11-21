"use client";

import { Music4, RefreshCw } from "lucide-react";

import type { SyncProgressInfo } from "@/lib/types";
import { Button } from "./ui/button";

type SyncProgressProps = {
  totalTracks: number;
  lastSync: string | null;
  syncing: boolean;
  syncElapsed?: number;
  progress?: SyncProgressInfo | null;
  onSync: () => void;
};

function phaseLabel(progress: SyncProgressInfo | null | undefined, elapsed: number): string {
  if (!progress?.phase) return `Menyinkronkan… ${elapsed}d`;
  switch (progress.phase) {
    case "fetching_tracks":
      return progress.tracks
        ? `Mengambil lagu… ${progress.tracks.toLocaleString("id-ID")} lagu · ${elapsed}d`
        : `Menghubungi Spotify… ${elapsed}d`;
    case "fetching_features": {
      const done = progress.features_done ?? 0;
      const total = progress.features_total ?? 0;
      return total > 0
        ? `Fitur audio ${Math.round((done / total) * 100)}% · ${elapsed}d`
        : `Mengambil fitur audio… ${elapsed}d`;
    }
    case "saving":
      return `Menyimpan ke database… ${elapsed}d`;
    default:
      return `Menyinkronkan… ${elapsed}d`;
  }
}

function progressRatio(progress: SyncProgressInfo | null | undefined): number | null {
  if (!progress || progress.phase !== "fetching_features") return null;
  const total = progress.features_total ?? 0;
  if (total <= 0) return null;
  return Math.min(1, (progress.features_done ?? 0) / total);
}

/** Library stats row with live phase + progress while syncing. */
export function SyncProgress({
  totalTracks,
  lastSync,
  syncing,
  syncElapsed = 0,
  progress = null,
  onSync,
}: SyncProgressProps) {
  const label = lastSync
    ? `Sinkron ${new Date(lastSync).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Belum pernah disinkronkan";
  const ratio = progressRatio(progress);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-line bg-canvas">
            <Music4 className="h-4 w-4 text-sub" />
          </div>
          <div>
            <p className="text-sm font-semibold tabular-nums text-ink">
              {totalTracks.toLocaleString("id-ID")}
              <span className="ml-1.5 text-xs font-normal text-sub">lagu</span>
            </p>
            <p className="text-[11px] text-faint">
              {syncing ? phaseLabel(progress, syncElapsed) : label}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onSync} disabled={syncing}>
          <RefreshCw className={syncing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {syncing ? "Syncing" : "Sync"}
        </Button>
      </div>
      <div className="h-px w-full bg-line">
        {syncing &&
          (ratio !== null ? (
            <div
              className="h-px bg-brand transition-all duration-500"
              style={{ width: `${Math.max(ratio * 100, 2)}%` }}
            />
          ) : (
            <div className="h-px w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-brand to-transparent bg-[length:200%_100%]" />
          ))}
      </div>
    </div>
  );
}
