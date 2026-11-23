# Agri-Analytics: Monitoring Lahan & Rekomendasi Budidaya

Aplikasi web yang mengubah data sensor lahan (kelembapan tanah, suhu, pH) dan data cuaca menjadi
**peringatan dini**, **rekomendasi penyiraman & pemupukan**, dan **estimasi panen**.
Proyek mata kuliah Rekayasa Perangkat Lunak, Kelompok 2.

> **Versi 2 (RPL-V2):** desain ulang tema terang hijau. Versi tema gelap ada di repo [RPL-V1](https://github.com/Yusuf-habibi18/RPL-V1).

## Teknologi

- **Next.js 15** (App Router, Server Components, Server Actions) + **TypeScript**
- **Prisma** + **PostgreSQL** (Neon, gratis) · deploy di **Vercel**
- **Tailwind CSS 4**: tema terang hijau "Futuristic Smart Agriculture" (sidebar hijau gelap, kartu putih, aksen emerald & lime)
- **Recharts**: grafik · **lucide-react**: ikon · **jose**: sesi login (JWT di cookie httpOnly)
- **Zod**: validasi · **Vitest**: pengujian unit

## Menjalankan

Butuh Node.js 20 atau lebih baru.

> **Catatan OneDrive:** jangan jalankan `npm install` di folder yang tersinkron OneDrive karena `node_modules`
> berukuran ratusan MB. Salin/clone proyek ke folder lokal (mis. `C:\dev\agri-analytics`).

Butuh database PostgreSQL. Cara termudah: buat project gratis di [neon.tech](https://neon.tech)
(region Singapore), lalu isi `DATABASE_URL` dan `DIRECT_URL` di `.env` (lihat `.env.example`).

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env  → lalu isi koneksi Neon
npm run db:push           # buat tabel dari prisma/schema.prisma
npm run db:seed           # isi data dummy (30 hari riwayat sensor)
npm run dev               # buka http://localhost:3000
```

Data seed relatif terhadap waktu seed dijalankan. Sensor dianggap **terputus** bila > 30 menit tanpa data,
jadi **jalankan ulang `npm run db:seed` sebelum demo**. Seed menghapus semua data lalu mengisinya ulang;
pengguna yang sedang login otomatis diarahkan ke halaman login.

## Deploy ke Vercel

1. Di [vercel.com](https://vercel.com) → **Add New → Project** → import repo GitHub ini.
2. Tambahkan **Environment Variables**: `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`
   (string acak panjang), dan `TAMPILKAN_AKUN_DEMO=1` bila tombol akun demo ingin tampil.
3. Klik **Deploy**. Vercel menjalankan `npm run build` (termasuk `prisma generate`).
4. Isi database sekali dari laptop: `npm run db:push` lalu `npm run db:seed` (dengan `.env` mengarah ke Neon).

Setiap push ke branch `main` otomatis di-deploy ulang.

| Perintah | Fungsi |
|---|---|
| `npm test` | Pengujian unit (mesin aturan, validasi, hak akses) |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm run build` | Build produksi |
| `npm run db:studio` | Lihat isi database di browser |
| `npm run simulasi -- --skenario kering` | Kirim data sensor simulasi (butuh endpoint ingest, Sprint 2) |

### Akun demo

Password semua akun: `password123`. Di mode pengembangan, halaman login menampilkan tombol isi-cepat.

| Email | Peran | Isi |
|---|---|---|
| petani1@agri.local | Petani (Budi) | 2 lahan: Sawah Utara (kritis, kering), Kebun Belakang (sehat) |
| petani2@agri.local | Petani (Siti) | Lahan Timur (pH turun → rekomendasi pupuk) |
| petani3–6@agri.local | Petani | Ladang Barat (sensor mati), Sawah Kali (suhu tinggi), dll. |
| ketua@agri.local | Ketua Kelompok Tani Makmur | 3 anggota |
| ketua2@agri.local | Ketua Kelompok Sri Rejeki | 3 anggota |
| dinas@agri.local | Dinas Pertanian (Kecamatan Contoh) | 2 desa, 7 lahan |
| admin@agri.local | Admin sistem | Pengguna, sensor, ambang, aturan |

Sensor: `SENSOR-001` … `SENSOR-007`, API key `dev-key-001` … `dev-key-007`.

## Hak akses per peran

| Halaman | Petani | Ketua | Dinas | Admin |
|---|:-:|:-:|:-:|:-:|
| Dashboard (isi berbeda per peran) | ✓ | ✓ | ✓ | ✓ |
| Monitoring | ✓ | ✓ (lahan anggota) | | ✓ |
| Rekomendasi, Tanam & Panen | ✓ | | | |
| Kelompok Tani | | ✓ | | |
| Laporan (sesuai cakupan) | ✓ | ✓ | ✓ | ✓ |
| Administrasi | | | | ✓ |

Aturan ada di `src/lib/akses.ts`; diperiksa di middleware **dan** ulang di setiap halaman/server action.
Data selalu disaring per pemilik / kelompok / wilayah (`lingkupLahan` di `src/lib/data/lahan.ts`).

## Struktur

```
prisma/
  schema.prisma            model database (= class diagram Bab 3.2)
  seed.ts                  data dummy; peringatan & rekomendasi dihasilkan mesin aturan
src/
  middleware.ts            wajib login, hak akses per role, perpanjang sesi
  app/
    (auth)/login/          halaman login
    (main)/                halaman setelah login (route group, tidak mengubah URL)
      dashboard/_views/    dashboard Petani, Ketua, Dinas, Admin
      monitoring/  rekomendasi/  tanam-panen/  kelompok/  laporan/  admin/
    api/                   endpoint (masih 501, lihat "Pekerjaan backend tersisa")
  components/
    layout/                Sidebar, Topbar, MobileNavigation, DashboardShell, latar
    dashboard/             StatCard, AlertList, SensorOverview, RecommendationCard, ...
    viz/                   visual pertanian: MoistureGauge, RangeScale, GrowthTimeline, WaterNeed, ...
    charts/                grafik Recharts (SensorChart, BarChartSimple, DonutChart)
    ui/                    Button, Card, Badge, Dialog, Field, Table, Toast, ...
  lib/
    rules/                 mesin aturan (fungsi murni, teruji)
    data/                  query Prisma per halaman (UI tidak query langsung)
    actions/               server actions (login, konfirmasi rekomendasi, tanam/panen, admin)
    session.ts  akses.ts  auth.ts  current-user.ts  validation.ts  cuaca.ts  notifikasi.ts  format.ts
scripts/simulasi-sensor.ts
tests/                     pengujian (lihat tests/README.md untuk pemetaan T-01..T-10)
docs/                      diagram UML & mockup
```

## Pekerjaan backend tersisa

| Endpoint / fitur | Status | Sprint |
|---|---|---|
| `POST /api/sensor/ingest` (terima data sensor → simpan → peringatan → rekomendasi → notifikasi) | 501 | 2–4 |
| Penanda sensor offline otomatis (job berkala) | belum | 2 |
| Kirim notifikasi WhatsApp/SMS sungguhan | mode simulasi | 3 |
| `GET /api/laporan` ekspor PDF/Excel (tombol di UI sengaja nonaktif) | 501 | 5 |
| Kedaluwarsa rekomendasi otomatis | belum | 4 |
| Data cuaca BMKG (`CUACA_MODE=bmkg`) | parser perlu dicocokkan | 2 |

## Catatan

- Komoditas, ambang batas, dan aturan di `prisma/seed.ts` adalah **contoh (cabai merah)**.
  Ganti sesuai komoditas yang dipilih dan validasi angkanya ke penyuluh.
- Peta sebaran lahan (FR-25) dan prediksi ML (FR-24) adalah fase 2.
