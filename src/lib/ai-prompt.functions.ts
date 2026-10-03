import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateTalkingHeadPrompt } from "./ai-prompt.server";

export const generatePrompt = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        topic: z.string().max(300),
        tone: z.string().max(50),
        style: z.string().max(50),
        ref: z.string().max(300),
        scenes: z.array(z.string().max(300)).max(20),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      return { ok: true as const, text: await generateTalkingHeadPrompt(data) };
    } catch (e: any) {
      const status = e?.statusCode ?? e?.status;
      const msg =
        status === 429 ? "Terlalu banyak permintaan, coba lagi sebentar."
        : status === 402 ? "Kredit AI habis. Tambahkan kredit di pengaturan workspace."
        : "Gagal membuat prompt dengan AI. Coba lagi.";
      console.error(e);
      return { ok: false as const, error: msg };
    }
  });
