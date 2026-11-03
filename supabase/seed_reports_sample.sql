-- =====================================================
-- Seed Data Contoh: Laporan Warga dengan Koordinat
-- JANGAN DIJALANKAN DI PRODUCTION
-- File ini hanya untuk demo/testing
-- =====================================================

-- Koordinat sekitar Desa Lelea, Indramayu
-- Lat: -6.3846, Lng: 108.2022 (pusat desa)

-- Laporan 1: Jalan rusak di Blok Ilir
INSERT INTO reports (
  judul, deskripsi, kategori, dusun_id, rw, lat, lng,
  is_anonymous, reporter_id
) VALUES (
  'Jalan berlubang di depan masjid',
  'Jalan di depan masjid Al-Ikhlas berlubang cukup dalam, berbahaya untuk motor dan pejalan kaki. Sudah 2 minggu belum diperbaiki.',
  'jalan_rusak',
  1,
  1,
  -6.3826,
  108.2012,
  false,
  null
);

-- Laporan 2: Irigasi tersumbat di Blok Weluntas
INSERT INTO reports (
  judul, deskripsi, kategori, dusun_id, rw, lat, lng,
  is_anonymous, reporter_id
) VALUES (
  'Saluran irigasi tersumbat sampah',
  'Saluran irigasi di Blok Weluntas RW 02 tersumbat sampah dan lumpur. Air sawah tidak mengalir dengan baik sejak seminggu lalu.',
  'irigasi',
  2,
  2,
  -6.3866,
  108.2042,
  false,
  null
);

-- Laporan 3: Lampu jalan mati
INSERT INTO reports (
  judul, deskripsi, kategori, dusun_id, rw, lat, lng,
  is_anonymous, reporter_id
) VALUES (
  'Lampu jalan mati di pertigaan',
  'Lampu jalan di pertigaan menuju balai desa mati sejak 3 hari lalu. Malam hari sangat gelap dan rawan kecelakaan.',
  'lampu_jalan',
  1,
  3,
  -6.3836,
  108.2032,
  true,
  null
);

-- Laporan 4: Sampah menumpuk
INSERT INTO reports (
  judul, deskripsi, kategori, dusun_id, rw, lat, lng,
  is_anonymous, reporter_id
) VALUES (
  'Tumpukan sampah di tepi jalan',
  'Sampah menumpuk di tepi jalan sejak truk sampah tidak lewat minggu lalu. Bau dan mengundang lalat.',
  'sampah_lingkungan',
  2,
  1,
  -6.3856,
  108.2018,
  false,
  null
);

-- Laporan 5: Air bersih macet
INSERT INTO reports (
  judul, deskripsi, kategori, dusun_id, rw, lat, lng,
  is_anonymous, reporter_id
) VALUES (
  'Air PAM macet 2 hari',
  'Air PAM tidak mengalir sejak kemarin pagi. Warga kesulitan untuk kebutuhan sehari-hari.',
  'air_bersih',
  1,
  2,
  -6.3841,
  108.2027,
  false,
  null
);

-- Laporan 6: Jalan rusak parah
INSERT INTO reports (
  judul, deskripsi, kategori, dusun_id, rw, lat, lng,
  is_anonymous, reporter_id
) VALUES (
  'Jalan amblas pasca hujan',
  'Jalan utama amblas setelah hujan deras kemarin. Lubang sangat dalam dan lebar, kendaraan harus putar arah.',
  'jalan_rusak',
  2,
  3,
  -6.3871,
  108.2035,
  false,
  null
);

-- Catatan:
-- Setelah insert, laporan otomatis dapat ticket_code dari trigger reports_before_insert()
-- Status default: 'diterima'
-- SLA otomatis terhitung
-- Kolom created_at otomatis terisi now()
