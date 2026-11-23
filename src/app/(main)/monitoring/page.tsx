import { Activity, Database, Droplets, FlaskConical, Gauge, History, Radio, Thermometer } from "lucide-react";
import type { ReactNode } from "react";
import { SensorChart } from "@/components/charts/SensorChart";
import { WARNA_SENSOR } from "@/components/charts/tema";
import { SensorOverview } from "@/components/dashboard/SensorOverview";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { BadgeKondisi } from "@/components/ui/status";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { SignalIndicator } from "@/components/viz/SignalIndicator";
import { ambilCuaca } from "@/lib/cuaca";
import { requireUser } from "@/lib/current-user";
import { ambilRingkasanLahan, lingkupLahan, urutkanMenurutStatus } from "@/lib/data/lahan";
import { RENTANG, ambilRiwayatSensor, keRentang, type Statistik } from "@/lib/data/sensor";
import { formatAngka, formatTanggalJam, waktuRelatif } from "@/lib/format";
import { MonitoringFilter } from "./MonitoringFilter";

export const metadata = { title: "Monitoring" };

function PanelGrafik({
  judul,
  ikon,
  stat,
  satuan,
  children,
  className,
}: {
  judul: string;
  ikon: ReactNode;
  stat: Statistik | undefined;
  satuan: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader
        icon={ikon}
        title={judul}
        description="Pita hijau = batas aman"
        action={
          stat && (
            <dl className="hidden gap-4 text-right text-xs sm:flex">
              {(["min", "rata", "maks"] as const).map((k) => (
                <div key={k}>
                  <dt className="text-muted">{k === "rata" ? "Rata-rata" : k === "min" ? "Min" : "Maks"}</dt>
                  <dd className="font-semibold num">
                    {formatAngka(stat[k], 2)}
                    {satuan}
                  </dd>
                </div>
              ))}
            </dl>
          )
        }
      />
      <div className="px-3 pb-4 pt-3">{children}</div>
    </Card>
  );
}

