"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { useStore } from "@/lib/store";

const STEPS = [
  { no: "1", title: "Masuk", desc: "Login Spotify atau coba demo" },
  { no: "2", title: "Sync", desc: "Satu klik — library kamu diambil" },
  { no: "3", title: "Generate", desc: "Tulis mood, playlist langsung jadi" },
];

export default function HomePage() {
  const router = useRouter();
  const accessToken = useStore((state) => state.accessToken);
  const setSession = useStore((state) => state.setSession);
  const [demoMode, setDemoMode] = useState(false);
  const [demoAvailable, setDemoAvailable] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [aiModel, setAiModel] = useState("");
  const [aiProvider, setAiProvider] = useState("");

  useEffect(() => {
    api
      .config()
      .then((config) => {
        setDemoMode(config.demo_mode);
        setDemoAvailable(config.demo_available ?? config.demo_mode);
        setAiModel(config.default_model);
        setAiProvider(config.default_provider);
      })
      .catch(() => setDemoAvailable(false));
  }, []);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const token = await api.demoLogin();
      setSession({
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        displayName: token.user.display_name,
        expiresIn: token.expires_in,
      });
      router.push("/dashboard");
    } catch {
      setDemoLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-5 py-16 sm:px-8">
      <header className="flex items-baseline justify-between border-b border-white/60 pb-3 text-[11px] text-sub">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 bg-brand" />
          VibeSift
        </span>
        <span className="hidden sm:inline">AI playlist curator</span>
      </header>

      <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-12 lg:gap-16">
        <div className="animate-fade-up lg:col-span-7">
          <h1 className="text-[15vw] font-bold leading-[0.95] tracking-tight text-ink sm:text-7xl lg:text-8xl">
            VibeSift
          </h1>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-sub">
            Playlist dari Liked Songs kamu, cukup dengan satu kalimat.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            {accessToken ? (
              <Link
                href="/dashboard"
                className="focus-ring inline-flex items-center justify-center bg-brand px-6 py-3 text-[13px] font-semibold text-canvas transition-colors hover:bg-brand-dark"
              >
                Buka Dashboard
              </Link>
            ) : demoMode ? (
              <a
                href={api.loginUrl()}
                className="focus-ring inline-flex items-center justify-center bg-brand px-6 py-3 text-[13px] font-semibold text-canvas transition-colors hover:bg-brand-dark"
              >
                Coba Demo
              </a>
            ) : (
              <>
                <a
                  href={api.loginUrl()}
                  className="focus-ring inline-flex items-center justify-center bg-brand px-6 py-3 text-[13px] font-semibold text-canvas transition-colors hover:bg-brand-dark"
                >
                  Login with Spotify
                </a>
                {demoAvailable && (
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={demoLoading}
                    className="focus-ring inline-flex items-center justify-center border border-white/25 px-6 py-3 text-[13px] font-semibold text-ink transition-colors hover:border-white/50 hover:bg-white/5 disabled:opacity-50"
                  >
                    {demoLoading ? "Memuat…" : "Coba Demo"}
                  </button>
                )}
              </>
            )}
            {!accessToken && (
              <Link
                href="/settings"
                className="focus-ring inline-flex items-center justify-center px-3 py-3 text-[12px] font-medium text-faint transition-colors hover:text-ink"
              >
                AI Settings
              </Link>
            )}
          </div>

          {!accessToken && !demoMode && demoAvailable && (
            <p className="mt-4 text-[12px] leading-relaxed text-faint">
              Spotify — playlist asli di akunmu.{" "}
              <span className="text-sub">Demo — instan, data contoh.</span>
            </p>
          )}
          {demoMode && !accessToken && (
            <p className="mt-4 text-[12px] text-faint">
              Server demo mode — semua sesi memakai data contoh.
            </p>
          )}
        </div>

        <div className="animate-fade-up lg:col-span-5" style={{ animationDelay: "80ms" }}>
          <div className="border-t border-line">
            {STEPS.map((step) => (
              <div key={step.no} className="flex gap-4 border-b border-line py-3.5">
                <span className="w-4 text-[12px] font-medium tabular-nums text-faint">
                  {step.no}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-ink">{step.title}</p>
                  <p className="mt-0.5 text-[12px] text-sub">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {aiModel && (
            <p className="mt-4 truncate text-[11px] text-faint" title={aiModel}>
              AI: {aiProvider} · {aiModel}
            </p>
          )}
        </div>
      </div>

      <footer className="flex items-baseline justify-between border-t border-line pt-3 text-[11px] text-faint">
        <span>© 2026 VibeSift</span>
        <span>Open source</span>
      </footer>
    </main>
  );
}
