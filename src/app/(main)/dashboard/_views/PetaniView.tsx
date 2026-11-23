import { BellRing, CalendarDays, Droplets, FlaskConical, Gauge, LandPlot, MapPin, Sprout, Thermometer, Wheat } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SensorTrendCard } from "@/components/charts/SensorTrendCard";
import { AlertList } from "@/components/dashboard/AlertList";
import { LandSwitcher } from "@/components/dashboard/LandSwitcher";
import { PlantingSummary } from "@/components/dashboard/PlantingSummary";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { SensorOverview } from "@/components/dashboard/SensorOverview";
import { StatCard } from "@/components/dashboard/StatCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { type Tone } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/misc";
import { BadgeKondisi, STATUS_KONDISI } from "@/components/ui/status";
import { LeafHologram } from "@/components/viz/LeafHologram";
import type { PenggunaAktif } from "@/lib/current-user";
import { dataDashboardPetani } from "@/lib/data/dashboard";
import { cn } from "@/lib/cn";
import { formatAngka, formatHari, formatLuas, formatTanggal, salam } from "@/lib/format";

function JawabanCepat({
  ikon,
  tanya,
  jawab,
  sub,
  tone,
  href,
}: {
  ikon: ReactNode;
  tanya: string;
  jawab: string;
  sub?: string;
  tone: Tone;
  href?: string;
}) {
  const warna: Record<Tone, string> = {
    success: "text-success bg-success/12 ring-success/30",
    warning: "text-warning bg-warning/12 ring-warning/30",
    danger: "text-danger bg-danger/12 ring-danger/35",
    info: "text-data bg-data/10 ring-data/25",
    primary: "text-primary bg-soft ring-primary/25",
    neutral: "text-muted bg-soft ring-line",
  };
  const isi = (
    <>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset [&>svg]:size-5", warna[tone])}>{ikon}</span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted">{tanya}</span>
        <span className="block font-bold leading-snug">{jawab}</span>
        {sub && <span className="block truncate text-xs text-muted">{sub}</span>}
      </span>
    </>
  );
  // min-w-0: item grid tidak boleh melebar mengikuti teks yang dipotong (overflow di ponsel).
  const kelas = "flex min-w-0 items-center gap-3 rounded-xl border border-line bg-bg/45 p-3 backdrop-blur-sm transition-colors";
  return href ? (
    <Link href={href} className={cn(kelas, "hover:border-primary/40")}>
      {isi}
    </Link>
  ) : (
    <div className={kelas}>{isi}</div>
  );
}

