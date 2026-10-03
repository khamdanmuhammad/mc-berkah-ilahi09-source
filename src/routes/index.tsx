import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Film, Clapperboard, Camera, Sticker, Plus, Trash2, Copy, Save, KeyRound, X } from "lucide-react";
import { generatePrompt } from "@/lib/ai-prompt.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MC berkah ilahi09 Talking Head Studio" },
      { name: "description", content: "Generator prompt video talking head siap pakai dari MC berkah ilahi 09." },
      { property: "og:title", content: "MC berkah ilahi09 Talking Head Studio" },
      { property: "og:description", content: "Generator prompt video talking head siap pakai dari MC berkah ilahi 09." },
    ],
  }),
  component: App,
});

const WINME = "https://winme.id/mc-berkah-ilahi-091/lp/landing-page-i7iq8z";
const KEY = "mc88_license";
type License = { code: string; plan: "pro" | "trial"; uses: number };

const CODES: Record<string, "pro" | "trial"> = {
  MCBERKAHILAHI09: "pro",
  "MC88-PRO": "pro",
  "MC88-GRATIS": "trial",
  WINME88: "pro",
};
// Kode unik per pembeli: tambahkan di sini, format MCberkah-XXXX-XXXX
const BUYER_CODES: string[] = [];

function checkCode(raw: string): "pro" | "trial" | null {
  const c = raw.trim();
  const hit = CODES[c.toUpperCase()];
  if (hit) return hit;
  if (BUYER_CODES.some((b) => b.toUpperCase() === c.toUpperCase())) return "pro";
  return null;
}

function Logo() {
  return (
    <div className="text-lg font-extrabold tracking-tight">
      MC<span className="text-primary">berkahilahi</span><span className="text-accent">09</span>
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-6 text-center text-xs text-muted-foreground">
      © MC berkah ilahi - Tools Kreator No #1 di{" "}
      <a href={WINME} target="_blank" rel="noreferrer" className="text-primary underline">WinMe</a>
    </footer>
  );
}

function App() {
  const [lic, setLic] = useState<License | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setLic(JSON.parse(s)); } catch {}
    setReady(true);
  }, []);
  const save = (l: License | null) => {
    setLic(l);
    l ? localStorage.setItem(KEY, JSON.stringify(l)) : localStorage.removeItem(KEY);
  };
  if (!ready) return null;
  return lic ? <Studio lic={lic} save={save} /> : <Paywall onOk={save} />;
}

