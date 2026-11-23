"use client";

import { ClipboardList, OctagonAlert, Plus, Search, Wheat } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { useFormAksi } from "@/components/ui/useFormAksi";
import { catatRealisasiPanen, tambahDataTanam } from "@/lib/actions/tanam";
import { formatAngka, judulKata } from "@/lib/format";

function PesanGalat({ pesan }: { pesan: string | null }) {
  if (!pesan) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/35 bg-danger/10 px-3 py-2.5 text-sm text-danger">
      <OctagonAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      {pesan}
    </p>
  );
}

// ─────────────────────────── Tambah data tanam (FR-04) ───────────────────────────

export function TambahTanam({
  opsiLahan,
  opsiVarietas,
  hariIni,
}: {
  opsiLahan: { id: string; nama: string; luasHa: number; adaTanamAktif: boolean }[];
  opsiVarietas: { id: string; nama: string; umurPanenHst: number }[];
  hariIni: string;
}) {
  const [open, setOpen] = useState(false);
  const tersedia = opsiLahan.filter((l) => !l.adaTanamAktif);
  const [lahanId, setLahanId] = useState(tersedia[0]?.id ?? "");
  const lahan = opsiLahan.find((l) => l.id === lahanId);
  const f = useFormAksi(tambahDataTanam, () => setOpen(false));

  return (
    <>
      <Button
        onClick={() => {
          f.reset();
          setOpen(true);
        }}
        disabled={opsiLahan.length === 0}
      >
        <Plus /> Catat tanam baru
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Catat tanam baru" description="Fase dan estimasi panen dihitung otomatis dari tanggal tanam.">
        {tersedia.length === 0 ? (
          <EmptyState icon={Wheat} title="Semua lahan sedang ditanami" description="Catat hasil panen lahan terlebih dahulu sebelum menanam kembali." />
        ) : (
          <form action={f.kirim} noValidate className="space-y-4">
            <PesanGalat pesan={f.pesan} />
            <Field label="Lahan" htmlFor="lahanId" error={f.galat.lahanId}>
              <Select id="lahanId" name="lahanId" value={lahanId} onChange={(e) => setLahanId(e.target.value)} required>
                {tersedia.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nama} ({formatAngka(l.luasHa, 2)} ha)
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Komoditas & varietas" htmlFor="varietasId" error={f.galat.varietasId}>
              <Select id="varietasId" name="varietasId" required defaultValue={opsiVarietas[0]?.id}>
                {opsiVarietas.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nama} · umur panen {v.umurPanenHst} HST
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tanggal tanam" htmlFor="tanggalTanam" error={f.galat.tanggalTanam}>
                <Input id="tanggalTanam" name="tanggalTanam" type="date" max={hariIni} defaultValue={hariIni} required />
              </Field>
              <Field label="Luas tanam (ha)" htmlFor="luasTanamHa" error={f.galat.luasTanamHa} hint={lahan ? `Maks. ${lahan.luasHa} ha` : undefined}>
                <Input
                  key={lahanId}
                  id="luasTanamHa"
                  name="luasTanamHa"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={lahan?.luasHa}
                  defaultValue={lahan?.luasHa}
                  inputMode="decimal"
                  required
                />
              </Field>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <SubmitButton>Simpan data tanam</SubmitButton>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}

// ─────────────────────────── Catat realisasi panen (FR-19) ───────────────────────────

export function CatatPanen({
  dataTanamId,
  lahan,
  estimasiLabel,
  tanggalTanamIso,
  hariIni,
  bisa,
}: {
  dataTanamId: string;
  lahan: string;
  estimasiLabel: string | null;
  tanggalTanamIso: string;
  hariIni: string;
  bisa: boolean;
}) {
  const [open, setOpen] = useState(false);
  const f = useFormAksi(catatRealisasiPanen, () => setOpen(false));

  return (
    <>
      <Button
        variant={bisa ? "success" : "secondary"}
        onClick={() => {
          f.reset();
          setOpen(true);
        }}
        disabled={!bisa}
        title={bisa ? undefined : "Bisa dicatat mulai 10 hari sebelum umur panen"}
      >
        <Wheat /> Catat hasil panen
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Hasil panen · ${lahan}`} description={estimasiLabel ? `Estimasi panen: ${estimasiLabel}` : undefined}>
        <form action={f.kirim} noValidate className="space-y-4">
          <input type="hidden" name="dataTanamId" value={dataTanamId} />
          <PesanGalat pesan={f.pesan} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tanggal panen" htmlFor="tanggalPanen" error={f.galat.tanggalPanen}>
              <Input id="tanggalPanen" name="tanggalPanen" type="date" min={tanggalTanamIso} max={hariIni} defaultValue={hariIni} required />
            </Field>
            <Field label="Hasil panen (kg)" htmlFor="hasilKg" error={f.galat.hasilKg}>
              <Input id="hasilKg" name="hasilKg" type="number" min="1" step="0.1" inputMode="decimal" placeholder="Mis. 4500" required />
            </Field>
          </div>
          <Field label="Catatan (opsional)" htmlFor="catatan" error={f.galat.catatan}>
            <Textarea id="catatan" name="catatan" maxLength={300} placeholder="Mis. kualitas baik, sebagian terserang hama" />
          </Field>
          <p className="text-xs text-muted">Setelah disimpan, data tanam ditutup dan lahan bisa ditanami kembali. Data ini juga menjadi bahan prediksi panen (fase 2).</p>
          <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <SubmitButton variant="primary">Simpan hasil panen</SubmitButton>
          </div>
        </form>
      </Dialog>
    </>
  );
}

// ─────────────────────────── Riwayat kegiatan ───────────────────────────

export function RiwayatKegiatan({
  lahan,
  kegiatan,
}: {
  lahan: string;
  kegiatan: { id: string; jenis: string; tanggalLabel: string; keterangan: string | null; jumlah: string | null }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <ClipboardList /> Kegiatan
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Kegiatan budidaya · ${lahan}`} description="8 kegiatan terakhir">
        {kegiatan.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Belum ada kegiatan" description="Kegiatan tercatat saat Anda mengonfirmasi rekomendasi." />
        ) : (
          <ol className="relative space-y-4 border-l border-line pl-5">
            {kegiatan.map((k) => (
              <li key={k.id} className="relative">
                <span className="absolute -left-[25px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-card" aria-hidden />
                <p className="text-sm font-semibold">
                  {judulKata(k.jenis)} <span className="font-normal text-muted">· {k.tanggalLabel}</span>
                </p>
                <p className="text-sm text-muted">
                  {k.keterangan ?? "-"}
                  {k.jumlah && ` · ${k.jumlah}`}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Dialog>
    </>
  );
}

// ─────────────────────────── Tabel semua catatan tanam ───────────────────────────

export interface BarisTabelTanam {
  id: string;
  lahan: string;
  varietas: string;
  tanggalTanamLabel: string;
  luasTanamHa: number;
  hst: number;
  fase: string;
  estimasiLabel: string | null;
  status: "AKTIF" | "SELESAI";
  realisasi: { tanggalLabel: string; hasilKg: number } | null;
}

export function TabelTanam({ baris }: { baris: BarisTabelTanam[] }) {
  const [cari, setCari] = useState("");
  const [status, setStatus] = useState<"SEMUA" | "AKTIF" | "SELESAI">("SEMUA");
  const tampil = useMemo(
    () =>
      baris.filter(
        (b) =>
          (status === "SEMUA" || b.status === status) &&
          `${b.lahan} ${b.varietas}`.toLowerCase().includes(cari.trim().toLowerCase()),
      ),
    [baris, cari, status],
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari lahan atau varietas" className="pl-9" aria-label="Cari catatan tanam" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter status" className="sm:w-44">
          <option value="SEMUA">Semua status</option>
          <option value="AKTIF">Sedang tumbuh</option>
          <option value="SELESAI">Sudah panen</option>
        </Select>
      </div>
      {tampil.length === 0 ? (
        <EmptyState icon={Search} title="Tidak ada catatan yang cocok" description="Ubah kata kunci atau filter status." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Lahan</Th>
              <Th>Tanggal tanam</Th>
              <Th className="text-right">Luas</Th>
              <Th className="text-right">HST</Th>
              <Th>Fase / status</Th>
              <Th>Estimasi panen</Th>
              <Th className="text-right">Realisasi</Th>
            </tr>
          </thead>
          <tbody>
            {tampil.map((b) => (
              <Tr key={b.id}>
                <Td>
                  <p className="font-semibold">{b.lahan}</p>
                  <p className="text-xs text-muted">{b.varietas}</p>
                </Td>
                <Td className="num">{b.tanggalTanamLabel}</Td>
                <Td className="text-right num">{formatAngka(b.luasTanamHa, 2)} ha</Td>
                <Td className="text-right num">{b.hst}</Td>
                <Td>{b.status === "AKTIF" ? <Badge tone="info">{judulKata(b.fase)}</Badge> : <Badge tone="success">Sudah panen</Badge>}</Td>
                <Td className="num">{b.estimasiLabel ?? "–"}</Td>
                <Td className="text-right num">
                  {b.realisasi ? (
                    <>
                      <p className="font-semibold">{formatAngka(b.realisasi.hasilKg, 0)} kg</p>
                      <p className="text-xs text-muted">{b.realisasi.tanggalLabel}</p>
                    </>
                  ) : (
                    <span className="text-muted">–</span>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
