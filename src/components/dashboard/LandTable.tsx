import Link from "next/link";
import { BadgeKondisi, BadgeSensor } from "@/components/ui/status";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import type { RingkasanLahan } from "@/lib/data/lahan";
import { formatAngka, judulKata } from "@/lib/format";

/** Tabel perbandingan kondisi lahan (ketua kelompok / dinas / admin). */
export function LandTable({ lahan, tautan = true }: { lahan: RingkasanLahan[]; tautan?: boolean }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Lahan</Th>
          <Th>Kondisi</Th>
          <Th className="text-right">Kelembapan</Th>
          <Th className="text-right">pH</Th>
          <Th className="text-right">Suhu</Th>
          <Th>Tanaman</Th>
          <Th>Sensor</Th>
        </tr>
      </thead>
      <tbody>
        {lahan.map((l) => {
          const di = (p: string) => l.pelanggaran.some((x) => x.parameter === p);
          const nilai = (p: string, v: number | undefined, s = "") => (
            <span className={di(p) ? "font-semibold text-warning" : ""}>{v !== undefined ? `${formatAngka(v, 2)}${s}` : "–"}</span>
          );
          return (
            <Tr key={l.id}>
              <Td>
                {tautan ? (
                  <Link href={`/monitoring?lahan=${l.id}`} className="font-semibold hover:text-primary">
                    {l.nama}
                  </Link>
                ) : (
                  <span className="font-semibold">{l.nama}</span>
                )}
                <p className="text-xs text-muted">
                  {l.pemilik.nama} · {formatAngka(l.luasHa, 2)} ha
                </p>
              </Td>
              <Td>
                <BadgeKondisi status={l.status} />
              </Td>
              <Td className="text-right num">{nilai("KELEMBAPAN_TANAH", l.bacaan?.kelembapanTanah, "%")}</Td>
              <Td className="text-right num">{nilai("PH", l.bacaan?.ph)}</Td>
              <Td className="text-right num">{nilai("SUHU", l.bacaan?.suhu, "°")}</Td>
              <Td className="text-sm">
                {l.tanam ? (
                  <>
                    {judulKata(l.tanam.fase)} <span className="text-muted">· HST {l.tanam.hst}</span>
                  </>
                ) : (
                  <span className="text-muted">–</span>
                )}
              </Td>
              <Td>{l.sensor[0] ? <BadgeSensor status={l.sensor[0].status} /> : <span className="text-muted">–</span>}</Td>
            </Tr>
          );
        })}
      </tbody>
    </Table>
  );
}
