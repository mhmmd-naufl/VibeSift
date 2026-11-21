"use client";

import { useEffect } from "react";

import Link from "next/link";

const STEPS = [
  "Buka openrouter.ai, daftar gratis, lalu buka Keys",
  "Klik “Create Key” lalu salin key-nya",
  "Paste di halaman Settings, lalu Save",
];

type OnboardingModalProps = {
  open: boolean;
  onClose: () => void;
};

/** First-run guide for obtaining a free OpenRouter API key. */
export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-scale-in border border-white/15 bg-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-line px-6 py-4">
          <p className="text-[11px] font-medium text-brand">
            Langkah pertama
          </p>
          <h2 id="onboarding-title" className="mt-1 text-xl font-semibold text-ink">
            Butuh API key AI
          </h2>
        </div>
        <div className="space-y-4 px-6 py-5">
          <p className="text-sm leading-relaxed text-sub">
            VibeSift memakai AI untuk menerjemahkan prompt jadi filter musik.
            Key disimpan hanya di browser kamu — gratis.
          </p>
          <ol>
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="flex items-baseline gap-4 border-t border-line py-2.5 text-sm text-ink first:border-t-0"
              >
                <span className="w-6 shrink-0 text-base font-semibold tabular-nums text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="flex border-t border-line">
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="focus-ring flex-1 bg-brand px-4 py-3.5 text-center text-[13px] font-semibold text-canvas transition-colors hover:bg-brand-dark"
          >
            OpenRouter (gratis)
          </a>
          <Link
            href="/settings"
            className="focus-ring flex-1 border-l border-line px-4 py-3.5 text-center text-[13px] font-semibold text-ink transition-colors hover:bg-white/5"
          >
            Settings
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring w-full border-t border-line py-2.5 text-[12px] text-faint transition-colors hover:text-ink"
        >
          Nanti saja
        </button>
      </div>
    </div>
  );
}