/** Monitoring IoT (FR-10): kondisi real-time, status sensor, riwayat per rentang waktu. */
export default async function MonitoringPage({
  searchParams,
}: {
  searchParams: Promise<{ lahan?: string; sensor?: string; rentang?: string }>;
}) {
  const user = await requireUser(["PETANI", "KETUA_KELOMPOK", "ADMIN"]);
  const sp = await searchParams;
  const semua = await ambilRingkasanLahan(lingkupLahan(user));

  if (semua.length === 0) {
    return (
      <Card>
        <EmptyState icon={Radio} title="Belum ada lahan yang dipantau" description="Lahan dan sensor perlu didaftarkan oleh admin terlebih dahulu." />
      </Card>
    );
  }

  const l = semua.find((x) => x.id === sp.lahan) ?? urutkanMenurutStatus(semua)[0];
  const sensorId = l.sensor.find((s) => s.id === sp.sensor)?.id ?? null;
  const rentang = keRentang(sp.rentang);
  const [riwayat, cuaca] = await Promise.all([
    ambilRiwayatSensor(l.id, sensorId, rentang),
    l.kodeWilayah ? ambilCuaca(l.kodeWilayah).catch(() => null) : null,
  ]);
  const ambang = (p: string) => l.ambang.find((a) => a.parameter === p);
  const seri = (k: "kelembapanTanah" | "ph" | "suhu") => riwayat.titik.map((t) => ({ t: t.t, nilai: t[k] }));
  const harian = rentang !== "24j";
  const kosong = riwayat.titik.length === 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Jaringan sensor IoT"
        title="Monitoring lahan"
        description="Kondisi tanah terkini dan riwayat bacaan sensor. Pilih lahan, sensor, dan rentang waktu."
      />

      <MonitoringFilter
        lahan={semua.map((x) => ({ id: x.id, label: user.peran === "PETANI" ? x.nama : `${x.nama} · ${x.pemilik.nama}` }))}
        sensor={l.sensor.map((s) => ({ id: s.id, kode: s.kode }))}
        lahanId={l.id}
        sensorId={sensorId}
        rentang={rentang}
      />

      {/* Status ringkas */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="panel rounded-2xl p-4">
          <p className="text-xs font-medium text-muted">Status lahan</p>
          <div className="mt-2">
            <BadgeKondisi status={l.status} size="md" />
          </div>
          <p className="mt-2 text-xs text-muted">{l.pelanggaran.length ? `${l.pelanggaran.length} parameter di luar batas` : "Semua parameter dalam batas"}</p>
        </div>
        <div className="panel rounded-2xl p-4">
          <p className="mb-2 text-xs font-medium text-muted">Koneksi sensor</p>
          {l.sensor.map((s) => (
            <SignalIndicator key={s.id} status={s.status} kode={s.kode} terakhir={s.terakhirAktif ? waktuRelatif(s.terakhirAktif) : "belum ada"} ringkas />
          ))}
        </div>
        <div className="panel rounded-2xl p-4">
          <p className="text-xs font-medium text-muted">Bacaan {RENTANG[rentang].label} terakhir</p>
          <p className="mt-1 text-2xl font-bold num">{riwayat.jumlahBacaan.toLocaleString("id-ID")}</p>
          <p className="mt-1 text-xs text-muted">
            {riwayat.jumlahTidakValid > 0 ? (
              <span className="text-warning">{riwayat.jumlahTidakValid} ditandai tidak valid & tidak digambar</span>
            ) : (
              "Semua bacaan valid"
            )}
          </p>
        </div>
        <div className="panel rounded-2xl p-4">
          <p className="text-xs font-medium text-muted">Pembaruan terakhir</p>
          <p className="mt-1 text-lg font-bold num">{l.bacaan ? formatTanggalJam(l.bacaan.waktuCatat) : "–"}</p>
          <p className="mt-1 text-xs text-muted">{l.bacaan ? waktuRelatif(l.bacaan.waktuCatat) : "Belum ada data"}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader icon={<Gauge />} title="Kondisi saat ini" description={`${l.nama}${l.tanam ? ` · fase ${l.tanam.fase.toLowerCase()}` : ""}`} />
          <div className="p-5">
            <SensorOverview lahan={l} />
          </div>
        </Card>
        <WeatherCard cuaca={cuaca} />
      </div>

      {kosong ? (
        <Card>
          <EmptyState
            icon={Activity}
            title="Belum ada bacaan pada rentang ini"
            description="Sensor belum mengirim data pada periode yang dipilih. Coba rentang waktu yang lebih panjang atau periksa koneksi sensor."
          />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <PanelGrafik judul="Kelembapan tanah" ikon={<Droplets />} stat={riwayat.statistik?.kelembapanTanah} satuan="%" className="lg:col-span-2">
            <SensorChart data={seri("kelembapanTanah")} label="Kelembapan tanah" satuan="%" amanMin={ambang("KELEMBAPAN_TANAH")?.min} amanMaks={ambang("KELEMBAPAN_TANAH")?.maks} harian={harian} tinggi={260} />
          </PanelGrafik>
          <PanelGrafik judul="pH tanah" ikon={<FlaskConical />} stat={riwayat.statistik?.ph} satuan="">
            <SensorChart data={seri("ph")} label="pH tanah" amanMin={ambang("PH")?.min} amanMaks={ambang("PH")?.maks} harian={harian} warna={WARNA_SENSOR.ph} />
          </PanelGrafik>
          <PanelGrafik judul="Suhu" ikon={<Thermometer />} stat={riwayat.statistik?.suhu} satuan="°C">
            <SensorChart data={seri("suhu")} label="Suhu" satuan="°C" amanMin={ambang("SUHU")?.min} amanMaks={ambang("SUHU")?.maks} harian={harian} warna={WARNA_SENSOR.suhu} />
          </PanelGrafik>
        </div>
      )}

      <Card>
        <CardHeader icon={<History />} title="Bacaan terbaru" description="Data mentah dari sensor, termasuk yang ditolak validasi (NFR-25)" />
        <div className="p-5">
          {riwayat.terbaru.length === 0 ? (
            <EmptyState icon={Database} title="Belum ada data" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Waktu</Th>
                  <Th className="text-right">Kelembapan</Th>
                  <Th className="text-right">pH</Th>
                  <Th className="text-right">Suhu</Th>
                  <Th>Validasi</Th>
                </tr>
              </thead>
              <tbody>
                {riwayat.terbaru.map((r) => (
                  <Tr key={r.waktuCatat.toISOString()}>
                    <Td className="num">{formatTanggalJam(r.waktuCatat)}</Td>
                    <Td className="text-right num">{formatAngka(r.kelembapanTanah)}%</Td>
                    <Td className="text-right num">{formatAngka(r.ph, 2)}</Td>
                    <Td className="text-right num">{formatAngka(r.suhu)}°C</Td>
                    <Td>
                      {r.valid ? (
                        <Badge tone="success">Valid</Badge>
                      ) : (
                        <span title={r.catatanValidasi ?? undefined}>
                          <Badge tone="danger">Tidak valid</Badge>
                        </span>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
