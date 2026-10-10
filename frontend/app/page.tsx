"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const accessToken = useStore((state) => state.accessToken);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold">🎧 VibeSift</h1>
      <p className="max-w-md text-slate-600">
        Buat playlist Spotify dari Liked Songs cukup dengan mengetik satu kalimat.
      </p>
      {accessToken ? (
        <Link href="/dashboard">
          <Button>Buka Dashboard</Button>
        </Link>
      ) : (
        <a href={api.loginUrl()}>
          <Button>Login with Spotify</Button>
        </a>
      )}
      <Link href="/settings" className="text-sm text-slate-500 underline">
        Atur AI provider
      </Link>
    </main>
  );
}
