"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { OnboardingModal } from "@/components/OnboardingModal";
import { PlaylistCard } from "@/components/PlaylistCard";
import { PlaylistDetailModal } from "@/components/PlaylistDetailModal";
import { PlaylistResult } from "@/components/PlaylistResult";
import { PromptBox } from "@/components/PromptBox";
import { SyncProgress } from "@/components/SyncProgress";
import { api, ApiError } from "@/lib/api";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type {
  AiProvider,
  PlaylistResponse,
  PlaylistSummary,
  Stats,
  SyncProgressInfo,
} from "@/lib/types";

const FRIENDLY_ERRORS: Record<string, string> = {
  UPSTREAM_ERROR: "Server lagi sibuk — coba lagi sebentar.",
  AI_INVALID_JSON: "AI-nya ngambek, coba prompt yang lain.",
  AI_KEY_MISSING: "Atur API key AI dulu di halaman Settings.",
  SPOTIFY_RATE_LIMIT: "Spotify lagi kebanyakan request — tunggu sebentar.",
  NO_TRACKS: "Tidak ada lagu yang cocok — coba prompt lain atau sync ulang.",
};

const errorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    return FRIENDLY_ERRORS[error.code] ?? error.message;
  }
  return fallback;
};

function SectionHeader({ no, title, hint }: { no: string; title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-semibold text-brand">{no}</span>
        <h2 className="text-[13px] font-medium text-ink">{title}</h2>
      </div>
      {hint && <p className="text-[11px] text-faint">{hint}</p>}
    </div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] ${className}`} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const accessToken = useStore((state) => state.accessToken);
  const hasHydrated = useStore((state) => state.hasHydrated);
  const displayName = useStore((state) => state.displayName);
  const aiKey = useStore((state) => state.aiKey);
  const provider = useStore((state) => state.provider);
  const model = useStore((state) => state.model);
  const logout = useStore((state) => state.logout);
  const setAiConfig = useStore((state) => state.setAiConfig);
  const isDemoSession = useStore((state) => state.isDemoSession);

  const [stats, setStats] = useState<Stats | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistSummary[] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncElapsed, setSyncElapsed] = useState(0);
  const [syncProgress, setSyncProgress] = useState<SyncProgressInfo | null>(null);
  const [generating, setGenerating] = useState(false);
  const [globalDemoMode, setGlobalDemoMode] = useState(false);
  const [hasServerAiKey, setHasServerAiKey] = useState(false);
  const [created, setCreated] = useState<PlaylistResponse | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const refresh = useCallback(async () => {
    const [nextStats, nextPlaylists] = await Promise.all([api.stats(), api.playlists()]);
    setStats(nextStats);
    setPlaylists(nextPlaylists);
  }, []);

  useEffect(() => {
    api
      .config()
      .then((config) => {
        const serverKey = config.has_server_ai_key ?? false;
        setGlobalDemoMode(config.demo_mode);
        setHasServerAiKey(serverKey);
        if (!config.demo_mode && !useStore.getState().aiKey && !serverKey) {
          setShowOnboarding(true);
        }
        if (!useStore.getState().aiKey && serverKey) {
          setAiConfig("", config.default_provider as AiProvider, config.default_model);
        }
      })
      .catch(() => setGlobalDemoMode(false));
  }, [setAiConfig]);

  const demoMode = globalDemoMode || isDemoSession;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      router.replace("/");
      return;
    }
    refresh().catch((error) => toast.error(errorMessage(error, "Gagal memuat data.")));
  }, [hasHydrated, accessToken, refresh, router]);

  useEffect(() => {
    if (!syncing) {
      setSyncElapsed(0);
      return;
    }
    const started = Date.now();
    const elapsedTimer = setInterval(
      () => setSyncElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    const poll = () =>
      api
        .syncProgress()
        .then(setSyncProgress)
        .catch(() => {});
    poll();
    const progressTimer = setInterval(poll, 2000);
    return () => {
      clearInterval(elapsedTimer);
      clearInterval(progressTimer);
    };
  }, [syncing]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await api.sync();
      await refresh();
      toast.success(`${result.synced_count.toLocaleString("id-ID")} lagu berhasil disinkronkan.`);
    } catch (error) {
      toast.error(errorMessage(error, "Sync gagal."));
    } finally {
      setSyncing(false);
    }
  };

  const libraryEmpty = stats !== null && stats.total_tracks === 0;

  const handleGenerate = async (prompt: string) => {
    if (!aiKey && !demoMode && !hasServerAiKey) {
      toast.info("Atur API key AI dulu di halaman Settings.");
      return;
    }
    setGenerating(true);
    setCreated(null);
    try {
      const playlist = await api.generate(prompt, provider, model);
      setCreated(playlist);
      await refresh();
      toast.success(`"${playlist.name}" dibuat dengan ${playlist.track_count} lagu.`);
    } catch (error) {
      toast.error(errorMessage(error, "Gagal membuat playlist."));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deletePlaylist(id);
      setPlaylists((current) => current?.filter((item) => item.id !== id) ?? null);
      toast.success("Playlist dihapus.");
    } catch (error) {
      toast.error(errorMessage(error, "Gagal menghapus playlist."));
    }
  };

  const initial = (displayName ?? "V").charAt(0).toUpperCase();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <header className="flex animate-fade-up items-center justify-between gap-3 border-b border-white/60 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand text-sm font-bold text-canvas">
            {initial}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-none text-ink">Dashboard</h1>
            <p className="mt-1 truncate text-[11px] text-sub">
              {displayName ?? "Spotify user"}
            </p>
          </div>
        </div>
        <nav className="flex shrink-0 items-center gap-1 text-[13px] font-medium">
          <Link
            href="/settings"
            className="focus-ring px-3 py-2 text-sub transition-colors hover:text-ink"
          >
            Settings
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="focus-ring px-3 py-2 text-sub transition-colors hover:text-brand"
          >
            Logout
          </button>
        </nav>
      </header>

      {demoMode && (
        <p className="animate-fade-up mt-4 border border-brand/40 bg-brand-soft px-4 py-2.5 text-[12px] leading-relaxed text-brand">
          <span className="font-semibold text-brand">Mode demo</span> —{" "}
          {isDemoSession
            ? "sesi demo: sample library lokal, playlist tidak dikirim ke Spotify."
            : "sample library lokal, playlist tidak dikirim ke Spotify."}{" "}
          {!isDemoSession && (
            <code className="border border-brand/40 px-1">SPOTIFY_MODE=real</code>
          )}
          {isDemoSession && "Login dengan Spotify untuk playlist asli."}
        </p>
      )}

      <section className="animate-fade-up mt-8" style={{ animationDelay: "40ms" }}>
        <SectionHeader no="01" title="Library" />
        <div className="mt-4 border border-line bg-panel px-5 py-4">
          {stats === null ? (
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-9 w-full" />
            </div>
          ) : (
            <SyncProgress
              totalTracks={stats.total_tracks}
              lastSync={stats.last_sync ?? null}
              syncing={syncing}
              syncElapsed={syncElapsed}
              progress={syncProgress}
              onSync={handleSync}
            />
          )}
        </div>
      </section>

      <section className="animate-fade-up mt-10" style={{ animationDelay: "80ms" }}>
        <SectionHeader no="02" title="Buat Playlist" hint="satu kalimat → playlist" />
        <div className="mt-4">
          <PromptBox
            onGenerate={handleGenerate}
            loading={generating}
            blocked={libraryEmpty}
          />
        </div>
      </section>

      {created && (
        <div className="animate-fade-up mt-8">
          <PlaylistResult playlist={created} demoMode={demoMode} />
        </div>
      )}

      <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />

      <section className="animate-fade-up mt-12" style={{ animationDelay: "120ms" }}>
        <SectionHeader
          no="03"
          title="Playlists"
          hint={playlists === null ? "memuat…" : `${playlists.length} playlist`}
        />
        <div className="mt-2">
          {playlists === null ? (
            <div className="space-y-3 border-t border-line py-4">
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-4 w-1/2" />
              <SkeletonBlock className="h-4 w-3/5" />
            </div>
          ) : playlists.length === 0 ? (
            <p className="border-t border-line py-8 text-center text-sm text-faint">
              Belum ada playlist — generate yang pertama.
            </p>
          ) : (
            playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onDelete={handleDelete}
                onSelect={setDetailId}
              />
            ))
          )}
        </div>
      </section>

      <PlaylistDetailModal playlistId={detailId} onClose={() => setDetailId(null)} />
    </main>
  );
}
