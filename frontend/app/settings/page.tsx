"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import type { AiProvider } from "@/lib/types";

const PROVIDERS: { value: AiProvider; label: string; model: string }[] = [
  { value: "gemini", label: "Google AI Studio (Gemini)", model: "gemini-2.0-flash" },
  { value: "groq", label: "Groq", model: "llama-3.3-70b-versatile" },
  { value: "openai", label: "OpenAI", model: "gpt-4o-mini" },
  { value: "anthropic", label: "Anthropic", model: "claude-3-5-sonnet-20241022" },
  { value: "ollama", label: "Ollama (lokal)", model: "llama3" },
];

const schema = z.object({
  provider: z.enum(["gemini", "groq", "openai", "anthropic", "ollama"]),
  model: z.string().min(1, "Model wajib diisi"),
  aiKey: z.string().min(10, "API key terlalu pendek"),
});

type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const router = useRouter();
  const provider = useStore((state) => state.provider);
  const model = useStore((state) => state.model);
  const aiKey = useStore((state) => state.aiKey);
  const setAiConfig = useStore((state) => state.setAiConfig);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { provider, model, aiKey },
  });

  const onSubmit = (values: FormValues) => {
    setAiConfig(values.aiKey, values.provider, values.model);
    router.push("/dashboard");
  };

  const onProviderChange = (value: string) => {
    const preset = PROVIDERS.find((item) => item.value === value);
    if (preset) setValue("model", preset.model);
  };

  return (
    <main className="mx-auto max-w-xl space-y-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500">
          API key disimpan hanya di browser kamu, tidak pernah dikirim ke server.
        </p>
      </div>

      <Card>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="provider">
              Provider
            </label>
            <select
              id="provider"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...register("provider", { onChange: (e) => onProviderChange(e.target.value) })}
            >
              {PROVIDERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="model">
              Model
            </label>
            <Input id="model" {...register("model")} />
            {errors.model && <p className="text-xs text-red-600">{errors.model.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="aiKey">
              API Key
            </label>
            <Input id="aiKey" type="password" placeholder="AIza..." {...register("aiKey")} />
            {errors.aiKey && <p className="text-xs text-red-600">{errors.aiKey.message}</p>}
          </div>

          <Button type="submit">Save</Button>
        </form>
      </Card>

      <Link href="/dashboard" className="text-sm text-slate-500 underline">
        ← Kembali ke Dashboard
      </Link>
    </main>
  );
}
