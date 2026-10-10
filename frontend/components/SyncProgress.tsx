"use client";

import { Music4, RefreshCw } from "lucide-react";

import { Button } from "./ui/button";

type SyncProgressProps = {
  totalTracks: number;
  lastSync: string | null;
  syncing: boolean;
  onSync: () => void;
};

/** Shows cached-track stats and exposes the sync action. */
export function SyncProgress({ totalTracks, lastSync, syncing, onSync }: SyncProgressProps) {
  const label = lastSync
    ? `Last sync: ${new Date(lastSync).toLocaleString()}`
    : "Belum pernah sync";

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Music4 className="h-5 w-5 text-brand" />
        <div>
          <p className="text-sm font-medium text-slate-900">
            {totalTracks.toLocaleString()} songs
          </p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
      <Button variant="outline" onClick={onSync} disabled={syncing}>
        <RefreshCw className={syncing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        {syncing ? "Syncing..." : "Sync Liked Songs"}
      </Button>
    </div>
  );
}
