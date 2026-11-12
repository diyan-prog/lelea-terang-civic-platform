-- =====================================================
-- Perbaikan RLS & Storage Layanan Surat
-- =====================================================

-- 1. Pastikan kolom ticket konsisten
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_requests' AND column_name='ticket_code') THEN
    ALTER TABLE public.service_requests RENAME COLUMN ticket_code TO ticket;
  END IF;
END $$;

-- 2. Perbaiki RLS service_attachments (Gunakan user_id untuk keamanan)
DROP POLICY IF EXISTS "staff read all attachments" ON public.service_attachments;
DROP POLICY IF EXISTS "users insert own attachments" ON public.service_attachments;

CREATE POLICY "staff_read_all_attachments"
  ON public.service_attachments FOR SELECT
  USING (is_staff());

CREATE POLICY "users_read_own_attachments"
  ON public.service_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.service_requests r
      WHERE r.id = service_attachments.request_id
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "users_insert_own_attachments"
  ON public.service_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_requests r
      WHERE r.id = request_id AND r.user_id = auth.uid()
    )
  );

-- 3. Perbaiki RLS service_requests (Gunakan user_id)
DROP POLICY IF EXISTS "baca layanan sendiri/staf" ON public.service_requests;
DROP POLICY IF EXISTS "ajukan layanan" ON public.service_requests;

CREATE POLICY "service_requests_select" ON public.service_requests
  FOR SELECT USING (user_id = auth.uid() or is_staff());

CREATE POLICY "service_requests_insert" ON public.service_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "service_requests_update_staff" ON public.service_requests
  FOR UPDATE USING (is_staff());

-- 4. Storage Setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('service-docs', 'service-docs', false, 5242880, ARRAY['image/jpeg','image/png','application/pdf'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies
CREATE POLICY "authenticated_upload_docs" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'service-docs' AND auth.uid() IS NOT NULL);

CREATE POLICY "owner_staff_read_docs" ON storage.objects FOR SELECT
  USING (bucket_id = 'service-docs' AND (auth.uid()::text = (storage.foldername(name))[1] OR is_staff()));

CREATE POLICY "owner_delete_docs" ON storage.objects FOR DELETE
  USING (bucket_id = 'service-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
