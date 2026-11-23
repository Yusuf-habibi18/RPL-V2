import { CloudRain, CloudSun, Droplet, Thermometer } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import type { RingkasanCuaca } from "@/lib/cuaca";
import { formatJam } from "@/lib/format";

/** Ringkasan cuaca (FR-09). Sumber dummy ditandai jelas. */
export function WeatherCard({ cuaca }: { cuaca: RingkasanCuaca | null }) {
  return (
    <Card className="h-full">
      <CardHeader
        icon={<CloudSun />}
        title="Cuaca"
        description={cuaca ? `Diperbarui ${formatJam(cuaca.waktu)}` : "Tidak tersedia"}
        action={cuaca?.sumber === "DUMMY" ? <Badge tone="neutral">Data contoh</Badge> : cuaca ? <Badge tone="info">BMKG</Badge> : null}
      />
      <div className="p-5">
        {!cuaca ? (
          <p className="text-sm text-muted">Data cuaca belum dapat diambil. Rekomendasi tetap berjalan tanpa prakiraan hujan.</p>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <CloudSun className="size-14 text-warning drop-shadow-[0_0_14px_rgb(245_185_66/0.35)]" aria-hidden />
              <div>
                <p className="text-3xl font-bold num">{cuaca.suhu ?? "–"}°C</p>
                <p className="text-sm text-muted">{cuaca.deskripsi}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                { ikon: Droplet, label: "Kelembapan udara", nilai: cuaca.kelembapanUdara != null ? `${cuaca.kelembapanUdara}%` : "–" },
                { ikon: CloudRain, label: "Hujan 24 jam", nilai: `${cuaca.curahHujanMm24j} mm` },
                { ikon: Thermometer, label: "Suhu udara", nilai: cuaca.suhu != null ? `${cuaca.suhu}°` : "–" },
              ].map(({ ikon: Ikon, label, nilai }) => (
                <div key={label} className="rounded-xl border border-line bg-bg/40 px-2 py-3">
                  <Ikon className="mx-auto size-4 text-data" aria-hidden />
                  <dd className="mt-1.5 font-bold num">{nilai}</dd>
                  <dt className="text-[11px] leading-tight text-muted">{label}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted">
              {cuaca.curahHujanMm24j >= 10
                ? "Diprakirakan hujan cukup lebat. Penyiraman bisa ditunda."
                : "Tidak ada prakiraan hujan lebat. Penyiraman mengikuti kondisi tanah."}
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
