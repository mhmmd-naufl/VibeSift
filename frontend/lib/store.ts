"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AiProvider } from "./types";

type VibeSiftState = {
  accessToken: string | null;
  refreshToken: string | null;
  displayName: string | null;
  aiKey: string;
  provider: AiProvider;
  model: string;
  hasHydrated: boolean;
  setTokens: (accessToken: string, displayName: string | null) => void;
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
      aiKey: "",
      provider: "gemini",
      model: "gemini-2.0-flash",
      hasHydrated: false,
      setTokens: (accessToken, displayName) => set({ accessToken, displayName }),
      setAiConfig: (aiKey, provider, model) => set({ aiKey, provider, model }),
      logout: () => set({ accessToken: null, refreshToken: null, displayName: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "vibesift",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        displayName: state.displayName,
        aiKey: state.aiKey,
        provider: state.provider,
        model: state.model,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
