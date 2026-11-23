import { Activity, BellRing, CalendarDays, CircleCheck, LandPlot, TriangleAlert, Users } from "lucide-react";
import Link from "next/link";
import { BarChartSimple } from "@/components/charts/BarChartSimple";
import { AlertList } from "@/components/dashboard/AlertList";
import { LandTable } from "@/components/dashboard/LandTable";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { STATUS_KONDISI, WARNA_STATUS } from "@/components/ui/status";
import type { PenggunaAktif } from "@/lib/current-user";
import { ambilDataKelompok } from "@/lib/data/kelompok";
import { hitungStatus, urutkanMenurutStatus } from "@/lib/data/lahan";
import { formatAngka, formatTanggal, judulKata } from "@/lib/format";

export async function KetuaView({ user }: { user: PenggunaAktif }) {
  const d = await ambilDataKelompok(user);
  if (!d) {
    return (
      <Card>
        <EmptyState icon={Users} title="Anda belum memimpin kelompok tani" description="Minta admin sistem menetapkan Anda sebagai ketua kelompok." />
      </Card>
    );
  }
  const status = hitungStatus(d.lahan);
  const perhatian = status.WASPADA + status.KRITIS;
  const luas = d.lahan.reduce((n, l) => n + l.luasHa, 0);
  const perbandingan = d.lahan
    .filter((l) => l.bacaan)
    .map((l) => ({
      lahan: l.nama,
      kelembapan: l.bacaan!.kelembapanTanah,
      warna: WARNA_STATUS[l.status],
      status: STATUS_KONDISI[l.status].label,
    }));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={d.kelompok.desa ? `Desa ${d.kelompok.desa}` : d.kelompok.wilayah}
        title={d.kelompok.nama}
        description="Ringkasan kondisi lahan, kegiatan, dan jadwal panen anggota kelompok."
        action={
          <Link href="/kelompok" className="text-sm font-semibold text-primary hover:underline">
            Kelola anggota →
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Anggota" nilai={d.anggota.length} satuan="petani" ikon={<Users />} tone="primary" keterangan={`${d.anggota.filter((a) => a.aktif).length} akun aktif`} />
        <StatCard label="Luas dikelola" nilai={formatAngka(luas, 2)} satuan="ha" ikon={<LandPlot />} tone="info" keterangan={`${d.lahan.length} lahan`} />
        <StatCard label="Lahan sehat" nilai={status.SEHAT} ikon={<CircleCheck />} tone="success" keterangan={`dari ${d.lahan.length} lahan`} />
        <StatCard
          label="Perlu perhatian"
          nilai={perhatian}
          ikon={<TriangleAlert />}
          tone={perhatian ? "danger" : "success"}
          keterangan={status.KRITIS ? `${status.KRITIS} kritis` : "Tidak ada yang kritis"}
          keteranganTone={status.KRITIS ? "danger" : undefined}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader icon={<Activity />} title="Perbandingan kelembapan tanah" description="Bacaan terakhir tiap lahan · warna = status kondisi" />
          <div className="p-5 pt-3">
            {perbandingan.length ? (
              <BarChartSimple data={perbandingan} xKey="lahan" yKey="kelembapan" label="Kelembapan" satuan="%" warnaKey="warna" keteranganKey="status" horizontal tinggi={Math.max(180, perbandingan.length * 44)} />
            ) : (
              <p className="text-sm text-muted">Belum ada data sensor.</p>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader icon={<BellRing />} title="Peringatan kelompok" description={`${d.peringatan.length} aktif`} />
          <div className="max-h-[420px] overflow-y-auto p-5">
            <AlertList peringatan={d.peringatan} tampilkanPemilik />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader icon={<LandPlot />} title="Kondisi lahan anggota" description="Urut dari yang paling butuh perhatian" />
        <div className="p-5">
          <LandTable lahan={urutkanMenurutStatus(d.lahan)} />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<CalendarDays />} title="Jadwal panen kelompok" description="Estimasi berdasarkan HST (FR-21)" />
          <ul className="divide-y divide-line px-5 pb-3">
            {d.jadwalPanen.map((j) => {
              const sisa = Math.ceil((j.estimasi.getTime() - Date.now()) / 86_400_000);
              return (
                <li key={j.lahanId} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{j.lahan}</p>
                    <p className="truncate text-xs text-muted">
                      {j.pemilik} · {j.varietas} · {formatAngka(j.luasHa, 2)} ha
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatTanggal(j.estimasi)}</p>
                    <p className={sisa <= 7 ? "text-xs font-semibold text-warning" : "text-xs text-muted"}>
                      {sisa > 0 ? `${sisa} hari lagi` : "Masa panen"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <CardHeader icon={<Activity />} title="Aktivitas anggota" description="Kegiatan budidaya terbaru" />
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
