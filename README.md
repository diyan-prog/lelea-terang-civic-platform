# Lelea Terang Civic Platform

Platform transparansi dan partisipasi warga Desa Lelea, Kabupaten Indramayu, Jawa Barat. Platform ini memfasilitasi pelacakan penggunaan anggaran desa, pemantauan kegiatan pembangunan, pelaporan masalah warga, serta akses statistik desa secara terbuka.

---

## Quick Start (Mode Demo)

Gunakan langkah ini untuk mencoba aplikasi secara instan tanpa perlu setup database.

1. **Clone & Masuk Folder**
   ```bash
   git clone <REPO_URL>
   cd lelea-terang-civic-platform
   ```

2. **Install Dependensi**
   ```bash
   npm install
   ```

3. **Gunakan Mode Demo**
   Salin file environment dan pastikan `VITE_DEMO_MODE=true` aktif.
   ```bash
   cp .env.example .env
   ```

4. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Aplikasi berjalan di [http://localhost:8443](http://localhost:8443).

### Akun Demo (Untuk Mode Database)
Jika menggunakan database Supabase asli (`VITE_DEMO_MODE=false`), gunakan kredensial berikut:
- **Admin**: `admin@gmail.com` / `leleaterang` (Akses penuh ke dashboard admin)
- **Warga (Arif)**: `arif@gmail.com` / `123456789` (Akses fitur lapor dan layanan warga)

---

## Fitur & Progress

### 1. Transparansi & Data
- [x] **Data Anggaran** — Visualisasi APBDes 2026 (Dana Desa, ADD, PADes) dari Supabase.
- [x] **Kegiatan Pembangunan** — Daftar proyek infrastruktur dengan progres, foto, dan lokasi dari Supabase.
- [x] **Statistik Desa** — Demografi penduduk, pekerjaan, pendidikan, dan bansos dari Supabase.
- [x] **Insight** — Analisis skor responsivitas pemerintah desa berdasarkan data laporan.

### 2. Partisipasi Warga
- [x] **Daftar Laporan** — Melihat laporan warga yang sudah masuk ke sistem dari Supabase.
- [x] **Lacak Tiket** — Pencarian status laporan menggunakan kode tiket dari Supabase.
- [x] **Form Lapor** — Terhubung ke database Supabase dengan dukungan unggah foto.
- [x] **Layanan Surat** — Terhubung ke database Supabase dengan dukungan unggah lampiran dokumen.

### 3. Autentikasi & Admin
- [x] **Auth** — Login dan Register terintegrasi Supabase Auth.
- [x] **Admin Dashboard** — Panel modern untuk mengelola data anggaran, kegiatan, status laporan, dan pengajuan layanan (khusus akun role `admin` atau `perangkat`).

---

## Tech Stack

- **Framework**: React 19
- **Bundler**: Vite 8.0.5
- **Styling**: Tailwind CSS v4.2.2 (dengan @tailwindcss/vite)
- **Router**: React Router 8.5.0
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Data Fetching**: TanStack Query v5
- **Maps**: React Leaflet 5.0.0

---

## Integrasi Supabase (Opsional)

Untuk menggunakan data nyata, ubah `VITE_DEMO_MODE=false` di `.env` dan ikuti langkah berikut:

### 1. Database Setup
Jalankan file SQL berikut di SQL Editor Supabase secara berurutan:
1. `supabase/migrations/001_init.sql` (Skema & RLS)
2. `supabase/migrations/002_layanan.sql` (Skema Layanan)
3. `supabase/seed.sql` (Data awal Anggaran & Kegiatan)

### 2. Akun Admin
Akses admin dikontrol melalui kolom `role` di tabel `profiles`. Untuk memberikan akses admin ke akun Anda:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID_ANDA';
```

---

## Informasi Anggaran (Seed 2026)
Berdasarkan data `seed.sql`, target anggaran 2026 adalah:
- **Total Pendapatan**: Rp1.985.000.000 (DD, ADD, PADes)
- **Total Belanja**: Rp1.720.000.000 (Infrastruktur, Pemberdayaan, Pemerintahan)

---

## Tim Pengembang
- **Tim**: InfoKostZidan
- **Anggota**: Zidan Fadhil Rahman - PoliteknikNegeri Indramayu
               Arief Rachman Makarim Mudihardjo - PoliteknikNegeri Indramayu
               DIYAN - PoliteknikNegeri Indramayu

## Akses Project
- **Demo Live**: https://lelea-terang-civic-platform.vercel.app/
