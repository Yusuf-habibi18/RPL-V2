import { BellRing, Droplets, Sprout } from "lucide-react";
import { FieldBackdrop } from "@/components/layout/FieldBackdrop";
import { Logo } from "@/components/layout/Logo";
import { LeafHologram } from "@/components/viz/LeafHologram";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Masuk" };

const FITUR = [
  { ikon: BellRing, judul: "Peringatan dini", teks: "Kabar langsung saat tanah terlalu kering, pH berubah, atau sensor terputus." },
  { ikon: Droplets, judul: "Rekomendasi siram & pupuk", teks: "Saran tindakan dari data sensor dan pedoman penyuluh." },
  { ikon: Sprout, judul: "Estimasi panen", teks: "Pantau umur tanaman dan perkiraan tanggal panen." },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;

  return (
    <main className="relative grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <FieldBackdrop />

      {/* Panel identitas (desktop) */}
      <section className="relative hidden overflow-hidden bg-sidebar p-12 text-white lg:flex lg:flex-col">
        {/* grid teknis + cahaya emerald */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(163_230_53/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(163_230_53/0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="anim-glow pointer-events-none absolute -left-32 -top-32 size-[36rem] rounded-full bg-emerald/25 blur-3xl" />
        <Logo terang className="relative" />
        <div className="relative my-auto max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Smart Farming Intelligence</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight">
            Data sensor lahan menjadi <span className="bg-gradient-to-r from-lime to-emerald bg-clip-text text-transparent">tindakan nyata</span> di
            kebun Anda.
          </h1>
          <ul className="mt-10 space-y-5">
            {FITUR.map(({ ikon: Ikon, judul, teks }) => (
              <li key={judul} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-lime ring-1 ring-white/15">
                  <Ikon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold">{judul}</span>
                  <span className="block text-sm text-white/65">{teks}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <LeafHologram terang className="pointer-events-none absolute -bottom-10 -right-16 h-[420px] w-[420px] opacity-90" />
        <p className="relative font-mono text-xs text-white/45">Proyek Rekayasa Perangkat Lunak · Kelompok 2</p>
      </section>

      {/* Form */}
      <section className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="panel corner-ticks rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight">Masuk</h2>
            <p className="mb-6 mt-1 text-sm text-muted">Gunakan akun yang diberikan admin atau kelompok tani Anda.</p>
            <LoginForm tujuan={next} tampilkanDemo={process.env.NODE_ENV !== "production" || process.env.TAMPILKAN_AKUN_DEMO === "1"} />
          </div>
          <p className="mt-6 text-center text-xs text-muted">Lupa kata sandi? Hubungi admin sistem atau ketua kelompok tani.</p>
        </div>
      </section>
    </main>
  );
}
