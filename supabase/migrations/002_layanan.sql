-- =====================================================
-- Migrasi Layanan Surat — Lelea Terang
-- Jalankan di Supabase SQL Editor
-- =====================================================

-- 1. Tambah kolom ke tabel profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nik text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tempat_lahir text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tanggal_lahir date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS jenis_kelamin text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agama text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pekerjaan text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS alamat text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rt text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rw text;

-- 2. Update service_requests dengan kolom baru
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS pemohon_data jsonb;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS data jsonb;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS instansi_tujuan text;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS tanggal_dibutuhkan date;

-- 3. Tabel lampiran
CREATE TABLE IF NOT EXISTS public.service_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.service_requests(id) on delete cascade,
  name text not null,
  path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. RLS untuk service_attachments
ALTER TABLE public.service_attachments ENABLE ROW LEVEL SECURITY;

-- Kebijakan: staff/admin bisa lihat semua, warga hanya miliknya
CREATE POLICY "staff read all attachments"
  ON public.service_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'perangkat')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.service_requests r
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE r.id = service_attachments.request_id
        AND r.email = p.email
    )
  );

CREATE POLICY "users insert own attachments"
  ON public.service_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_requests r
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE r.id = request_id AND r.email = p.email
    )
  );

-- 5. Storage Bucket (buat manual di Supabase Dashboard > Storage)
-- Buat bucket bernama "service-docs" dengan opsi Private.
-- Setelah bucket dibuat, jalankan ini:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('service-docs', 'service-docs', false, 5242880, ARRAY['image/jpeg','image/png','application/pdf'])
-- ON CONFLICT (id) DO NOTHING;

-- 6. RLS storage untuk service-docs (jalankan di Supabase Dashboard > Storage > service-docs > Policies)
-- Kebijakan untuk upload: warga hanya bisa upload ke path miliknya
-- Kebijakan untuk read: staff bisa lihat semua, warga hanya path miliknya
-- Kebijakan untuk delete: warga hanya bisa hapus lampiran miliknya
