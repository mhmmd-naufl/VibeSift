"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PlaylistCard } from "@/components/PlaylistCard";
import { PromptBox } from "@/components/PromptBox";
import { SyncProgress } from "@/components/SyncProgress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { PlaylistSummary, Stats } from "@/lib/types";

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError ? error.message : fallback;

export default function DashboardPage() {
  const router = useRouter();
  const accessToken = useStore((state) => state.accessToken);
  const hasHydrated = useStore((state) => state.hasHydrated);
  const displayName = useStore((state) => state.displayName);
  const aiKey = useStore((state) => state.aiKey);
  const provider = useStore((state) => state.provider);
  const model = useStore((state) => state.model);
  const logout = useStore((state) => state.logout);

  const [stats, setStats] = useState<Stats | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [nextStats, nextPlaylists] = await Promise.all([api.stats(), api.playlists()]);
    setStats(nextStats);
    setPlaylists(nextPlaylists);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      router.replace("/");
      return;
    }
    refresh().catch((error) => setMessage(errorMessage(error, "Gagal memuat data.")));
  }, [hasHydrated, accessToken, refresh, router]);

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const result = await api.sync();
      await refresh();
      setMessage(`${result.synced_count.toLocaleString()} lagu berhasil disinkronkan.`);
    } catch (error) {
      setMessage(errorMessage(error, "Sync gagal."));
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerate = async (prompt: string) => {
    if (!aiKey) {
      setMessage("Atur API key AI dulu di halaman Settings.");
      return;
    }
    setGenerating(true);
    setMessage(null);
    try {
      const playlist = await api.generate(prompt, provider, model);
      await refresh();
      setMessage(`Playlist "${playlist.name}" dibuat dengan ${playlist.track_count} lagu!`);
    } catch (error) {
      setMessage(errorMessage(error, "Gagal membuat playlist."));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deletePlaylist(id);
      setPlaylists((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setMessage(errorMessage(error, "Gagal menghapus playlist."));
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500">{displayName ?? "Spotify user"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="outline">Settings</Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              router.replace("/");
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      <Card>
        <SyncProgress
          totalTracks={stats?.total_tracks ?? 0}
          lastSync={stats?.last_sync ?? null}
          syncing={syncing}
          onSync={handleSync}
        />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Buat playlist baru</h2>
        <PromptBox onGenerate={handleGenerate} loading={generating} />
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Recent Playlists</h2>
        {playlists.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada playlist.</p>
        ) : (
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