function Paywall({ onOk }: { onOk: (l: License) => void }) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const submit = () => {
    const plan = checkCode(code);
    if (!plan) return setMsg({ ok: false, t: "Kode lisensi tidak valid" });
    setMsg({ ok: true, t: "Lisensi Aktif!" });
    setTimeout(() => onOk({ code: code.trim(), plan, uses: 0 }), 800);
  };
  return (
    <div className="flex min-h-screen flex-col">
      <header className="p-5"><Logo /></header>
      <main className="flex flex-1 items-center justify-center px-5">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-7 backdrop-blur">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary"><KeyRound /></div>
          <h1 className="text-center text-2xl font-extrabold">Masukkan Kode Lisensi</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">Talking Head Studio — akses Pro</p>
          <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="MCberkah-XXXX-XXXX"
            className="mt-6 w-full rounded-xl border border-input bg-background px-4 py-4 text-center text-lg font-bold tracking-wider outline-none focus:border-primary" />
          {msg && <p className={`mt-3 text-center text-sm font-semibold ${msg.ok ? "text-success" : "text-destructive"}`}>{msg.t}</p>}
          <button onClick={submit} className="mt-5 w-full rounded-xl bg-primary py-4 font-extrabold text-primary-foreground shadow-glow transition hover:brightness-110">Aktifkan Lisensi</button>
          <a href={WINME} target="_blank" rel="noreferrer" className="mt-4 block text-center text-sm text-muted-foreground hover:text-primary">Belum punya kode? Beli di WinMe</a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const STYLES = [
  { id: "Cute & Girly", icon: Film, desc: "pastel tones, soft sparkles and bouncy text pops" },
  { id: "Glossy Premium", icon: Clapperboard, desc: "glossy highlights with kinetic zoom and smooth light leaks" },
  { id: "Kinetic Camera Motion", icon: Camera, desc: "dynamic whip pans, punch-in zooms and motion blur" },
  { id: "Sticker Cutout", icon: Sticker, desc: "white-border sticker cutouts and playful pop-in captions" },
];
const TONES = ["Ceria", "Edukatif", "Jualan"];
const CAMS = ["Close up, eye level", "Medium shot, slight low angle", "Extreme close up on face", "Medium close up, handheld"];

function Studio({ lic, save }: { lic: License; save: (l: License | null) => void }) {
  const [tab, setTab] = useState<"editor" | "prompt">("prompt");
  const [sub, setSub] = useState<"all" | "info">("all");
  const [scenes, setScenes] = useState<string[]>(["Pembukaan: sapa penonton"]);
  const [style, setStyle] = useState("Glossy Premium");
  const [ref, setRef] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Ceria");
  const [out, setOut] = useState("");
  const [limit, setLimit] = useState(false);
  const [toast, setToast] = useState("");
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(""), 1800); };

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const generate = async () => {
    if (lic.plan === "trial" && lic.uses >= 3) return setLimit(true);
    setLoading(true); setErr("");
    try {
      const r = await generatePrompt({ data: { topic, tone, style, ref, scenes } });
      if (!r.ok) return setErr(r.error);
      setOut(r.text);
      if (lic.plan === "trial") save({ ...lic, uses: lic.uses + 1 });
    } catch {
      setErr("Gagal membuat prompt dengan AI. Coba lagi.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <Logo />
        <button onClick={() => save(null)} className="text-xs text-muted-foreground hover:text-foreground">
          {lic.plan === "pro" ? "PRO UNLIMITED" : `Trial ${Math.max(0, 3 - lic.uses)}/3`} · Keluar
        </button>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-5">
        <div className="grid grid-cols-2 rounded-xl bg-muted p-1">
          {([["editor", "Video Editor"], ["prompt", "Prompt Generator"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-lg py-2.5 text-sm font-bold ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l}</button>
          ))}
        </div>

        {tab === "editor" ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Video Editor segera hadir. Gunakan Prompt Generator dulu ya.</div>
        ) : (
          <>
            <div className="flex gap-5 border-b border-border text-sm font-semibold">
              {([["all", "Semua Adegan"], ["info", "Infos"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setSub(k)} className={`-mb-px border-b-2 pb-2 ${sub === k ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{l}</button>
              ))}
            </div>

            {sub === "info" ? (
              <div className="space-y-2 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
                <p>1. Isi topik & gaya bicara. 2. Tambah adegan. 3. Pilih gaya editing. 4. Klik Generate.</p>
                <p>Prompt bisa langsung dipakai di tools AI video favoritmu.</p>
              </div>
            ) : (
              <>
                <section className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-bold">Topik Video
                    <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="cth: skincare glowing" className="w-full rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none focus:border-primary" />
                  </label>
                  <div className="space-y-1.5 text-sm font-bold">Gaya Bicara
                    <div className="grid grid-cols-3 gap-2">
                      {TONES.map((t) => (
                        <button key={t} onClick={() => setTone(t)} className={`rounded-xl border py-3 text-xs font-bold ${tone === t ? "border-primary text-primary" : "border-input text-muted-foreground"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-extrabold">Adegan</h2>
                    <button onClick={() => setScenes([...scenes, ""])} className="flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm font-bold text-accent-foreground"><Plus size={16} /> Tambah Adegan</button>
                  </div>
                  {scenes.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
                      <span className="w-8 text-center text-xs font-bold text-primary">#{i + 1}</span>
                      <input value={s} onChange={(e) => setScenes(scenes.map((x, j) => (j === i ? e.target.value : x)))} placeholder="Deskripsi adegan..." className="flex-1 bg-transparent py-2 text-sm outline-none" />
                      <button onClick={() => setScenes(scenes.filter((_, j) => j !== i))} disabled={scenes.length === 1} className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </section>

                <section className="space-y-3">
                  <h2 className="font-extrabold">Gaya Editing <span className="text-destructive">*</span></h2>
                  <div className="grid grid-cols-2 gap-3">
                    {STYLES.map(({ id, icon: Icon }) => (
                      <button key={id} onClick={() => setStyle(id)} className={`flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center text-sm font-bold transition ${style === id ? "border-primary text-primary shadow-glow" : "border-border text-muted-foreground"}`}>
                        <Icon size={28} /> {id}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-2">
                  <h2 className="font-extrabold">Tiruan editing</h2>
                  <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="cth: gaya editing kreator favoritmu" className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary" />
                </section>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setOut(""); setTopic(""); setRef(""); }} className="rounded-xl border border-input py-3.5 font-bold">Batal</button>
                  <button onClick={generate} disabled={loading} className="rounded-xl bg-primary py-3.5 font-extrabold text-primary-foreground shadow-glow disabled:opacity-60">{loading ? "AI sedang menulis..." : "Generate dengan AI"}</button>
                </div>
                {err && <p className="text-center text-sm font-semibold text-destructive">{err}</p>}

                {out && (
                  <section className="space-y-3 rounded-2xl border border-primary/40 bg-card p-4">
                    <p className="text-xs font-bold text-muted-foreground">Hasil bisa diedit langsung:</p>
                    <textarea value={out} onChange={(e) => setOut(e.target.value)} rows={14} className="w-full resize-y rounded-xl border border-input bg-background p-3 text-xs leading-relaxed outline-none focus:border-primary" />
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => { navigator.clipboard.writeText(out); flash("Prompt disalin!"); }} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"><Copy size={16} /> Copy Prompt</button>
                      <button onClick={() => {
                        const all = JSON.parse(localStorage.getItem("mc88_saved") || "[]");
                        localStorage.setItem("mc88_saved", JSON.stringify([{ at: Date.now(), topic, out }, ...all]));
                        flash("Prompt disimpan!");
                      }} className="flex items-center justify-center gap-2 rounded-xl border border-primary py-3 text-sm font-bold text-primary"><Save size={16} /> Simpan</button>
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </main>
      <Footer />

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-success px-4 py-2 text-sm font-bold text-primary-foreground">{toast}</div>}

      {limit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-5 backdrop-blur">
          <div className="relative w-full max-w-sm rounded-2xl border border-primary bg-card p-6 text-center shadow-glow">
            <button onClick={() => setLimit(false)} className="absolute right-3 top-3 text-muted-foreground"><X size={18} /></button>
            <h3 className="text-xl font-extrabold">Jatah Gratis Habis</h3>
            <p className="mt-2 text-sm text-muted-foreground">Upgrade Pro 79rb di WinMe untuk akses unlimited.</p>
            <a href={WINME} target="_blank" rel="noreferrer" className="mt-5 block rounded-xl bg-primary py-3.5 font-extrabold text-primary-foreground">Upgrade Pro 79rb</a>
          </div>
        </div>
      )}
    </div>
  );
}
