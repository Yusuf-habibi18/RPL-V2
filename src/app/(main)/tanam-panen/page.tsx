import { BarChart3, CalendarClock, ClipboardList, Scale, Sprout, Wheat } from "lucide-react";
import { BarChartSimple } from "@/components/charts/BarChartSimple";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { GrowthTimeline } from "@/components/viz/GrowthTimeline";
import { ProgressRing } from "@/components/viz/ProgressRing";
import { requireUser } from "@/lib/current-user";
import { ambilDataTanamPetani } from "@/lib/data/panen";
import { formatAngka, formatBerat, formatTanggalPendek, judulKata } from "@/lib/format";
import { CatatPanen, RiwayatKegiatan, TabelTanam, TambahTanam } from "./_components";

export const metadata = { title: "Tanam & Panen" };

const isoWib = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(d);

/** FR-04, FR-18, FR-19: data tanam, estimasi panen, realisasi panen. */
export default async function TanamPanenPage() {
  const user = await requireUser(["PETANI"]);
  const { baris, opsiLahan, opsiVarietas } = await ambilDataTanamPetani(user.id);
  const hariIni = isoWib(new Date());

  const aktif = baris.filter((b) => b.status === "AKTIF");
  const selesai = baris.filter((b) => b.status === "SELESAI" && b.realisasi);
  const segeraPanen = aktif.filter((b) => b.sisaHari !== null && b.sisaHari <= 14).length;
  const totalPanen = selesai.reduce((n, b) => n + b.realisasi!.hasilKg, 0);
  const luasSelesai = selesai.reduce((n, b) => n + b.luasTanamHa, 0);
  const produktivitas = luasSelesai ? totalPanen / luasSelesai : 0;

  const grafik = [...selesai]
    .reverse()
    .slice(-8)
    .map((b) => ({
      musim: `${b.lahan.split(" ")[0]} ${formatTanggalPendek(b.tanggalTanam)}`,
      produktivitas: Math.round((b.realisasi!.hasilKg / b.luasTanamHa / 1000) * 10) / 10,
    }));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Siklus tanam"
        title="Tanam & panen"
        description="Catat tanggal tanam, pantau umur tanaman, dan simpan hasil panen setiap musim."
        action={<TambahTanam opsiLahan={opsiLahan} opsiVarietas={opsiVarietas} hariIni={hariIni} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Tanaman aktif" nilai={aktif.length} ikon={<Sprout />} tone="info" keterangan={`${formatAngka(aktif.reduce((n, b) => n + b.luasTanamHa, 0), 2)} ha ditanami`} />
        <StatCard label="Panen ≤ 14 hari" nilai={segeraPanen} ikon={<CalendarClock />} tone={segeraPanen ? "warning" : "neutral"} keterangan={segeraPanen ? "Siapkan tenaga & pembeli" : "Belum ada yang dekat"} />
        <StatCard label="Total panen tercatat" nilai={formatBerat(totalPanen)} ikon={<Wheat />} tone="success" keterangan={`${selesai.length} musim`} />
        <StatCard label="Produktivitas rata-rata" nilai={formatAngka(produktivitas / 1000, 1)} satuan="ton/ha" ikon={<Scale />} tone="primary" />
      </div>

      {/* Tanaman aktif */}
      <section aria-labelledby="judul-aktif" className="space-y-3">
        <h2 id="judul-aktif" className="text-lg font-semibold">
          Sedang tumbuh
        </h2>
        {aktif.length === 0 ? (
          <Card>
            <EmptyState icon={Sprout} title="Belum ada tanaman aktif" description="Catat tanam baru untuk mulai memantau umur tanaman dan estimasi panen." />
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {aktif.map((b) => {
              const progres = b.hst / b.umurPanenHst;
              return (
                <Card key={b.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <ProgressRing nilai={progres} ukuran={84} label={`Progres ${Math.round(Math.min(progres, 1) * 100)}%`} warna={progres >= 0.88 ? "#D97706" : "#20B66A"}>
                      <div>
                        <p className="text-base font-bold leading-none num">{b.hst}</p>
                        <p className="text-[10px] text-muted">HST</p>
                      </div>
                    </ProgressRing>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">{b.lahan}</h3>
                        <Badge tone="info">{judulKata(b.fase)}</Badge>
                      </div>
                      <p className="text-sm text-muted">
                        {b.komoditas} · {b.varietas} · {formatAngka(b.luasTanamHa, 2)} ha · tanam {b.tanggalTanamLabel}
                      </p>
                      <p className="mt-1.5 text-sm">
                        Estimasi panen <span className="font-semibold">{b.estimasiLabel ?? "–"}</span>
                        {b.sisaHari !== null && (
                          <span className={b.sisaHari <= 7 ? "font-semibold text-warning" : "text-muted"}>
                            {" "}
                            · {b.sisaHari > 0 ? `${b.sisaHari} hari lagi` : "sudah masuk masa panen"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <GrowthTimeline fases={b.fases} hst={b.hst} umurPanenHst={b.umurPanenHst} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                    <CatatPanen
                      dataTanamId={b.id}
                      lahan={b.lahan}
                      estimasiLabel={b.estimasiLabel}
                      tanggalTanamIso={isoWib(b.tanggalTanam)}
                      hariIni={hariIni}
                      bisa={b.bisaCatatPanen}
                    />
                    <RiwayatKegiatan lahan={b.lahan} kegiatan={b.kegiatan} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader icon={<BarChart3 />} title="Produktivitas per musim" description="Hasil panen per hektar (ton/ha)" />
          <div className="p-5 pt-3">
            {grafik.length ? (
              <BarChartSimple data={grafik} xKey="musim" yKey="produktivitas" label="Produktivitas" satuan=" ton/ha" warna="#16834A" tinggi={240} />
            ) : (
              <EmptyState icon={BarChart3} title="Belum ada data panen" />
            )}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader icon={<CalendarClock />} title="Estimasi vs realisasi" description="Ketepatan tanggal estimasi panen" />
          <ul className="divide-y divide-line px-5 pb-3">
            {selesai.slice(0, 6).map((b) => {
              const tglEst = b.estimasiLabel;
              return (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{b.lahan}</p>
                    <p className="truncate text-xs text-muted">
                      Estimasi {tglEst ?? "–"} · panen {b.realisasi!.tanggalLabel}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold num">{formatBerat(b.realisasi!.hasilKg)}</span>
                </li>
              );
            })}
            {selesai.length === 0 && <li className="py-6 text-center text-sm text-muted">Belum ada panen tercatat.</li>}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader icon={<ClipboardList />} title="Semua catatan tanam" description="Musim berjalan dan musim sebelumnya" />
        <div className="p-5">
          <TabelTanam
            baris={baris.map((b) => ({
              id: b.id,
              lahan: b.lahan,
              varietas: `${b.komoditas} · ${b.varietas}`,
              tanggalTanamLabel: b.tanggalTanamLabel,
              luasTanamHa: b.luasTanamHa,
              hst: b.hst,
              fase: b.fase,
              estimasiLabel: b.estimasiLabel,
              status: b.status,
              realisasi: b.realisasi,
            }))}
          />
        </div>
      </Card>
    </div>
  );
}
