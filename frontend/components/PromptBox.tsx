"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";

const QUICK_PROMPTS: { label: string; prompt: string }[] = [
  { label: "Morning Coffee", prompt: "lagu-lagu upbeat dan santai buat ngopi pagi atau jalan pagi" },
  { label: "Gym Beast", prompt: "lagu workout energik dengan tempo cepat untuk olahraga" },
  { label: "Rainy Day", prompt: "lagu-lagu tenang dan melankolis untuk menemani hujan" },
  { label: "Late Night Acoustic", prompt: "lagu akustik dan indie folk yang tenang untuk begadang" },
  { label: "Throwback Hits", prompt: "lagu-lagu nostalgia dan hit lama yang easy listening" },
  { label: "Party Night", prompt: "lagu-lagu pesta dan dansa dengan energi tinggi" },
  { label: "Deep Focus", prompt: "lagu instrumental dan ambient untuk konsentrasi belajar" },
  { label: "Roadtrip", prompt: "lagu-lagu seru dan adventurous untuk perjalanan jauh" },
  { label: "Chill Vibes", prompt: "lagu-lagu chill dan lo-fi untuk rileks total" },
  { label: "Sad Boy Hours", prompt: "lagu galau dan sedih untuk melepas penat" },
];

const LOADING_STEPS = [
  "Membaca prompt-mu…",
  "Bertanya ke AI…",
  "Mencari lagu yang cocok…",
  "Menyusun playlist…",
];

type PromptBoxProps = {
  onGenerate: (prompt: string) => Promise<void>;
  loading: boolean;
  blocked?: boolean;
};

/** Prompt composer with a hairline frame and rectangular preset chips. */
export function PromptBox({ onGenerate, loading, blocked = false }: PromptBoxProps) {
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading) {
      setStep(0);
      return;
    }
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 3500);
    return () => clearInterval(timer);
  }, [loading]);

  const disabled = loading || blocked || !prompt.trim();

  const submit = async () => {
    const value = prompt.trim();
    if (value && !loading && !blocked) await onGenerate(value);
  };

  return (
    <div className="space-y-4">
      <div className="border border-line bg-panel transition-colors focus-within:border-white/50">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void submit();
          }}
          placeholder="Ceritakan mood-nya… mis. lagu akustik buat kerja malam"
          rows={3}
          className="w-full resize-none bg-transparent px-4 pt-3.5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-faint"
        />
        <div className="flex items-center justify-between border-t border-line px-4 py-2">
          <span className="text-[11px] tabular-nums text-faint">{prompt.length}/500</span>
          <span className="hidden text-[11px] text-faint sm:inline">
            Ctrl+Enter untuk generate
          </span>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-px overflow-x-auto border-y border-line bg-line px-1 py-px">
        {QUICK_PROMPTS.map((item) => {
          const active = prompt === item.prompt;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setPrompt(active ? "" : item.prompt)}
              title={item.prompt}
              className={
                active
                  ? "shrink-0 bg-brand px-3.5 py-2 text-[12px] font-semibold text-canvas transition-colors"
                  : "shrink-0 bg-panel px-3.5 py-2 text-[12px] font-medium text-sub transition-colors hover:bg-white/10 hover:text-ink"
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <Button
        variant="brand"
        onClick={submit}
        disabled={disabled}
        className="w-full sm:w-auto sm:min-w-48"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {LOADING_STEPS[step]}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Playlist
          </>
        )}
      </Button>

      {blocked && !loading && (
        <p className="text-[12px] text-faint">
          Sinkronkan Liked Songs dulu — library masih kosong.
        </p>
      )}
    </div>
  );
}
