"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { AiProvider } from "@/lib/types";

const PROVIDERS: { value: AiProvider; label: string; hint: string }[] = [
  { value: "openrouter", label: "OpenRouter", hint: "Recommended" },
  { value: "gemini", label: "Google", hint: "Gratis & cepat" },
  { value: "groq", label: "Groq", hint: "Super cepat" },
  { value: "openai", label: "OpenAI", hint: "" },
  { value: "anthropic", label: "Anthropic", hint: "" },
  { value: "ollama", label: "Ollama", hint: "Lokal" },
];

const MODEL_PRESETS: Record<AiProvider, string> = {
  openrouter: "nvidia/nemotron-3-ultra-550b-a55b:free",
  gemini: "gemini-2.0-flash",
  groq: "llama-3.3-70b-versatile",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-20241022",
  ollama: "llama3",
};

const schema = z.object({
  provider: z.enum(["gemini", "groq", "openai", "anthropic", "ollama", "openrouter"]),
  model: z.string().min(1, "Model wajib diisi"),
  aiKey: z
    .string()
    .refine((value) => value.trim() === "" || value.trim().length >= 10, "API key terlalu pendek"),
});

type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const router = useRouter();
  const provider = useStore((state) => state.provider);
  const model = useStore((state) => state.model);
  const aiKey = useStore((state) => state.aiKey);
  const setAiConfig = useStore((state) => state.setAiConfig);
  const [serverKey, setServerKey] = useState(false);

  useEffect(() => {
    api.config().then((config) => setServerKey(config.has_server_ai_key ?? false)).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { provider, model, aiKey },
  });

  const onSubmit = (values: FormValues) => {
    setAiConfig(values.aiKey.trim(), values.provider, values.model);
    router.push("/dashboard");
  };

  const onProviderChange = (value: string) => {
    const preset = MODEL_PRESETS[value as AiProvider];
    if (preset) setValue("model", preset);
  };

  return (
    <main className="mx-auto max-w-lg animate-fade-up px-4 py-8 sm:px-6 sm:py-12">
      <div className="border-b border-white/60 pb-3">
        <Link
          href="/dashboard"
          className="text-[11px] font-medium text-faint transition-colors hover:text-ink"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-1.5 text-3xl font-bold text-ink">AI Settings</h1>
      </div>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-faint">Provider</p>
          <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">
            {PROVIDERS.map((item) => {
              const active = watch("provider") === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setValue("provider", item.value);
                    onProviderChange(item.value);
                  }}
                  className={
                    active
                      ? "focus-ring bg-brand px-3 py-2.5 text-left transition-colors"
                      : "focus-ring bg-panel px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                  }
                >
                  <p
                    className={`text-[13px] font-semibold ${
                      active ? "text-canvas" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </p>
                  {item.hint && (
                    <p
                      className={`mt-0.5 text-[10px] ${
                        active ? "text-canvas/70" : "text-faint"
                      }`}
                    >
                      {item.hint}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-faint">API Key</p>
          <Input
            id="aiKey"
            type="password"
            placeholder={serverKey ? "Kosongkan — pakai key server" : "sk-..."}
            autoComplete="off"
            className="text-[13px]"
            {...register("aiKey")}
          />
          {errors.aiKey && <p className="text-[11px] text-red-400">{errors.aiKey.message}</p>}
        </div>

        <details className="group border border-line">
          <summary className="focus-ring cursor-pointer select-none px-3.5 py-2.5 text-[11px] font-medium text-faint transition-colors hover:text-ink">
            Advanced — model custom
          </summary>
          <div className="space-y-1.5 border-t border-line px-3.5 py-3">
            <Input id="model" className="font-mono text-[12px]" {...register("model")} />
            {errors.model && <p className="text-[11px] text-red-400">{errors.model.message}</p>}
          </div>
        </details>

        <Button type="submit" variant="brand" className="w-full">
          Save
        </Button>
      </form>
    </main>
  );
}
