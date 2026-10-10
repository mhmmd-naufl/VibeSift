"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "./ui/button";

const QUICK_PROMPTS = ["Morning Coffee", "Gym Beast", "Rainy Day", "Late Night Acoustic"];

type PromptBoxProps = {
  onGenerate: (prompt: string) => Promise<void>;
  loading: boolean;
};

/** Prompt textarea with quick-prompt shortcuts. */
export function PromptBox({ onGenerate, loading }: PromptBoxProps) {
  const [prompt, setPrompt] = useState("");

  const submit = async () => {
    const value = prompt.trim();
    if (value && !loading) await onGenerate(value);
  };

  return (
    <div className="space-y-3">
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Contoh: lagu-lagu galau akustik buat menemani kerja malam"
        rows={3}
        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setPrompt(label)}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
          >
            {label}
          </button>
        ))}
      </div>
      <Button onClick={submit} disabled={loading || !prompt.trim()}>
        <Sparkles className="h-4 w-4" />
        {loading ? "Meracik mood..." : "Generate Playlist"}
      </Button>
    </div>
  );
}
