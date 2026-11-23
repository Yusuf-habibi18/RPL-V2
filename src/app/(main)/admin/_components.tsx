"use client";

import { Check, Copy, KeyRound, OctagonAlert, Pencil, Plus, Power, Search, Trash2, UserRoundPlus } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { EmptyState, InfoNote } from "@/components/ui/misc";
import { BadgeSensor } from "@/components/ui/status";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { useFormAksi } from "@/components/ui/useFormAksi";
import {
  daftarkanSensor,
  hapusAturan,
  simpanAmbang,
  simpanAturan,
  simpanPengguna,
  ubahStatusAturan,
  ubahStatusPengguna,
  ubahStatusSensor,
} from "@/lib/actions/admin";
import type { HasilAksi } from "@/lib/actions/hasil";
import type { BarisAmbang, BarisAturan, BarisPengguna, BarisSensor } from "@/lib/data/admin";
import { judulKata } from "@/lib/format";
import { LABEL_PARAMETER, LABEL_PERAN, PERAN, SATUAN_PARAMETER, type Parameter } from "@/types";

type Opsi = { id: string; nama: string }[];

function PesanGalat({ pesan }: { pesan: string | null }) {
  if (!pesan) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/35 bg-danger/10 px-3 py-2.5 text-sm text-danger">
      <OctagonAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      {pesan}
    </p>
  );
}

function TombolForm({ onBatal, label }: { onBatal: () => void; label: string }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
      <Button variant="ghost" onClick={onBatal}>
        Batal
      </Button>
      <SubmitButton>{label}</SubmitButton>
    </div>
  );
}

/** Konfirmasi lalu jalankan aksi yang mengubah status (aktif/nonaktif/hapus). */
function useAksiKonfirmasi() {
  const toast = useToast();
  const [pending, mulai] = useTransition();
  const [target, setTarget] = useState<{ judul: string; deskripsi: string; label: string; bahaya?: boolean; jalan: () => Promise<HasilAksi> } | null>(null);
  const dialog = (
    <ConfirmDialog
      open={!!target}
      onClose={() => setTarget(null)}
      onConfirm={() =>
        mulai(async () => {
          if (!target) return;
          toast(await target.jalan());
          setTarget(null);
        })
      }
      loading={pending}
      title={target?.judul ?? ""}
      description={target?.deskripsi}
      confirmLabel={target?.label ?? "Ya"}
      variant={target?.bahaya ? "danger" : "primary"}
    />
  );
  return { minta: setTarget, dialog };
}

function Cari({ nilai, ubah, placeholder }: { nilai: string; ubah: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <Input value={nilai} onChange={(e) => ubah(e.target.value)} placeholder={placeholder} className="pl-9" aria-label={placeholder} />
    </div>
  );
}

// ─────────────────────────── Pengguna ───────────────────────────

