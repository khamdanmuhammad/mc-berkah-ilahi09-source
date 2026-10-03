import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export type PromptInput = { topic: string; tone: string; style: string; ref: string; scenes: string[] };

export async function generateTalkingHeadPrompt(input: PromptInput) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI belum dikonfigurasi.");
  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (url, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(url, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      return res;
    },
  });
  const sceneList = input.scenes.filter((s) => s.trim()).map((s, i) => `${i + 1}. ${s}`).join("\n") || "(buat 4 adegan yang pas)";
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system:
      "You are an expert short-form video director. Write detailed scene-by-scene talking-head video prompts ready for AI video tools. For every scene output exactly one block formatted: SCENE N: [Camera: ...] [Lighting: ...] [Action: ...] [Dialog: \"...\" (in Bahasa Indonesia)] [Editing: ...]. Separate scenes with a blank line. No intro or outro text, no markdown.",
    prompt: `Topik: ${input.topic || "produk andalan"}\nGaya bicara: ${input.tone}\nGaya editing: ${input.style}\nReferensi editing: ${input.ref || "-"}\nAdegan:\n${sceneList}`,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return (await result.text).trim();
}
