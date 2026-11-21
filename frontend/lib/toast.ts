"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
};

let sequence = 0;
const DURATION_MS = 4200;

/** Minimal toast store. Toasts auto-dismiss after DURATION_MS. */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = ++sequence;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => useToastStore.getState().dismiss(id), DURATION_MS);
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));

/** Imperative helper: `toast.success("...")`. */
export const toast = {
  success: (message: string) => useToastStore.getState().push({ type: "success", message }),
  error: (message: string) => useToastStore.getState().push({ type: "error", message }),
  info: (message: string) => useToastStore.getState().push({ type: "info", message }),
};
