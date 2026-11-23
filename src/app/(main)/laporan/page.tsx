import { BarChart3, BellRing, Download, FileSpreadsheet, FileText, Filter, Gauge, LandPlot, RotateCcw, Scale, Sprout, Wheat } from "lucide-react";
import Link from "next/link";
import { BarChartSimple } from "@/components/charts/BarChartSimple";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { EmptyState, InfoNote, PageHeader } from "@/components/ui/misc";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { requireUser } from "@/lib/current-user";
import { bacaFilterLaporan, dataLaporan } from "@/lib/data/laporan";
import { formatAngka, formatBerat, formatTanggal } from "@/lib/format";
import { LABEL_PERAN } from "@/types";

export const metadata = { title: "Laporan" };

const CAKUPAN = {
  PETANI: "lahan milik Anda",
  KETUA_KELOMPOK: "lahan anggota kelompok Anda",
  DINAS: "lahan di wilayah Anda",
  ADMIN: "seluruh lahan",
} as const;

/** FR-21, FR-22, FR-23: laporan kondisi, tanam, dan produksi sesuai cakupan role. */
export default async function LaporanPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const f = bacaFilterLaporan(await searchParams);
  const d = await dataLaporan(user, f);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`Cakupan: ${CAKUPAN[user.peran]}`}
        title="Laporan pertanian"
        description={`Periode ${formatTanggal(f.dari, "long")} – ${formatTanggal(f.sampai, "long")}. Data otomatis dari sensor dan catatan panen, tanpa rekap manual.`}
        action={
          <>
            {/* FR-23: endpoint /api/laporan masih 501 (Sprint 5) — tombol sengaja nonaktif, bukan unduhan palsu. */}
            <span title="Ekspor PDF belum tersedia (Sprint 5)">
              <Button variant="secondary" disabled aria-describedby="catatan-ekspor">
                <FileText /> Unduh PDF
              </Button>
            </span>
            <span title="Ekspor Excel belum tersedia (Sprint 5)">
              <Button variant="secondary" disabled aria-describedby="catatan-ekspor">
                <FileSpreadsheet /> Unduh Excel
              </Button>
            </span>
          </>
        }
      />

      <InfoNote tone="warning">
        <span id="catatan-ekspor">
          <strong>Ekspor PDF/Excel belum tersedia.</strong> Endpoint <code className="font-mono text-xs">GET /api/laporan</code> masih mengembalikan 501 dan
          dijadwalkan di Sprint 5 (FR-23). Data di halaman ini sudah lengkap dan bisa dilihat langsung.
        </span>
      </InfoNote>

      {/* Filter: form GET biasa, state tersimpan di URL */}
      <Card>
        <form method="get" action="/laporan" className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr_auto] lg:items-end">
          <Field label="Dari tanggal" htmlFor="dari">
            <Input id="dari" name="dari" type="date" defaultValue={f.dariStr} />
          </Field>
          <Field label="Sampai tanggal" htmlFor="sampai">
            <Input id="sampai" name="sampai" type="date" defaultValue={f.sampaiStr} />
          </Field>
          <Field label="Lahan" htmlFor="lahan">
            <Select id="lahan" name="lahan" defaultValue={f.lahanId ?? ""}>
              <option value="">Semua lahan ({d.opsiLahan.length})</option>
              {d.opsiLahan.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nama}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Komoditas / varietas" htmlFor="varietas">
            <Select id="varietas" name="varietas" defaultValue={f.varietasId ?? ""}>
              <option value="">Semua varietas</option>
              {d.opsiVarietas.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nama}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <button type="submit" className={buttonClass("primary", "md", "flex-1 lg:flex-none")}>
              <Filter /> Terapkan
            </button>
            <Link href="/laporan" className={buttonClass("ghost", "md")} aria-label="Atur ulang filter">
              <RotateCcw />
            </Link>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Lahan" nilai={d.jumlahLahan} ikon={<LandPlot />} tone="primary" keterangan={`${formatAngka(d.luasLahan, 2)} ha`} />
        <StatCard label="Tanam baru" nilai={d.tanamBaru} ikon={<Sprout />} tone="info" keterangan={`${formatAngka(d.luasTanamBaru, 2)} ha`} />
        <StatCard label="Produksi" nilai={formatBerat(d.produksiTotal)} ikon={<Wheat />} tone="success" keterangan={`${d.musim.length} panen`} />
        <StatCard label="Produktivitas" nilai={formatAngka(d.produktivitas / 1000, 1)} satuan="ton/ha" ikon={<Scale />} tone="info" />
        <StatCard label="Peringatan" nilai={d.totalPeringatan} ikon={<BellRing />} tone={d.totalPeringatan ? "warning" : "success"} className="col-span-2 lg:col-span-1" />
      </div>

      <Card>
        <CardHeader icon={<BarChart3 />} title="Produksi per bulan" description="Total hasil panen pada periode terpilih" />
        <div className="p-5 pt-3">
          {d.musim.length ? (
            <BarChartSimple data={d.produksiBulanan} xKey="bulan" yKey="hasilKg" label="Produksi" format="berat" warna="#16834A" />
          ) : (
            <EmptyState icon={Wheat} title="Tidak ada panen pada periode ini" description="Perluas rentang tanggal atau ubah filter." />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Gauge />} title="Ringkasan kondisi sensor" description="Rata-rata bacaan valid dan jumlah peringatan per lahan" />
        <div className="p-5">
          <Table>
            <thead>
              <tr>
                <Th>Lahan</Th>
                <Th className="text-right">Bacaan</Th>
                <Th className="text-right">Valid</Th>
                <Th className="text-right">Kelembapan</Th>
                <Th className="text-right">pH</Th>
                <Th className="text-right">Suhu</Th>
                <Th className="text-right">Waspada</Th>
                <Th className="text-right">Kritis</Th>
              </tr>
            </thead>
            <tbody>
              {d.kondisiSensor.map((k) => (
                <Tr key={k.lahanId}>
                  <Td>
                    <p className="font-semibold">{k.lahan}</p>
                    <p className="text-xs text-muted">{k.pemilik}</p>
                  </Td>
                  <Td className="text-right num">{k.bacaan.toLocaleString("id-ID")}</Td>
                  <Td className="text-right num">{k.validPersen !== null ? `${formatAngka(k.validPersen)}%` : "–"}</Td>
                  <Td className="text-right num">{k.kelembapan !== null ? `${formatAngka(k.kelembapan)}%` : "–"}</Td>
                  <Td className="text-right num">{k.ph !== null ? formatAngka(k.ph, 2) : "–"}</Td>
                  <Td className="text-right num">{k.suhu !== null ? `${formatAngka(k.suhu)}°C` : "–"}</Td>
                  <Td className={k.waspada ? "text-right font-semibold text-warning num" : "text-right num"}>{k.waspada}</Td>
                  <Td className={k.bahaya ? "text-right font-semibold text-danger num" : "text-right num"}>{k.bahaya}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Wheat />} title="Rincian panen" description="Estimasi dibandingkan realisasi" />
        <div className="p-5">
          {d.musim.length === 0 ? (
            <EmptyState icon={Download} title="Belum ada data panen" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Lahan</Th>
                  <Th>Varietas</Th>
                  <Th>Estimasi</Th>
                  <Th>Realisasi</Th>
                  <Th className="text-right">Selisih</Th>
                  <Th className="text-right">Hasil</Th>
                  <Th className="text-right">Produktivitas</Th>
                </tr>
              </thead>
              <tbody>
                {[...d.musim].reverse().map((m) => (
                  <Tr key={m.id}>
                    <Td>
                      <p className="font-semibold">{m.lahan}</p>
                      {m.desa && <p className="text-xs text-muted">Desa {m.desa}</p>}
                    </Td>
                    <Td>{m.varietas}</Td>
                    <Td className="num">{m.tanggalEstimasi ? formatTanggal(m.tanggalEstimasi) : "–"}</Td>
                    <Td className="num">{formatTanggal(m.tanggalPanen)}</Td>
                    <Td className="text-right num">{m.selisihHari === null ? "–" : `${m.selisihHari > 0 ? "+" : ""}${m.selisihHari} hari`}</Td>
                    <Td className="text-right font-semibold num">{formatBerat(m.hasilKg)}</Td>
                    <Td className="text-right num">{formatAngka(m.produktivitasKgHa / 1000, 1)} t/ha</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Card>

      <p className="text-center text-xs text-muted">Laporan untuk {LABEL_PERAN[user.peran].toLowerCase()} · {user.nama}</p>
    </div>
  );
}
