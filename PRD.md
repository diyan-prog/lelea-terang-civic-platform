# PRD — Lelea Terang
**Tagline:** Desa Terbuka, Warga Terlibat
**Wilayah:** Desa Lelea, Kecamatan Lelea, Kabupaten Indramayu, Jawa Barat
**Versi:** 1.0 (MVP) | **Stack:** React + Vite + TypeScript, Supabase (Postgres, Auth, Storage, RLS)

---

## 1. Latar Belakang
Informasi anggaran dan pembangunan desa sering sulit diakses dan dipahami warga. Pengaduan warga disampaikan lisan atau lewat grup chat tanpa kejelasan tindak lanjut. Perangkat desa pun tidak punya gambaran data yang rapi untuk perencanaan (Musdes/Musrenbangdes).

Lelea Terang menyatukan empat fungsi dalam satu siklus akuntabilitas:
**Lihat data → Lapor masalah → Lacak tindak lanjut → Analisis untuk keputusan.**

## 2. Tujuan
1. Menampilkan APBDes, realisasi kegiatan, dan statistik desa secara visual dan mudah dipahami.
2. Memberi kanal pelaporan warga dengan foto dan lokasi.
3. Menyediakan pelacakan status transparan untuk laporan dan layanan surat.
4. Menyajikan insight bagi kepala desa/BPD: sebaran masalah, kecepatan respons, dan perbandingan anggaran.

### Indikator Keberhasilan (MVP)
- Warga dapat mengirim laporan dalam < 2 menit.
- 100% laporan punya nomor tiket dan timeline publik.
- Dashboard dapat dibaca tanpa penjelasan (ringkasan naratif di tiap grafik).
- Skor responsivitas dihitung otomatis.

## 3. Pengguna (Role)
| Role | Hak akses |
|---|---|
| **Pengunjung** | Melihat dashboard, peta, daftar laporan publik, melacak tiket tanpa login |
| **Warga** (login) | Semua hak pengunjung + membuat laporan, konfirmasi laporan warga lain, ajukan layanan surat, riwayat laporan sendiri |
| **Perangkat Desa** | Mengelola laporan (verifikasi, ubah status, unggah bukti), memproses layanan surat, input data kegiatan |
| **Admin** (Kades/Operator) | Semua hak perangkat + kelola pengguna, data APBDes, data statistik, pengaturan SLA |

## 4. Lingkup Fitur

### Modul 1 — Transparansi (Open Data)
- **F1.1** Ringkasan APBDes tahun berjalan: total pendapatan, belanja, pembiayaan, persentase realisasi.
- **F1.2** Grafik belanja per bidang (donut/bar), realisasi vs anggaran, filter tahun.
- **F1.3** Daftar kegiatan pembangunan: nama, dusun, anggaran, progres (%), status, foto progres.
- **F1.4** Peta kegiatan dan laporan (Leaflet + OpenStreetMap), filter dusun/kategori.
- **F1.5** Statistik desa: penduduk per dusun, usia, pekerjaan, pendidikan; bansos agregat per dusun (tanpa nama).
- **F1.6** Ringkasan naratif otomatis di tiap grafik, misalnya "Belanja bidang pembangunan mencapai 62% dari pagu."
- **F1.7** Ekspor data ke CSV.

### Modul 2 — Lapor (Civic Reporting)
- **F2.1** Form laporan: kategori (jalan rusak, irigasi/saluran, sampah/lingkungan, lampu jalan, air bersih, dugaan penyimpangan, lainnya), judul, deskripsi, dusun/RW, foto (maks 3), lokasi (GPS/pin di peta).
- **F2.2** Opsi lapor anonim (identitas tidak ditampilkan dan tidak tersimpan di view publik).
- **F2.3** Deteksi duplikat: saat memilih lokasi, tampilkan laporan terbuka dalam radius 100 m dan sarankan "saya juga mengalami ini".
- **F2.4** Konfirmasi komunitas: warga login dapat menekan "Saya juga melihat ini" (satu kali per laporan).
- **F2.5** Penautan otomatis ke kegiatan: jika laporan jalan/irigasi/drainase berada dalam radius 300 m dari kegiatan berstatus "selesai", laporan diberi **flag ketidaksesuaian** dan prioritas tinggi.
- **F2.6** Nomor tiket otomatis, format `LT-YYYYMM-XXXX`.

### Modul 3 — Lacak (Public Service Tracking)
- **F3.1** Halaman lacak tiket publik: input kode tiket, tampil timeline status.
- **F3.2** Status laporan: `diterima → diverifikasi → diproses → selesai` (atau `ditolak` dengan alasan wajib).
- **F3.3** Setiap perubahan status mencatat: waktu, petugas, catatan, foto bukti (opsional).
- **F3.4** **SLA timer**: batas respons pertama 3 hari, batas penyelesaian sesuai prioritas (tinggi 7 hari, normal 14 hari). Melewati batas → label merah "Terlambat".
- **F3.5** Layanan surat: warga mengajukan (surat keterangan, pengantar KTP/KK, SKTM, domisili usaha), status `diajukan → diperiksa → siap diambil → selesai`.
- **F3.6** Penilaian warga setelah laporan selesai (bintang 1–5 + komentar).
- **F3.7** Dashboard perangkat desa: antrean laporan dan layanan, filter status/prioritas/dusun, aksi ubah status.

