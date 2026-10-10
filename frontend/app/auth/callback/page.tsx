"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api";
import { useStore } from "@/lib/store";

function CallbackHandler() {
  const params = useSearchParams();
  const setTokens = useStore((state) => state.setTokens);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      setError("Kode otorisasi tidak ditemukan.");
      return;
    }
    api
      .exchangeCode(code)
      .then((token) => {
        setTokens(token.access_token, token.user.display_name);
        window.location.href = "/dashboard";
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Gagal login ke Spotify.");
      });
  }, [params, setTokens]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      {error ? (
        <>
          <p className="text-red-600">{error}</p>
          <Link href="/" className="text-sm underline">
            Kembali ke beranda
          </Link>
        </>
      ) : (
        <p className="text-slate-600">Menyelesaikan login...</p>
      )}
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="p-6 text-slate-600">Memuat...</p>}>
      <CallbackHandler />
    </Suspense>
  );
}
