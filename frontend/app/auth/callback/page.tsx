"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { Loader2 } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { useStore } from "@/lib/store";

function CallbackHandler() {
  const params = useSearchParams();
  const setSession = useStore((state) => state.setSession);
  const [error, setError] = useState<string | null>(null);
  const exchanged = useRef(false);

  useEffect(() => {
    const code = params.get("code");
    if (!code || exchanged.current) {
      if (!code) setError("Kode otorisasi tidak ditemukan.");
      return;
    }
    exchanged.current = true;
    api
      .exchangeCode(code)
      .then((token) => {
        setSession({
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          displayName: token.user.display_name,
          expiresIn: token.expires_in,
        });
        window.location.href = "/dashboard";
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.code === "UPSTREAM_ERROR") {
          setError(
            "Spotify menolak akses. Kemungkinan akunmu belum diizinkan di app ini (mode development maksimal 5 user), atau app owner belum Spotify Premium.",
          );
        } else {
          setError(err instanceof ApiError ? err.message : "Gagal login ke Spotify.");
        }
      });
  }, [params, setSession]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      {error ? (
        <>
          <p className="text-sm text-red-400">{error}</p>
          <p className="max-w-sm text-[12px] leading-relaxed text-faint">
            Tips: coba mode demo dari beranda — tetap bisa generate playlist tanpa
            akun Spotify.
          </p>
          <Link
            href="/"
            className="focus-ring px-4 py-2 text-sm text-sub transition-colors hover:text-ink"
          >
            Kembali ke beranda
          </Link>
        </>
      ) : (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
          <p className="text-sm text-sub">Menyelesaikan login…</p>
        </>
      )}
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </main>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
