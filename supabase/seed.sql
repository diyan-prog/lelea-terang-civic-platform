-- Seed data lengkap untuk Lelea Terang di Supabase
-- Jalankan skrip ini di SQL Editor Supabase Anda

-- 1. Dusun
INSERT INTO dusun (nama, jumlah_rw) VALUES
  ('Dusun 1 Lelea Wetan', 3),
  ('Dusun 2 Lelea Kulon', 4),
  ('Dusun 3 Pesantren', 3),
  ('Dusun 4 Sukamulya', 2)
ON CONFLICT (nama) DO NOTHING;

-- 2. APBDes Budgets
INSERT INTO apbdes_budgets (id, year, category, title, allocated, realized, description) VALUES
  ('b1', 2026, 'pendapatan', 'Dana Desa (DD)', 1250000000, 937500000, 'Alokasi APBN untuk pembangunan dan pemberdayaan desa.'),
  ('b2', 2026, 'pendapatan', 'Alokasi Dana Desa (ADD)', 650000000, 487500000, 'Dana perimbangan kabupaten untuk penghasilan tetap perangkat dan operasional.'),
  ('b3', 2026, 'pendapatan', 'Pendapatan Asli Desa (PADes)', 85000000, 72000000, 'Hasil usaha desa, aset, dan swadaya masyarakat.'),
  ('b4', 2026, 'belanja', 'Pembangunan Infrastruktur Jalan & Jembatan', 950000000, 712500000, 'Betonisasi jalan poros dusun dan perbaikan jembatan penghubung.'),
  ('b5', 2026, 'belanja', 'Pemberdayaan Masyarakat & UMKM', 350000000, 262500000, 'Pelatihan kewirausahaan, bantuan alat produksi, dan modal BUMDes.'),
  ('b6', 2026, 'belanja', 'Penyelenggaraan Pemerintahan Desa', 420000000, 315000000, 'Operasional kantor desa, insentif RT/RW, dan administrasi kependudukan.')
ON CONFLICT (id) DO NOTHING;

-- 3. Projects / Kegiatan
INSERT INTO projects (id, title, category, dusun_id, budget, realized_budget, start_date, end_date, progress, status, description, contractor, lat, lng) VALUES
  ('p1', 'Betonisasi Jalan Poros Dusun I', 'infrastruktur', 1, 350000000, 350000000, '2026-01-10', '2026-04-15', 100, 'selesai', 'Peningkatan jalan utama dusun sepanjang 1.2 km dengan betonisasi K-300.', 'CV. Karya Mandiri', -6.3846, 108.2022),
  ('p2', 'Rehab Saluran Irigasi Tersier', 'pertanian', 3, 180000000, 135000000, '2026-02-01', '2026-05-30', 75, 'sedang_berjalan', 'Normalisasi dan pemasangan U-ditch saluran air sawah seluas 150 hektar.', 'Tani Makmur Sejahtera', -6.3900, 108.2100),
  ('p3', 'Pembangunan Lampu Penerangan Jalan Desa (LPJU)', 'infrastruktur', 2, 120000000, 120000000, '2026-01-15', '2026-03-01', 100, 'selesai', 'Pemasangan 50 titik lampu tenaga surya di titik rawan jalur utama.', 'PT. Terang Benderang', -6.3800, 108.1950),
  ('p4', 'Revitalisasi Posyandu & Sanitasi Desa', 'kesehatan', 4, 150000000, 60000000, '2026-03-01', '2026-06-30', 40, 'sedang_berjalan', 'Pembangunan fasilitas air bersih dan renovasi gedung posyandu terpadu.', 'CV. Sehat Sentosa', -6.3950, 108.2150)
ON CONFLICT (id) DO NOTHING;

-- 4. Bantuan Sosial Stats
INSERT INTO bansos_stats (tahun, dusun_id, program, jumlah_penerima) VALUES
  (2026, 1, 'PKH', 45),
  (2026, 1, 'BPNT', 38),
  (2026, 1, 'BLT', 52),
  (2026, 2, 'PKH', 62),
  (2026, 2, 'BPNT', 55),
  (2026, 2, 'BLT', 71),
  (2026, 3, 'PKH', 38),
  (2026, 3, 'BPNT', 32),
  (2026, 3, 'BLT', 41),
  (2026, 4, 'PKH', 28),
  (2026, 4, 'BPNT', 22),
  (2026, 4, 'BLT', 34)
ON CONFLICT (tahun, dusun_id, program) DO NOTHING;
