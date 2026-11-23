import { BarChart3, BellRing, CalendarRange, LandPlot, Layers, MapPinned, Scale, Sprout, Users, Wheat } from "lucide-react";
import Link from "next/link";
import { BarChartSimple } from "@/components/charts/BarChartSimple";
import { DonutChart } from "@/components/charts/DonutChart";
import { AlertList } from "@/components/dashboard/AlertList";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { InfoNote, PageHeader } from "@/components/ui/misc";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import type { PenggunaAktif } from "@/lib/current-user";
import { dataDashboardDinas } from "@/lib/data/dashboard";
import { formatAngka, formatBerat } from "@/lib/format";

export async function DinasView({ user }: { user: PenggunaAktif }) {
  const d = await dataDashboardDinas(user);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={user.wilayah ?? "Semua wilayah"}
        title="Analitik pertanian wilayah"
        description="Produksi, luas tanam, dan kondisi lahan yang terpantau sensor."
        action={
          <Link href="/laporan" className="text-sm font-semibold text-primary hover:underline">
            Buka laporan →
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Petani terdaftar" nilai={d.jumlahPetani} ikon={<Users />} tone="primary" keterangan={`${d.perDesa.length} desa`} />
        <StatCard label="Luas lahan dipantau" nilai={formatAngka(d.luasTotal, 2)} satuan="ha" ikon={<LandPlot />} tone="info" keterangan={`${formatAngka(d.luasTanamAktif, 2)} ha sedang ditanami`} />
        <StatCard label="Produksi 12 bulan" nilai={formatBerat(d.produksiSetahun)} ikon={<Wheat />} tone="success" keterangan="Dari realisasi panen tercatat" />
        <StatCard
          label="Produktivitas rata-rata"
          nilai={formatAngka(d.produktivitas / 1000, 1)}
          satuan="ton/ha"
          ikon={<Scale />}
          tone="info"
          keterangan={`${d.status.WASPADA + d.status.KRITIS} lahan perlu perhatian`}
          keteranganTone={d.status.KRITIS ? "danger" : undefined}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader icon={<BarChart3 />} title="Tren produksi bulanan" description="Total hasil panen (kg) per bulan" />
          <div className="p-5 pt-3">
            <BarChartSimple data={d.produksiBulanan} xKey="bulan" yKey="hasilKg" label="Produksi" format="berat" tinggi={260} />
          </div>
        </Card>
        <Card>
          <CardHeader icon={<CalendarRange />} title="Prakiraan panen" description="3 bulan ke depan" />
          <div className="space-y-3 p-5">
            {d.prakiraan.map((p) => (
              <div key={p.bulan} className="rounded-xl border border-line bg-bg/40 p-3.5">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">{p.bulan}</p>
                  <p className="text-lg font-bold num">{p.perkiraanKg ? `±${formatBerat(p.perkiraanKg)}` : "–"}</p>
                </div>
                <p className="mt-0.5 text-xs text-muted">{formatAngka(p.luasHa, 2)} ha diperkirakan panen</p>
              </div>
            ))}
            <p className="text-xs text-muted">Perkiraan = luas yang akan panen × produktivitas rata-rata historis. Estimasi berbasis ML direncanakan di fase 2.</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<Sprout />} title="Fase tanaman aktif" description="Berdasarkan luas tanam (ha)" />
          <div className="p-5">
            <DonutChart data={d.distribusiFase} satuan=" ha" labelTengah="ha ditanam" />
          </div>
        </Card>
        <Card>
          <CardHeader icon={<Layers />} title="Sebaran varietas" description="Berdasarkan luas tanam (ha)" />
          <div className="p-5">
            <DonutChart data={d.distribusiVarietas} satuan=" ha" labelTengah="ha ditanam" />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader icon={<MapPinned />} title="Perbandingan per desa" description="Kondisi & produksi 12 bulan terakhir" />
          <div className="p-5">
            <Table>
              <thead>
                <tr>
                  <Th>Desa</Th>
                  <Th className="text-right">Lahan</Th>
                  <Th className="text-right">Luas</Th>
                  <Th className="text-right">Sehat</Th>
                  <Th className="text-right">Perlu perhatian</Th>
                  <Th className="text-right">Produksi</Th>
                </tr>
              </thead>
              <tbody>
                {d.perDesa.map((x) => (
                  <Tr key={x.desa}>
                    <Td className="font-semibold">{x.desa}</Td>
                    <Td className="text-right num">{x.lahan}</Td>
                    <Td className="text-right num">{formatAngka(x.luasHa, 2)} ha</Td>
                    <Td className="text-right text-success num">{x.sehat}</Td>
                    <Td className={x.perhatian ? "text-right font-semibold text-warning num" : "text-right num"}>{x.perhatian}</Td>
                    <Td className="text-right num">{formatBerat(x.produksiKg)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <InfoNote className="mt-4">Peta sebaran lahan (FR-25) belum ditampilkan karena koordinat lahan belum tersedia secara andal. Direncanakan di fase 2.</InfoNote>
          </div>
        </Card>
        <Card>
          <CardHeader icon={<BellRing />} title="Peringatan di wilayah" description="Terbaru" />
          <div className="p-5">
            <AlertList peringatan={d.peringatan} tampilkanPemilik />
          </div>
        </Card>
      </div>
    </div>
  );
}
