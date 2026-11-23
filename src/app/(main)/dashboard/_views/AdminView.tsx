import { BellRing, Cpu, DatabaseZap, LandPlot, Radio, Send, ShieldCheck, Users, WifiOff } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/misc";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { SignalIndicator } from "@/components/viz/SignalIndicator";
import { dataDashboardAdmin } from "@/lib/data/dashboard";
import { LABEL_PERAN, type Peran } from "@/types";

export async function AdminView() {
  const d = await dataDashboardAdmin();
  const totalBacaan = d.bacaanValid24 + d.bacaanTidakValid24;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Pusat kendali"
        title="Administrasi sistem"
        description="Infrastruktur sensor, pengguna, dan aktivitas sistem 24 jam terakhir."
        action={
          <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">
            Buka pengelolaan →
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total pengguna" nilai={d.totalPengguna} ikon={<Users />} tone="primary" keterangan={`${d.penggunaAktif} aktif`} />
        <StatCard label="Sensor terhubung" nilai={d.sensorAktif} satuan={`/ ${d.sensor.length}`} ikon={<Radio />} tone="success" keterangan="Mengirim data < 30 menit" />
        <StatCard
          label="Sensor terputus"
          nilai={d.sensorOffline}
          ikon={<WifiOff />}
          tone={d.sensorOffline ? "warning" : "success"}
          keterangan={d.sensorOffline ? "Perlu dicek di lapangan" : "Semua sensor normal"}
          keteranganTone={d.sensorOffline ? "warning" : undefined}
        />
        <StatCard label="Lahan terdaftar" nilai={d.jumlahLahan} ikon={<LandPlot />} tone="info" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={<Cpu />}
            title="Status perangkat sensor"
            description="NFR-13: tidak mengirim data > 30 menit = terputus"
            action={
              <Link href="/admin?tab=sensor" className="text-sm font-semibold text-primary hover:underline">
                Kelola
              </Link>
            }
          />
          <div className="p-5">
            <Table>
              <thead>
                <tr>
                  <Th>Sensor</Th>
                  <Th>Lahan</Th>
                  <Th>Data terakhir</Th>
                </tr>
              </thead>
              <tbody>
                {d.sensor.map((s) => (
                  <Tr key={s.id}>
                    <Td>
                      <SignalIndicator status={s.status} kode={s.kode} terakhir={s.terakhirLabel} ringkas />
                    </Td>
                    <Td>
                      <p className="font-medium">{s.lahan}</p>
                      <p className="text-xs text-muted">{s.pemilik}</p>
                    </Td>
                    <Td className="text-sm text-muted">
                      {s.terakhirLabel}
                      {s.levelBaterai != null && <span className="ml-2 num">· baterai {s.levelBaterai}%</span>}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader icon={<DatabaseZap />} title="Aktivitas 24 jam" />
            <dl className="grid grid-cols-2 gap-3 p-5">
              {[
                { label: "Bacaan diterima", nilai: totalBacaan, ikon: DatabaseZap },
                { label: "Ditandai tidak valid", nilai: d.bacaanTidakValid24, ikon: ShieldCheck },
                { label: "Peringatan dibuat", nilai: d.peringatan24, ikon: BellRing },
                { label: "Notifikasi terkirim", nilai: d.notifikasiTerkirim24, ikon: Send },
              ].map(({ label, nilai, ikon: Ikon }) => (
                <div key={label} className="rounded-xl border border-line bg-bg/40 p-3">
                  <Ikon className="size-4 text-primary" aria-hidden />
                  <dd className="mt-2 text-xl font-bold num">{nilai.toLocaleString("id-ID")}</dd>
                  <dt className="text-xs text-muted">{label}</dt>
                </div>
              ))}
            </dl>
            {d.notifikasiGagal24 > 0 && <p className="px-5 pb-5 text-sm text-danger">{d.notifikasiGagal24} notifikasi gagal terkirim.</p>}
          </Card>
          <Card>
            <CardHeader icon={<Users />} title="Pengguna per peran" />
            <ul className="space-y-2 p-5 pt-4 text-sm">
              {d.penggunaPerPeran.map((p) => (
                <li key={p.peran} className="flex items-center justify-between">
                  <span className="text-muted">{LABEL_PERAN[p.peran as Peran]}</span>
                  <span className="font-semibold num">{p.jumlah}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader icon={<BellRing />} title="Log peringatan terbaru" description="Seluruh lahan" />
        <ul className="divide-y divide-line px-5 pb-3">
          {d.peringatanTerbaru.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm">
              <Badge tone={p.status !== "AKTIF" ? "neutral" : p.tingkat === "BAHAYA" ? "danger" : "warning"}>
                {p.status === "AKTIF" ? (p.tingkat === "BAHAYA" ? "Kritis" : "Waspada") : "Selesai"}
              </Badge>
              <span className="min-w-0 flex-1">{p.pesan}</span>
              <span className="text-xs text-muted">
                {p.lahan} · {p.waktuLabel}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
