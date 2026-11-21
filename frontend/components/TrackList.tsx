import type { TrackItem } from "@/lib/types";

function formatDuration(ms: number | null): string {
  if (!ms) return "";
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Numbered, scrollable tracklist rows shared by result and detail views. */
export function TrackList({ tracks }: { tracks: TrackItem[] }) {
  if (tracks.length === 0) return null;
  return (
    <ol className="max-h-80 divide-y divide-line overflow-y-auto border-t border-line">
      {tracks.map((track, index) => (
        <li key={`${track.name}-${index}`} className="flex items-baseline gap-3 px-5 py-2">
          <span className="w-6 shrink-0 text-right font-mono text-[11px] tabular-nums text-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{track.name}</p>
            <p className="truncate text-[11px] text-faint">
              {track.artists.join(", ")}
              {track.album ? ` · ${track.album}` : ""}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-faint">
            {formatDuration(track.duration_ms)}
          </span>
        </li>
      ))}
    </ol>
  );
}