export function PanelPengguna({ pengguna, opsiKelompok }: { pengguna: BarisPengguna[]; opsiKelompok: Opsi }) {
  const [cari, setCari] = useState("");
  const [peranFilter, setPeranFilter] = useState("");
  const [edit, setEdit] = useState<BarisPengguna | "baru" | null>(null);
  const [peran, setPeran] = useState<string>("PETANI");
  const f = useFormAksi(simpanPengguna, () => setEdit(null));
  const k = useAksiKonfirmasi();

  const tampil = useMemo(
    () =>
      pengguna.filter(
        (u) =>
          (!peranFilter || u.peran === peranFilter) &&
          `${u.nama} ${u.email}`.toLowerCase().includes(cari.trim().toLowerCase()),
      ),
    [pengguna, cari, peranFilter],
  );

  const bukaForm = (u: BarisPengguna | "baru") => {
    f.reset();
    setPeran(u === "baru" ? "PETANI" : u.peran);
    setEdit(u);
  };
  const u = edit && edit !== "baru" ? edit : null;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Cari nilai={cari} ubah={setCari} placeholder="Cari nama atau email" />
        <Select value={peranFilter} onChange={(e) => setPeranFilter(e.target.value)} className="sm:w-52" aria-label="Filter peran">
          <option value="">Semua peran</option>
          {PERAN.map((p) => (
            <option key={p} value={p}>
              {LABEL_PERAN[p]}
            </option>
          ))}
        </Select>
        <Button onClick={() => bukaForm("baru")}>
          <UserRoundPlus /> Tambah pengguna
        </Button>
      </div>

      {tampil.length === 0 ? (
        <EmptyState icon={Search} title="Tidak ada pengguna yang cocok" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Pengguna</Th>
              <Th>Peran</Th>
              <Th>Kelompok / wilayah</Th>
              <Th>Status</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {tampil.map((x) => (
              <Tr key={x.id}>
                <Td>
                  <p className="font-semibold">{x.nama}</p>
                  <p className="text-xs text-muted">{x.email}</p>
                </Td>
                <Td>{LABEL_PERAN[x.peran]}</Td>
                <Td className="text-sm text-muted">{x.kelompok ?? x.wilayah ?? "–"}</Td>
                <Td>{x.aktif ? <Badge tone="success">Aktif</Badge> : <Badge tone="neutral">Nonaktif</Badge>}</Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => bukaForm(x)} aria-label={`Ubah ${x.nama}`}>
                      <Pencil /> <span className="hidden xl:inline">Ubah</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={x.aktif ? "ghost" : "success"}
                      onClick={() =>
                        k.minta({
                          judul: x.aktif ? `Nonaktifkan ${x.nama}?` : `Aktifkan ${x.nama}?`,
                          deskripsi: x.aktif ? "Pengguna tidak akan bisa login sampai diaktifkan kembali. Data tetap tersimpan." : "Pengguna bisa login kembali.",
                          label: x.aktif ? "Nonaktifkan" : "Aktifkan",
                          bahaya: x.aktif,
                          jalan: () => ubahStatusPengguna(x.id, !x.aktif),
                        })
                      }
                      aria-label={x.aktif ? `Nonaktifkan ${x.nama}` : `Aktifkan ${x.nama}`}
                    >
                      <Power />
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Dialog open={!!edit} onClose={() => setEdit(null)} title={u ? `Ubah ${u.nama}` : "Tambah pengguna"} size="md">
        <form action={f.kirim} noValidate className="space-y-4" key={u?.id ?? "baru"}>
          {u && <input type="hidden" name="id" value={u.id} />}
          <PesanGalat pesan={f.pesan} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama lengkap" htmlFor="nama" error={f.galat.nama}>
              <Input id="nama" name="nama" defaultValue={u?.nama} required />
            </Field>
            <Field label="Email" htmlFor="email" error={f.galat.email}>
              <Input id="email" name="email" type="email" defaultValue={u?.email} required />
            </Field>
            <Field label="Peran" htmlFor="peran" error={f.galat.peran}>
              <Select id="peran" name="peran" value={peran} onChange={(e) => setPeran(e.target.value)}>
                {PERAN.map((p) => (
                  <option key={p} value={p}>
                    {LABEL_PERAN[p]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="No. HP (notifikasi)" htmlFor="noHp" error={f.galat.noHp} hint="Opsional">
              <Input id="noHp" name="noHp" inputMode="tel" defaultValue={u?.noHp ?? ""} placeholder="08xxxxxxxxxx" />
            </Field>
            {(peran === "PETANI" || peran === "KETUA_KELOMPOK") && (
              <Field
                label="Kelompok tani"
                htmlFor="kelompokId"
                error={f.galat.kelompokId}
                hint={peran === "KETUA_KELOMPOK" ? "Pengguna menjadi ketua kelompok ini" : undefined}
                className="sm:col-span-2"
              >
                <Select id="kelompokId" name="kelompokId" defaultValue={u?.kelompokId ?? ""}>
                  <option value="">Pilih kelompok</option>
                  {opsiKelompok.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nama}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            {peran === "DINAS" && (
              <Field label="Wilayah (kecamatan)" htmlFor="wilayah" error={f.galat.wilayah} hint="Kosongkan untuk tingkat kabupaten" className="sm:col-span-2">
                <Input id="wilayah" name="wilayah" defaultValue={u?.wilayah ?? ""} />
              </Field>
            )}
            <Field
              label={u ? "Kata sandi baru" : "Kata sandi"}
              htmlFor="password"
              error={f.galat.password}
              hint={u ? "Kosongkan bila tidak diubah" : "Minimal 8 karakter"}
              className="sm:col-span-2"
            >
              <Input id="password" name="password" type="password" autoComplete="new-password" />
            </Field>
          </div>
          <TombolForm onBatal={() => setEdit(null)} label={u ? "Simpan perubahan" : "Tambah pengguna"} />
        </form>
      </Dialog>
      {k.dialog}
    </div>
  );
}

// ─────────────────────────── Sensor ───────────────────────────

export function PanelSensor({ sensor, opsiLahan }: { sensor: BarisSensor[]; opsiLahan: Opsi }) {
  const [open, setOpen] = useState(false);
  const [kunci, setKunci] = useState<{ kode: string; apiKey: string } | null>(null);
  const [tersalin, setTersalin] = useState(false);
  const f = useFormAksi(daftarkanSensor, (h) => {
    setOpen(false);
    if (h.data?.apiKey) setKunci({ kode: h.data.kode, apiKey: h.data.apiKey });
  });
  const k = useAksiKonfirmasi();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {sensor.filter((s) => s.status === "AKTIF").length} terhubung · {sensor.filter((s) => s.status === "OFFLINE").length} terputus ·{" "}
          {sensor.filter((s) => s.status === "NONAKTIF").length} nonaktif
        </p>
        <Button
          onClick={() => {
            f.reset();
            setOpen(true);
          }}
        >
          <Plus /> Daftarkan sensor
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Kode sensor</Th>
            <Th>Lahan</Th>
            <Th>Koneksi</Th>
            <Th>Data terakhir</Th>
            <Th className="text-right">Baterai</Th>
            <Th className="text-right">Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {sensor.map((s) => (
            <Tr key={s.id}>
              <Td className="font-mono text-sm font-semibold">{s.kode}</Td>
              <Td>
                <p className="font-medium">{s.lahan}</p>
                <p className="text-xs text-muted">{s.pemilik}</p>
              </Td>
              <Td>
                <BadgeSensor status={s.status} />
              </Td>
              <Td className="text-sm text-muted">{s.terakhirLabel}</Td>
              <Td className={s.levelBaterai != null && s.levelBaterai < 25 ? "text-right font-semibold text-danger num" : "text-right num"}>
                {s.levelBaterai != null ? `${s.levelBaterai}%` : "–"}
              </Td>
              <Td className="text-right">
                <Button
                  size="sm"
                  variant={s.nonaktif ? "success" : "ghost"}
                  onClick={() =>
                    k.minta({
                      judul: s.nonaktif ? `Aktifkan ${s.kode}?` : `Nonaktifkan ${s.kode}?`,
                      deskripsi: s.nonaktif ? "Sensor kembali dipantau." : "Sensor tidak dipantau dan tidak memicu peringatan offline (mis. sedang diperbaiki).",
                      label: s.nonaktif ? "Aktifkan" : "Nonaktifkan",
                      bahaya: !s.nonaktif,
                      jalan: () => ubahStatusSensor(s.id, !s.nonaktif),
                    })
                  }
                >
                  <Power /> {s.nonaktif ? "Aktifkan" : "Nonaktifkan"}
                </Button>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} title="Daftarkan sensor" description="API key dibuat otomatis dan hanya ditampilkan sekali.">
        <form action={f.kirim} noValidate className="space-y-4">
          <PesanGalat pesan={f.pesan} />
          <Field label="Kode sensor" htmlFor="kode" error={f.galat.kode} hint="Huruf besar, angka, tanda hubung. Mis. SENSOR-008">
            <Input id="kode" name="kode" required placeholder="SENSOR-008" className="font-mono uppercase" />
          </Field>
          <Field label="Dipasang di lahan" htmlFor="lahanId" error={f.galat.lahanId}>
            <Select id="lahanId" name="lahanId" required defaultValue="">
              <option value="" disabled>
                Pilih lahan
              </option>
              {opsiLahan.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nama}
                </option>
              ))}
            </Select>
          </Field>
          <TombolForm onBatal={() => setOpen(false)} label="Daftarkan" />
        </form>
      </Dialog>

      <Dialog
        open={!!kunci}
        onClose={() => {
          setKunci(null);
          setTersalin(false);
        }}
        title={`API key ${kunci?.kode ?? ""}`}
        description="Salin dan pasang di perangkat sensor sekarang. Key tidak akan ditampilkan lagi."
      >
        <div className="flex items-center gap-2 rounded-xl border border-data/30 bg-bg/60 p-3">
          <KeyRound className="size-4 shrink-0 text-primary" aria-hidden />
          <code className="min-w-0 flex-1 break-all font-mono text-sm">{kunci?.apiKey}</code>
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(kunci?.apiKey ?? "");
              setTersalin(true);
            }}
          >
            {tersalin ? <Check /> : <Copy />} {tersalin ? "Tersalin" : "Salin"}
          </Button>
        </div>
        <InfoNote className="mt-4">
          Sensor mengirim data ke <code className="font-mono text-xs">POST /api/sensor/ingest</code> dengan header <code className="font-mono text-xs">x-api-key</code>.
          Endpoint tersebut dijadwalkan di Sprint 2.
        </InfoNote>
      </Dialog>
      {k.dialog}
    </div>
  );
}

// ─────────────────────────── Ambang batas ───────────────────────────

export function PanelAmbang({ ambang }: { ambang: BarisAmbang[] }) {
  const [edit, setEdit] = useState<BarisAmbang | null>(null);
  const f = useFormAksi(simpanAmbang, () => setEdit(null));
  const grup = useMemo(() => {
    const m = new Map<string, BarisAmbang[]>();
    for (const a of ambang) {
      const kunci = `${a.komoditas} · ${judulKata(a.fase)}`;
      m.set(kunci, [...(m.get(kunci) ?? []), a]);
    }
    return [...m.entries()];
  }, [ambang]);

  return (
    <div>
      <InfoNote className="mb-4">
        Ambang batas adalah aturan peringatan dini (FR-11, FR-12): bacaan di luar rentang ini memicu peringatan. Perubahan langsung berlaku tanpa mengubah
        kode (NFR-20). Validasi angka ke penyuluh sebelum menyimpan.
      </InfoNote>
      <div className="grid gap-4 md:grid-cols-2">
        {grup.map(([judul, daftar]) => (
          <div key={judul} className="rounded-xl border border-line bg-bg/35 p-4">
            <p className="mb-3 font-semibold">{judul}</p>
            <ul className="space-y-2">
              {daftar.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg bg-card/60 px-3 py-2">
                  <span className="text-sm">{LABEL_PARAMETER[a.parameter as Parameter] ?? a.parameter}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold num">
                      {a.min}–{a.maks}
                      {SATUAN_PARAMETER[a.parameter as Parameter]}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        f.reset();
                        setEdit(a);
                      }}
                      aria-label={`Ubah ambang ${LABEL_PARAMETER[a.parameter as Parameter]} ${judul}`}
                    >
                      <Pencil />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Dialog
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Ubah ambang batas"
        description={edit ? `${LABEL_PARAMETER[edit.parameter as Parameter]} · ${edit.komoditas} · fase ${judulKata(edit.fase)}` : undefined}
        size="sm"
      >
        {edit && (
          <form action={f.kirim} noValidate className="space-y-4" key={edit.id}>
            <input type="hidden" name="id" value={edit.id} />
            <PesanGalat pesan={f.pesan} />
            <div className="grid grid-cols-2 gap-4">
              <Field label={`Minimum ${SATUAN_PARAMETER[edit.parameter as Parameter]}`} htmlFor="min" error={f.galat.min}>
                <Input id="min" name="min" type="number" step="0.1" defaultValue={edit.min} required inputMode="decimal" />
              </Field>
              <Field label={`Maksimum ${SATUAN_PARAMETER[edit.parameter as Parameter]}`} htmlFor="maks" error={f.galat.maks}>
                <Input id="maks" name="maks" type="number" step="0.1" defaultValue={edit.maks} required inputMode="decimal" />
              </Field>
            </div>
            <TombolForm onBatal={() => setEdit(null)} label="Simpan" />
          </form>
        )}
      </Dialog>
    </div>
  );
}

// ─────────────────────────── Aturan rekomendasi ───────────────────────────

export function PanelAturan({
  aturan,
  opsiKomoditas,
}: {
  aturan: BarisAturan[];
  opsiKomoditas: { id: string; nama: string; fase: string[] }[];
}) {
  const [edit, setEdit] = useState<BarisAturan | "baru" | null>(null);
  const [komoditasId, setKomoditasId] = useState(opsiKomoditas[0]?.id ?? "");
  const f = useFormAksi(simpanAturan, () => setEdit(null));
  const k = useAksiKonfirmasi();
  const a = edit && edit !== "baru" ? edit : null;
  const fase = opsiKomoditas.find((o) => o.id === komoditasId)?.fase ?? [];

  const buka = (x: BarisAturan | "baru") => {
    f.reset();
    setKomoditasId(x === "baru" ? (opsiKomoditas[0]?.id ?? "") : x.komoditasId);
    setEdit(x);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-muted">
          Aturan pemupukan dari pedoman penyuluh (FR-17). Penyiraman memakai ambang kelembapan & prakiraan hujan bawaan sistem; aturan siram tambahan bisa
          ditambahkan di sini.
        </p>
        <Button onClick={() => buka("baru")}>
          <Plus /> Tambah aturan
        </Button>
      </div>

      {aturan.length === 0 ? (
        <EmptyState icon={Plus} title="Belum ada aturan" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Jika</Th>
              <Th>Maka</Th>
              <Th>Sumber</Th>
              <Th>Status</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {aturan.map((x) => (
              <Tr key={x.id} className={x.aktif ? "" : "opacity-60"}>
                <Td>
                  <p className="font-mono text-sm font-semibold">
                    {LABEL_PARAMETER[x.parameter as Parameter]} {x.operator} {x.nilai}
                  </p>
                  <p className="text-xs text-muted">
                    {x.komoditas} · {x.fase ? `fase ${judulKata(x.fase)}` : "semua fase"}
                  </p>
                </Td>
                <Td>
                  <div className="flex items-start gap-2">
                    <Badge tone={x.jenis === "SIRAM" ? "info" : "success"}>{x.jenis === "SIRAM" ? "Siram" : "Pupuk"}</Badge>
                    <span className="text-sm">
                      {x.tindakan}
                      {x.dosis && <span className="block text-xs text-muted">Dosis: {x.dosis}</span>}
                    </span>
                  </div>
                </Td>
                <Td className="text-xs text-muted">{x.sumber ?? "–"}</Td>
                <Td>
                  {x.aktif ? <Badge tone="success">Aktif</Badge> : <Badge tone="neutral">Nonaktif</Badge>}
                  {x.dipakai > 0 && <p className="mt-1 text-xs text-muted">dipakai {x.dipakai}×</p>}
                </Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => buka(x)} aria-label="Ubah aturan">
                      <Pencil />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        k.minta({
                          judul: x.aktif ? "Nonaktifkan aturan?" : "Aktifkan aturan?",
                          deskripsi: x.aktif ? "Aturan tidak lagi menghasilkan rekomendasi baru." : "Aturan kembali dipakai mesin rekomendasi.",
                          label: x.aktif ? "Nonaktifkan" : "Aktifkan",
                          jalan: () => ubahStatusAturan(x.id, !x.aktif),
                        })
                      }
                      aria-label={x.aktif ? "Nonaktifkan aturan" : "Aktifkan aturan"}
                    >
                      <Power />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:text-danger"
                      onClick={() =>
                        k.minta({
                          judul: "Hapus aturan?",
                          deskripsi:
                            x.dipakai > 0
                              ? "Aturan ini sudah dipakai rekomendasi, jadi akan dinonaktifkan (bukan dihapus) agar riwayat tetap utuh."
                              : "Aturan dihapus permanen.",
                          label: x.dipakai > 0 ? "Nonaktifkan" : "Hapus",
                          bahaya: true,
                          jalan: () => hapusAturan(x.id),
                        })
                      }
                      aria-label="Hapus aturan"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Dialog open={!!edit} onClose={() => setEdit(null)} title={a ? "Ubah aturan" : "Tambah aturan"} description="Dibaca: jika [parameter] [operator] [nilai] pada [fase], maka [tindakan]." size="lg">
        <form action={f.kirim} noValidate className="space-y-4" key={a?.id ?? "baru"}>
          {a && <input type="hidden" name="id" value={a.id} />}
          <PesanGalat pesan={f.pesan} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Komoditas" htmlFor="komoditasId" error={f.galat.komoditasId}>
              <Select id="komoditasId" name="komoditasId" value={komoditasId} onChange={(e) => setKomoditasId(e.target.value)}>
                {opsiKomoditas.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nama}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Jenis" htmlFor="jenis" error={f.galat.jenis}>
              <Select id="jenis" name="jenis" defaultValue={a?.jenis ?? "PUPUK"}>
                <option value="PUPUK">Pemupukan</option>
                <option value="SIRAM">Penyiraman</option>
              </Select>
            </Field>
            <Field label="Fase" htmlFor="fase" error={f.galat.fase}>
              <Select id="fase" name="fase" defaultValue={a?.fase ?? ""}>
                <option value="">Semua fase</option>
                {fase.map((x) => (
                  <option key={x} value={x}>
                    {judulKata(x)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Parameter" htmlFor="parameter" error={f.galat.parameter}>
              <Select id="parameter" name="parameter" defaultValue={a?.parameter ?? "PH"}>
                {(["KELEMBAPAN_TANAH", "SUHU", "PH"] as const).map((p) => (
                  <option key={p} value={p}>
                    {LABEL_PARAMETER[p]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Operator" htmlFor="operator" error={f.galat.operator}>
              <Select id="operator" name="operator" defaultValue={a?.operator ?? "<"}>
                {[
                  ["<", "kurang dari (<)"],
                  ["<=", "≤"],
                  [">", "lebih dari (>)"],
                  [">=", "≥"],
                ].map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nilai" htmlFor="nilai" error={f.galat.nilai}>
              <Input id="nilai" name="nilai" type="number" step="0.1" defaultValue={a?.nilai} required inputMode="decimal" />
            </Field>
          </div>
          <Field label="Tindakan yang disarankan" htmlFor="tindakan" error={f.galat.tindakan} hint="Gunakan bahasa sederhana yang mudah dipahami petani">
            <Textarea id="tindakan" name="tindakan" defaultValue={a?.tindakan} required maxLength={200} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Dosis" htmlFor="dosis" error={f.galat.dosis} hint="Opsional">
              <Input id="dosis" name="dosis" defaultValue={a?.dosis ?? ""} />
            </Field>
            <Field label="Sumber / penyuluh" htmlFor="sumber" error={f.galat.sumber} hint="Opsional">
              <Input id="sumber" name="sumber" defaultValue={a?.sumber ?? ""} />
            </Field>
          </div>
          <TombolForm onBatal={() => setEdit(null)} label={a ? "Simpan perubahan" : "Tambah aturan"} />
        </form>
      </Dialog>
      {k.dialog}
    </div>
  );
}