### Modul 4 — Insight (Decision Support)
- **F4.1** Skor responsivitas desa: komponen kecepatan respons pertama, tingkat penyelesaian, tingkat tepat waktu SLA, rating warga. Ditampilkan sebagai angka 0–100 dengan rincian.
- **F4.2** Peta panas (heatmap) laporan per dusun dan per kategori.
- **F4.3** Tren bulanan laporan masuk vs selesai.
- **F4.4** Masalah berulang: lokasi/kategori dengan ≥ 3 laporan dalam 90 hari.
- **F4.5** Perbandingan anggaran vs keluhan per bidang (misalnya belanja infrastruktur vs jumlah laporan infrastruktur).
- **F4.6** Rekomendasi naratif otomatis berbasis aturan (rule-based) untuk bahan Musdes.
- **F4.7** Cetak/ekspor ringkasan Insight sebagai PDF atau CSV.

## 5. Di Luar Lingkup MVP
Integrasi WhatsApp bot, notifikasi push, integrasi langsung Siskeudes, pembayaran, dan multi-desa. (Dicatat sebagai fase lanjut.)

## 6. Persyaratan Non-Fungsional
- **Mobile first**, karena mayoritas warga memakai ponsel; layout nyaman di layar 360 px.
- Bahasa Indonesia sebagai bahasa utama, bahasa sederhana.
- Performa: halaman utama < 3 detik pada koneksi 4G.
- Aksesibilitas: kontras warna cukup, ukuran teks minimal 16 px, label form jelas.
- Keamanan: Row Level Security aktif pada semua tabel, data pelapor anonim tidak bocor, foto dibatasi ukuran (maks 5 MB, di-resize di klien), validasi input.
- Privasi: data pribadi (NIK, nama penerima bansos) **tidak** ditampilkan publik.
- Dapat di-deploy statis (Vercel/Netlify/Cloudflare Pages) dengan Supabase sebagai backend.

## 7. Arsitektur
- **Frontend:** React 18, Vite, TypeScript, React Router, TanStack Query, Tailwind CSS, Recharts, React-Leaflet, react-hook-form + zod.
- **Backend:** Supabase (Postgres + PostGIS opsional, Auth email/password, Storage bucket `report-photos` dan `project-photos`, RLS, SQL function/RPC, Realtime untuk update status).
- **Struktur data:** lihat `schema.sql`.

## 8. Halaman (Routing)
| Route | Deskripsi | Akses |
|---|---|---|
| `/` | Beranda: ringkasan angka, skor responsivitas, laporan terbaru, tombol "Lapor" | Publik |
| `/anggaran` | Dashboard APBDes | Publik |
| `/pembangunan` | Daftar dan peta kegiatan, detail kegiatan | Publik |
| `/statistik` | Statistik desa | Publik |
| `/lapor` | Form laporan | Publik/Login |
| `/laporan` | Daftar laporan publik + peta + filter | Publik |
| `/laporan/:ticket` | Detail dan timeline laporan | Publik |
| `/lacak` | Input kode tiket | Publik |
| `/layanan` | Ajukan dan lacak layanan surat | Login |
| `/insight` | Dashboard Insight | Publik (sebagian) |
| `/masuk`, `/daftar` | Autentikasi | Publik |
| `/akun` | Riwayat laporan dan layanan saya | Warga |
| `/admin` | Antrean laporan/layanan | Perangkat/Admin |
| `/admin/anggaran`, `/admin/kegiatan`, `/admin/statistik`, `/admin/pengguna` | Kelola data | Admin |

## 9. Aturan Bisnis Penting
1. Laporan baru berstatus `diterima`, `sla_respon_due` = dibuat + 3 hari.
2. Prioritas `tinggi` jika: kategori dugaan penyimpangan, atau flag ketidaksesuaian kegiatan, atau ≥ 3 konfirmasi warga.
3. Status `ditolak` wajib berisi alasan.
4. Skor responsivitas = 30% kecepatan respon + 30% tingkat penyelesaian + 25% tepat waktu SLA + 15% rating (dinormalisasi 0–100).
5. Laporan anonim: `reporter_id` tetap tersimpan untuk pencegahan spam namun tidak pernah ditampilkan di view publik.
6. Hanya perangkat/admin yang dapat mengubah status; setiap perubahan tercatat di `report_updates` (audit trail).

## 10. Data Awal (Seed)
Aplikasi harus menyertakan data contoh realistis (dummy, ditandai jelas sebagai contoh) untuk dusun, APBDes, 8 kegiatan, 25 laporan, dan statistik penduduk, sehingga dashboard terisi saat demo. Admin dapat menggantinya dengan data asli lewat halaman admin atau impor CSV.

## 11. Rencana Rilis
- **Fase 1:** Fondasi, auth, skema, layout, data seed.
- **Fase 2:** Modul Transparansi.
- **Fase 3:** Modul Lapor + Lacak.
- **Fase 4:** Dashboard admin + layanan surat.
- **Fase 5:** Modul Insight + skor responsivitas.
- **Fase 6:** Polishing, aksesibilitas, uji, dokumentasi, deploy.

## 12. Kriteria Penerimaan (Definition of Done)
- Seluruh fitur F1.1–F4.7 berjalan dan dapat didemokan.
- `npm run build` dan `npm run lint` lulus tanpa error.
- RLS terverifikasi: pengunjung tidak dapat membaca `reporter_id` atau mengubah data.
- README berisi langkah setup Supabase, menjalankan lokal, dan deploy.
- Tampilan baik di 360 px, 768 px, dan 1280 px.
