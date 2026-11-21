"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AiProvider } from "./types";

type Session = {
  accessToken: string;
  refreshToken: string | null;
  displayName: string | null;
  expiresIn: number;
};

type VibeSiftState = {
  accessToken: string | null;
  refreshToken: string | null;
  displayName: string | null;
  expiresAt: number | null;
  isDemoSession: boolean;
  aiKey: string;
  provider: AiProvider;
  model: string;
  hasHydrated: boolean;
  setSession: (session: Session) => void;
  setAiConfig: (aiKey: string, provider: AiProvider, model: string) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
};

/** Client-side store. Tokens and the AI key live only in the browser. */
export const useStore = create<VibeSiftState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      displayName: null,
      expiresAt: null,
      isDemoSession: false,
      aiKey: "",
      provider: "openrouter",
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      hasHydrated: false,
      setSession: ({ accessToken, refreshToken, displayName, expiresIn }) =>
        set({
          accessToken,
          refreshToken,
          displayName,
          expiresAt: Date.now() + expiresIn * 1000,
          isDemoSession: accessToken.startsWith("demo-"),
        }),
      setAiConfig: (aiKey, provider, model) => set({ aiKey, provider, model }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          displayName: null,
          expiresAt: null,
          isDemoSession: false,
        }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "vibesift",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        displayName: state.displayName,
        expiresAt: state.expiresAt,
        isDemoSession: state.isDemoSession,
        aiKey: state.aiKey,
        provider: state.provider,
        model: state.model,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