/** Dashboard petani: menjawab "apakah lahan sehat, perlu disiram, ada peringatan, apa yang harus dilakukan, kapan panen". */
export async function PetaniView({ user, lahanId }: { user: PenggunaAktif; lahanId?: string }) {
  const d = await dataDashboardPetani(user, lahanId);
  const l = d.terpilih;

  if (!l) {
    return (
      <Card>
        <EmptyState
          icon={LandPlot}
          title="Belum ada lahan terdaftar"
          description="Minta admin atau ketua kelompok tani mendaftarkan lahan dan sensor Anda agar kondisi lahan bisa dipantau."
        />
      </Card>
    );
  }

  const namaDepan = user.nama.split(" ")[0];
  const info = STATUS_KONDISI[l.status];
  const rekLahan = d.rekomendasi.filter((r) => r.lahanId === l.id);
  const siram = rekLahan.find((r) => r.jenis === "SIRAM");
  // Tanpa rekomendasi menunggu tetapi sensor masih kering (mis. baru disiram, data baru belum masuk).
  const masihKering = l.pelanggaran.some((p) => p.parameter === "KELEMBAPAN_TANAH" && p.arah === "RENDAH");
  const peringatanLahan = d.peringatan.filter((p) => p.lahanId === l.id);
  const b = l.bacaan;
  const ambang = (p: string) => l.ambang.find((a) => a.parameter === p);
  const nilaiTone = (p: string): Tone => {
    const x = l.pelanggaran.find((v) => v.parameter === p);
    return !x ? "success" : x.tingkat === "BAHAYA" ? "danger" : "warning";
  };
  const sisaPanen = l.tanam?.estimasiPanen ? Math.ceil((l.tanam.estimasiPanen.getTime() - Date.now()) / 86_400_000) : null;
  const totalLuas = d.lahan.reduce((n, x) => n + x.luasHa, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* 1 · Sambutan + jawaban cepat */}
      <section className="panel corner-ticks relative order-1 overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-soft p-5 sm:p-7 lg:col-span-3">
        <div className="hud-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_85%_0%,rgb(163_230_53/0.22),transparent_70%)]" />
        <LeafHologram className="pointer-events-none absolute -right-6 -top-10 hidden h-80 w-80 opacity-70 md:block" />
        <div className="relative">
          <p className="text-sm text-muted">{formatHari(new Date())}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {salam()}, {namaDepan}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <MapPin className="size-4 text-primary" aria-hidden />
            <span className="font-semibold text-fg">{l.nama}</span>
            {l.tanam && <span>· {l.tanam.komoditas} {l.tanam.varietas}</span>}
            <span>· {formatLuas(l.luasHa)}</span>
            {l.jenisTanah && <span className="hidden sm:inline">· {l.jenisTanah}</span>}
          </p>
          {d.lahan.length > 1 && (
            <div className="mt-4">
              <LandSwitcher lahan={d.lahan} aktif={l.id} basePath="/dashboard" />
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:max-w-[calc(100%-14rem)] xl:grid-cols-4">
            <JawabanCepat
              ikon={<info.ikon />}
              tanya="Kondisi lahan"
              jawab={info.kalimat}
              sub={l.pelanggaran.length ? `${l.pelanggaran.length} nilai di luar batas` : b ? "Semua nilai dalam batas" : undefined}
              tone={info.tone}
            />
            <JawabanCepat
              ikon={<Droplets />}
              tanya="Perlu disiram?"
              jawab={
                siram
                  ? siram.tindakan.startsWith("Tunda")
                    ? "Tunda, akan hujan"
                    : `Ya · ${siram.jadwalLabel}`
                  : masihKering
                    ? "Pantau kelembapan"
                    : "Tidak perlu"
              }
              sub={b ? `Kelembapan ${formatAngka(b.kelembapanTanah)}%${masihKering && !siram ? " · masih di bawah batas" : ""}` : undefined}
              tone={siram ? (siram.prioritas === "TINGGI" ? "danger" : "info") : masihKering ? "warning" : "success"}
              href={siram ? "/rekomendasi?jenis=SIRAM" : undefined}
            />
            <JawabanCepat
              ikon={<BellRing />}
              tanya="Peringatan"
              jawab={peringatanLahan.length ? `${peringatanLahan.length} peringatan aktif` : "Tidak ada"}
              sub={peringatanLahan[0]?.pesan}
              tone={peringatanLahan.some((p) => p.tingkat === "BAHAYA") ? "danger" : peringatanLahan.length ? "warning" : "success"}
            />
            <JawabanCepat
              ikon={<Wheat />}
              tanya="Perkiraan panen"
              jawab={l.tanam?.estimasiPanen ? formatTanggal(l.tanam.estimasiPanen, "long") : "Belum ada data tanam"}
              sub={sisaPanen !== null ? (sisaPanen > 0 ? `${sisaPanen} hari lagi` : "Sudah masuk masa panen") : undefined}
              tone="primary"
              href="/tanam-panen"
            />
          </div>
        </div>
      </section>

      {/* 2 · Peringatan (prioritas kedua di ponsel) */}
      <Card className="order-2 lg:order-4">
        <CardHeader icon={<BellRing />} title="Peringatan dini" description="Semua lahan Anda" />
        <div className="p-5">
          <AlertList peringatan={d.peringatan.slice(0, 4)} />
        </div>
      </Card>

      {/* 3 · Angka ringkas */}
      <div className="order-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:order-2 lg:col-span-3 xl:grid-cols-5">
        <StatCard label="Luas lahan dipantau" nilai={formatAngka(totalLuas, 2)} satuan="ha" ikon={<LandPlot />} tone="primary" keterangan={`${d.lahan.length} lahan · ${d.lahan.reduce((n, x) => n + x.sensor.length, 0)} sensor`} />
        <StatCard
          label="Kelembapan tanah"
          nilai={b ? formatAngka(b.kelembapanTanah) : "–"}
          satuan="%"
          ikon={<Droplets />}
          tone="info"
          keterangan={ambang("KELEMBAPAN_TANAH") ? `Aman ${ambang("KELEMBAPAN_TANAH")!.min}–${ambang("KELEMBAPAN_TANAH")!.maks}%` : undefined}
          keteranganTone={b ? nilaiTone("KELEMBAPAN_TANAH") : undefined}
        />
        <StatCard
          label="pH tanah"
          nilai={b ? formatAngka(b.ph, 2) : "–"}
          ikon={<FlaskConical />}
          tone="info"
          keterangan={ambang("PH") ? `Aman ${ambang("PH")!.min}–${ambang("PH")!.maks}` : undefined}
          keteranganTone={b ? nilaiTone("PH") : undefined}
        />
        <StatCard
          label="Suhu"
          nilai={b ? formatAngka(b.suhu) : "–"}
          satuan="°C"
          ikon={<Thermometer />}
          tone="info"
          keterangan={ambang("SUHU") ? `Aman ${ambang("SUHU")!.min}–${ambang("SUHU")!.maks}°C` : undefined}
          keteranganTone={b ? nilaiTone("SUHU") : undefined}
        />
        <StatCard
          label="Peringatan aktif"
          nilai={d.peringatan.length}
          ikon={<BellRing />}
          tone={d.peringatan.length ? "danger" : "success"}
          keterangan={d.peringatan.length ? "Lihat daftar peringatan" : "Semua lahan aman"}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* 4 · Kondisi tanah */}
      <Card className="order-4 lg:order-3 lg:col-span-2">
        <CardHeader
          icon={<Gauge />}
          title="Kondisi tanah saat ini"
          description={`Sensor di ${l.nama}`}
          action={<BadgeKondisi status={l.status} size="md" />}
        />
        <div className="p-5">
          <SensorOverview lahan={l} />
        </div>
      </Card>

      {/* 5 · Rekomendasi */}
      <Card className="order-5 lg:order-8">
        <CardHeader
          icon={<Droplets />}
          title="Yang perlu dilakukan"
          description="Rekomendasi hari ini"
          action={
            <Link href="/rekomendasi" className="text-sm font-semibold text-primary hover:underline">
              Semua
            </Link>
          }
        />
        <div className="space-y-3 p-5">
          {d.rekomendasi.length === 0 ? (
            <p className="rounded-xl border border-success/25 bg-success/5 p-4 text-sm">Tidak ada tindakan mendesak. Lahan dalam kondisi baik.</p>
          ) : (
            d.rekomendasi.slice(0, 2).map((r) => <RecommendationCard key={r.id} rek={r} bisaAksi ringkas />)
          )}
          {d.rekomendasi.length > 2 && (
            <Link href="/rekomendasi" className="block text-center text-sm font-semibold text-primary hover:underline">
              +{d.rekomendasi.length - 2} rekomendasi lain
            </Link>
          )}
        </div>
      </Card>

      {/* 6 · Tanam & panen */}
      <Card className="order-6 lg:order-7 lg:col-span-2">
        <CardHeader
          icon={<Sprout />}
          title="Pertumbuhan & panen"
          description="Tanaman aktif di lahan terpilih"
          action={
            <Link href="/tanam-panen" className="text-sm font-semibold text-primary hover:underline">
              Kelola
            </Link>
          }
        />
        <div className="p-5">
          {l.tanam ? (
            <PlantingSummary tanam={l.tanam} lahan={l.nama} />
          ) : (
            <EmptyState icon={CalendarDays} title="Belum ada tanaman aktif" description="Catat data tanam untuk mendapatkan estimasi panen." />
          )}
          {d.lahan.filter((x) => x.id !== l.id && x.tanam).length > 0 && (
            <ul className="mt-5 divide-y divide-line rounded-xl border border-line">
              {d.lahan
                .filter((x) => x.id !== l.id && x.tanam)
                .map((x) => (
                  <li key={x.id}>
                    <Link href={`/dashboard?lahan=${x.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-soft/60">
                      <span>
                        <span className="font-semibold">{x.nama}</span>
                        <span className="text-muted"> · HST {x.tanam!.hst}</span>
                      </span>
                      <span className="text-muted">Panen ±{x.tanam!.estimasiPanen ? formatTanggal(x.tanam!.estimasiPanen) : "–"}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </Card>

      {/* 7 · Tren sensor */}
      <div className="order-7 lg:order-5 lg:col-span-2">
        <SensorTrendCard titik={d.riwayat?.titik ?? []} ambang={l.ambang} lahanId={l.id} />
      </div>

      {/* 8 · Cuaca */}
      <div className="order-8 lg:order-6">
        <WeatherCard cuaca={d.cuaca} />
      </div>
    </div>
  );
}
