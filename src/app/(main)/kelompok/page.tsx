import { Activity, CalendarDays, LandPlot, Layers, TriangleAlert, Users } from "lucide-react";
import { DonutChart } from "@/components/charts/DonutChart";
import { AlertList } from "@/components/dashboard/AlertList";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { requireUser } from "@/lib/current-user";
import { ambilDataKelompok } from "@/lib/data/kelompok";
import { hitungStatus } from "@/lib/data/lahan";
import { formatAngka, formatTanggal, judulKata } from "@/lib/format";
import { DaftarAnggota } from "./DaftarAnggota";

export const metadata = { title: "Kelompok Tani" };

/** FR-20, FR-21: data lahan anggota dan rekap jadwal panen kelompok (khusus ketua). */
export default async function KelompokPage() {
  const user = await requireUser(["KETUA_KELOMPOK"]);
  const d = await ambilDataKelompok(user);
  if (!d) {
    return (
      <Card>
        <EmptyState icon={Users} title="Anda belum memimpin kelompok tani" description="Minta admin sistem menetapkan Anda sebagai ketua kelompok." />
      </Card>
    );
  }

  const status = hitungStatus(d.lahan);
  const luasPerAnggota = d.anggota
    .filter((a) => a.luasHa > 0)
    .sort((a, b) => b.luasHa - a.luasHa)
    .map((a) => ({ label: a.nama, nilai: Math.round(a.luasHa * 100) / 100 }));
  // Maks. 4 kategori warna: sisanya digabung sebagai "Lainnya".
  const donut = luasPerAnggota.length > 4
    ? [...luasPerAnggota.slice(0, 3), { label: "Lainnya", nilai: Math.round(luasPerAnggota.slice(3).reduce((n, x) => n + x.nilai, 0) * 100) / 100 }]
    : luasPerAnggota;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={d.kelompok.desa ? `Desa ${d.kelompok.desa} · ${d.kelompok.wilayah}` : d.kelompok.wilayah}
        title={d.kelompok.nama}
        description="Anggota, kondisi lahan, aktivitas, dan jadwal panen kelompok."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Anggota" nilai={d.anggota.length} ikon={<Users />} tone="primary" />
        <StatCard label="Total lahan" nilai={d.lahan.length} ikon={<LandPlot />} tone="info" keterangan={`${formatAngka(d.lahan.reduce((n, l) => n + l.luasHa, 0), 2)} ha`} />
        <StatCard label="Perlu perhatian" nilai={status.WASPADA + status.KRITIS} ikon={<TriangleAlert />} tone={status.KRITIS ? "danger" : status.WASPADA ? "warning" : "success"} keterangan={`${status.SEHAT} lahan sehat`} />
        <StatCard label="Panen ≤ 30 hari" nilai={d.jadwalPanen.filter((j) => j.estimasi.getTime() - Date.now() <= 30 * 86_400_000).length} ikon={<CalendarDays />} tone="warning" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader icon={<Users />} title="Anggota kelompok" description="Klik anggota untuk melihat lahan & kondisinya" />
          <div className="p-5">
            <DaftarAnggota
              anggota={d.anggota.map((a) => ({
                id: a.id,
                nama: a.nama,
                email: a.email,
                noHp: a.noHp,
                aktif: a.aktif,
                luasHa: a.luasHa,
                statusTerburuk: a.statusTerburuk,
                aktivitasTerakhir: a.aktivitasTerakhir,
                lahan: a.lahan.map((l) => ({
                  id: l.id,
                  nama: l.nama,
                  luasHa: l.luasHa,
                  status: l.status,
                  kelembapan: l.bacaan?.kelembapanTanah ?? null,
                  ph: l.bacaan?.ph ?? null,
                  suhu: l.bacaan?.suhu ?? null,
                  fase: l.tanam?.fase ?? null,
                  hst: l.tanam?.hst ?? null,
                  estimasiLabel: l.tanam?.estimasiPanen ? formatTanggal(l.tanam.estimasiPanen) : null,
                  sensor: l.sensor.map((s) => ({ kode: s.kode, status: s.status })),
                })),
              }))}
            />
          </div>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader icon={<Layers />} title="Sebaran luas lahan" description="Per anggota (ha)" />
            <div className="p-5">
              <DonutChart data={donut} satuan=" ha" labelTengah="ha total" />
            </div>
          </Card>
          <Card>
            <CardHeader icon={<TriangleAlert />} title="Peringatan kelompok" />
            <div className="p-5">
              <AlertList peringatan={d.peringatan} tampilkanPemilik />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<CalendarDays />} title="Rekap jadwal panen" description="Urut dari yang paling dekat (FR-21)" />
          <div className="space-y-3 p-5">
            {d.jadwalPanen.map((j) => {
              const sisa = Math.ceil((j.estimasi.getTime() - Date.now()) / 86_400_000);
              const progres = Math.min(1, j.hst / j.umurPanenHst);
              return (
                <div key={j.lahanId}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <p className="truncate">
                      <span className="font-semibold">{j.lahan}</span> <span className="text-muted">· {j.pemilik}</span>
                    </p>
                    <p className="shrink-0 font-semibold num">{formatTanggal(j.estimasi)}</p>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-card-2" role="img" aria-label={`Progres ${Math.round(progres * 100)}%`}>
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald" style={{ width: `${progres * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    HST {j.hst}/{j.umurPanenHst} · {formatAngka(j.luasHa, 2)} ha ·{" "}
                    <span className={sisa <= 7 ? "font-semibold text-warning" : ""}>{sisa > 0 ? `${sisa} hari lagi` : "masa panen"}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <CardHeader icon={<Activity />} title="Aktivitas terbaru" />
          <ul className="divide-y divide-line px-5 pb-3">
            {d.kegiatan.map((k) => (
              <li key={k.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {k.oleh} <span className="font-normal text-muted">· {judulKata(k.jenis)}</span>
                  </p>
                  <p className="truncate text-xs text-muted">
                    {k.lahan} · {k.keterangan ?? "-"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted">{k.waktuLabel}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
