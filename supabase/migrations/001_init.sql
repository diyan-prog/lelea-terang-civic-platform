-- =====================================================
-- Lelea Terang — Skema Supabase (PostgreSQL)
-- Jalankan di Supabase SQL Editor (atau sebagai migration)
-- =====================================================

create extension if not exists "pgcrypto";

-- ---------- ENUM ----------
create type user_role as enum ('warga', 'perangkat', 'admin');
create type report_status as enum ('diterima', 'diverifikasi', 'diproses', 'selesai', 'ditolak');
create type report_priority as enum ('normal', 'tinggi');
create type report_category as enum (
  'jalan_rusak', 'irigasi', 'sampah_lingkungan', 'lampu_jalan',
  'air_bersih', 'dugaan_penyimpangan', 'lainnya'
);
create type project_status as enum ('direncanakan', 'berjalan', 'selesai');
create type service_type as enum (
  'surat_keterangan', 'pengantar_ktp_kk', 'sktm', 'domisili_usaha'
);
create type service_status as enum ('diajukan', 'diperiksa', 'siap_diambil', 'selesai', 'ditolak');
create type budget_kind as enum ('pendapatan', 'belanja', 'pembiayaan');

-- ---------- MASTER ----------
create table dusun (
  id serial primary key,
  nama text not null unique,
  jumlah_rw int not null default 1
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  dusun_id int references dusun(id),
  role user_role not null default 'warga',
  created_at timestamptz not null default now()
);

-- Buat profil otomatis saat user mendaftar
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- Helper role (security definer agar tidak rekursif di RLS)
create or replace function current_role_name() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(current_role_name() in ('perangkat', 'admin'), false)
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(current_role_name() = 'admin', false)
$$;

-- ---------- TRANSPARANSI ----------
create table budget_items (
  id uuid primary key default gen_random_uuid(),
  tahun int not null,
  jenis budget_kind not null,
  bidang text not null,            -- mis. Penyelenggaraan Pemerintahan, Pembangunan, Pembinaan, Pemberdayaan, Penanggulangan Bencana
  uraian text not null,
  anggaran numeric(16,2) not null default 0,
  realisasi numeric(16,2) not null default 0,
  created_at timestamptz not null default now()
);
create index on budget_items (tahun, jenis);

create table projects (
  id uuid primary key default gen_random_uuid(),
  tahun int not null,
  nama text not null,
  deskripsi text,
  bidang text not null,
  kategori report_category,        -- untuk pencocokan dengan laporan (jalan_rusak, irigasi, ...)
  dusun_id int references dusun(id),
  anggaran numeric(16,2) not null default 0,
  realisasi_persen int not null default 0 check (realisasi_persen between 0 and 100),
  status project_status not null default 'direncanakan',
  lat double precision,
  lng double precision,
  tanggal_mulai date,
  tanggal_selesai date,
  created_at timestamptz not null default now()
);

create table project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  url text not null,
  keterangan text,
  tahap_persen int,
  created_at timestamptz not null default now()
);

create table population_stats (
  id uuid primary key default gen_random_uuid(),
  tahun int not null,
  dusun_id int references dusun(id),
  indikator text not null,         -- 'penduduk_laki', 'penduduk_perempuan', 'usia_0_14', 'pekerjaan_petani', 'pendidikan_sma', ...
  nilai int not null,
  unique (tahun, dusun_id, indikator)
);

create table bansos_stats (
  id uuid primary key default gen_random_uuid(),
  tahun int not null,
  dusun_id int references dusun(id),
  program text not null,           -- 'BLT-DD', 'PKH', 'BPNT'
  jumlah_penerima int not null,
  unique (tahun, dusun_id, program)
);

-- ---------- LAPORAN ----------
create sequence report_seq start 1;

create table reports (
  id uuid primary key default gen_random_uuid(),
  ticket_code text unique not null,
  reporter_id uuid references auth.users(id),
  is_anonymous boolean not null default false,
  kategori report_category not null,
  judul text not null check (char_length(judul) between 5 and 120),
  deskripsi text not null check (char_length(deskripsi) between 10 and 2000),
  dusun_id int references dusun(id),
  rw int,
  lat double precision,
  lng double precision,
  status report_status not null default 'diterima',
  priority report_priority not null default 'normal',
  linked_project_id uuid references projects(id),
  mismatch_flag boolean not null default false,
  confirmation_count int not null default 0,
  sla_respon_due timestamptz not null,
  sla_selesai_due timestamptz,
  first_response_at timestamptz,
  resolved_at timestamptz,
  rejection_reason text,
  rating int check (rating between 1 and 5),
  rating_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on reports (status);
create index on reports (dusun_id, kategori);
create index on reports (created_at desc);

create table report_photos (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  url text not null,
  is_proof boolean not null default false,   -- true = bukti penyelesaian dari petugas
  created_at timestamptz not null default now()
);

create table report_updates (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  status report_status not null,
  catatan text,
  staff_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table report_confirmations (
  report_id uuid not null references reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

-- Haversine (meter), tanpa PostGIS agar setup mudah
create or replace function distance_m(lat1 double precision, lng1 double precision,
                                      lat2 double precision, lng2 double precision)
returns double precision language sql immutable as $$
  select 2 * 6371000 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ))
$$;

-- Trigger: kode tiket, SLA, tautan kegiatan, prioritas
create or replace function reports_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare p record;
begin
  new.ticket_code := 'LT-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('report_seq')::text, 4, '0');
  new.sla_respon_due := now() + interval '3 days';

  if new.lat is not null and new.lng is not null
     and new.kategori in ('jalan_rusak', 'irigasi', 'sampah_lingkungan') then
    select * into p from projects
     where status = 'selesai' and lat is not null
       and (kategori = new.kategori)
       and distance_m(new.lat, new.lng, lat, lng) <= 300
     order by distance_m(new.lat, new.lng, lat, lng) limit 1;
    if found then
      new.linked_project_id := p.id;
      new.mismatch_flag := true;
    end if;
  end if;

  if new.kategori = 'dugaan_penyimpangan' or new.mismatch_flag then
    new.priority := 'tinggi';
  end if;

  new.sla_selesai_due := now() + case when new.priority = 'tinggi' then interval '7 days' else interval '14 days' end;
  return new;
end $$;

create trigger trg_reports_before_insert
before insert on reports for each row execute function reports_before_insert();

-- Catat update awal
create or replace function reports_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into report_updates (report_id, status, catatan) values (new.id, 'diterima', 'Laporan diterima sistem.');
  return new;
end $$;

create trigger trg_reports_after_insert
after insert on reports for each row execute function reports_after_insert();

-- Konfirmasi komunitas -> naikkan counter, eskalasi prioritas
create or replace function confirmation_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update reports set confirmation_count = confirmation_count + 1,
         priority = case when confirmation_count + 1 >= 3 then 'tinggi' else priority end
   where id = new.report_id;
  return new;
end $$;

create trigger trg_confirmation_after_insert
after insert on report_confirmations for each row execute function confirmation_after_insert();

-- Ubah status oleh staf (RPC) — mencatat audit trail
create or replace function update_report_status(p_report uuid, p_status report_status, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_staff() then raise exception 'Tidak berwenang'; end if;
  if p_status = 'ditolak' and coalesce(trim(p_note), '') = '' then
    raise exception 'Alasan penolakan wajib diisi';
  end if;

  update reports set
    status = p_status,
    updated_at = now(),
    first_response_at = coalesce(first_response_at, now()),
    resolved_at = case when p_status = 'selesai' then now() else resolved_at end,
    rejection_reason = case when p_status = 'ditolak' then p_note else rejection_reason end
  where id = p_report;

  insert into report_updates (report_id, status, catatan, staff_id)
  values (p_report, p_status, p_note, auth.uid());
end $$;

-- Warga memberi rating setelah selesai
create or replace function rate_report(p_report uuid, p_rating int, p_comment text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  update reports set rating = p_rating, rating_comment = p_comment
   where id = p_report and reporter_id = auth.uid() and status = 'selesai';
  if not found then raise exception 'Tidak dapat memberi penilaian'; end if;
end $$;

-- ---------- LAYANAN SURAT ----------
create table service_requests (
  id uuid primary key default gen_random_uuid(),
  ticket_code text unique not null default ('LS-' || to_char(now(), 'YYYYMM') || '-' || substr(gen_random_uuid()::text, 1, 4)),
  user_id uuid not null references auth.users(id),
  jenis service_type not null,
  keperluan text not null,
  status service_status not null default 'diajukan',
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table service_updates (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references service_requests(id) on delete cascade,
  status service_status not null,
  catatan text,
  staff_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace function update_service_status(p_service uuid, p_status service_status, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_staff() then raise exception 'Tidak berwenang'; end if;
  update service_requests set status = p_status, catatan = p_note, updated_at = now(),
         completed_at = case when p_status = 'selesai' then now() else completed_at end
   where id = p_service;
  insert into service_updates (service_id, status, catatan, staff_id) values (p_service, p_status, p_note, auth.uid());
end $$;

-- ---------- VIEW PUBLIK (tanpa data pelapor) ----------
create or replace view v_public_reports with (security_invoker = false) as
select r.id, r.ticket_code, r.kategori, r.judul, r.deskripsi, r.dusun_id, d.nama as dusun_nama, r.rw,
       r.lat, r.lng, r.status, r.priority, r.mismatch_flag, r.linked_project_id,
       r.confirmation_count, r.sla_respon_due, r.sla_selesai_due, r.first_response_at,
       r.resolved_at, r.rejection_reason, r.rating, r.created_at,
       (r.status not in ('selesai', 'ditolak') and now() > r.sla_selesai_due) as terlambat
from reports r left join dusun d on d.id = r.dusun_id;

create or replace view v_public_report_updates with (security_invoker = false) as
select u.id, u.report_id, u.status, u.catatan, u.created_at from report_updates u;

create or replace view v_public_report_photos with (security_invoker = false) as
select id, report_id, url, is_proof from report_photos;

-- ---------- INSIGHT ----------
-- Skor responsivitas (0-100) untuk periode (default 90 hari)
create or replace function responsiveness_score(p_days int default 90)
returns table (
  total_laporan int, selesai int,
  avg_respon_jam numeric, pct_selesai numeric, pct_tepat_sla numeric, avg_rating numeric,
  skor int
) language sql stable security definer set search_path = public as $$
  with base as (
    select * from reports where created_at >= now() - make_interval(days => p_days)
  ), agg as (
    select
      count(*)::int as total,
      count(*) filter (where status = 'selesai')::int as done,
      avg(extract(epoch from (first_response_at - created_at)) / 3600) filter (where first_response_at is not null) as resp_h,
      coalesce(100.0 * count(*) filter (where status = 'selesai') / nullif(count(*), 0), 0) as pct_done,
      coalesce(100.0 * count(*) filter (where status = 'selesai' and resolved_at <= sla_selesai_due)
               / nullif(count(*) filter (where status = 'selesai'), 0), 0) as pct_sla,
      avg(rating) as rate
    from base
  )
  select total, done, round(coalesce(resp_h, 0), 1), round(pct_done, 1), round(pct_sla, 1), round(coalesce(rate, 0), 2),
         round(
           0.30 * greatest(0, 100 - coalesce(resp_h, 72) / 72 * 100) +   -- 72 jam = SLA respon, 0 poin
           0.30 * pct_done +
           0.25 * pct_sla +
           0.15 * coalesce(rate, 0) / 5 * 100
         )::int
  from agg
$$;

create or replace function reports_by_dusun_category(p_days int default 90)
returns table (dusun text, kategori report_category, jumlah int)
language sql stable security definer set search_path = public as $$
  select coalesce(d.nama, 'Tidak diketahui'), r.kategori, count(*)::int
  from reports r left join dusun d on d.id = r.dusun_id
  where r.created_at >= now() - make_interval(days => p_days)
  group by 1, 2 order by 3 desc
$$;

create or replace function monthly_report_trend(p_months int default 12)
returns table (bulan text, masuk int, selesai int)
language sql stable security definer set search_path = public as $$
  select to_char(m, 'YYYY-MM'),
    (select count(*) from reports where date_trunc('month', created_at) = m)::int,
    (select count(*) from reports where date_trunc('month', resolved_at) = m)::int
  from generate_series(date_trunc('month', now()) - make_interval(months => p_months - 1),
                       date_trunc('month', now()), interval '1 month') m
$$;

-- Lacak tiket publik
create or replace function track_ticket(p_code text)
returns table (ticket_code text, judul text, status report_status, created_at timestamptz, terlambat boolean)
language sql stable security definer set search_path = public as $$
  select ticket_code, judul, status, created_at, terlambat from v_public_reports where ticket_code = upper(trim(p_code))
$$;

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table dusun enable row level security;
alter table budget_items enable row level security;
alter table projects enable row level security;
alter table project_photos enable row level security;
alter table population_stats enable row level security;
alter table bansos_stats enable row level security;
alter table reports enable row level security;
alter table report_photos enable row level security;
alter table report_updates enable row level security;
alter table report_confirmations enable row level security;
alter table service_requests enable row level security;
alter table service_updates enable row level security;

-- profiles
create policy "profil sendiri/staf baca" on profiles for select using (id = auth.uid() or is_staff());
create policy "profil sendiri ubah" on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));
create policy "admin kelola profil" on profiles for all using (is_admin()) with check (is_admin());

-- data publik: semua boleh baca, admin/staf tulis
create policy "baca dusun" on dusun for select using (true);
create policy "admin dusun" on dusun for all using (is_admin()) with check (is_admin());

create policy "baca anggaran" on budget_items for select using (true);
create policy "admin anggaran" on budget_items for all using (is_admin()) with check (is_admin());

create policy "baca kegiatan" on projects for select using (true);
create policy "staf kegiatan" on projects for all using (is_staff()) with check (is_staff());

create policy "baca foto kegiatan" on project_photos for select using (true);
create policy "staf foto kegiatan" on project_photos for all using (is_staff()) with check (is_staff());

create policy "baca statistik" on population_stats for select using (true);
create policy "admin statistik" on population_stats for all using (is_admin()) with check (is_admin());

create policy "baca bansos" on bansos_stats for select using (true);
create policy "admin bansos" on bansos_stats for all using (is_admin()) with check (is_admin());

-- reports: tabel dasar hanya pemilik & staf (publik lewat view)
create policy "baca laporan sendiri/staf" on reports for select using (reporter_id = auth.uid() or is_staff());
create policy "buat laporan" on reports for insert with check (
  auth.uid() is not null and reporter_id = auth.uid()
);
create policy "staf ubah laporan" on reports for update using (is_staff());

create policy "baca foto laporan" on report_photos for select using (
  is_staff() or exists (select 1 from reports r where r.id = report_id and r.reporter_id = auth.uid())
);
create policy "unggah foto laporan" on report_photos for insert with check (
  is_staff() or exists (select 1 from reports r where r.id = report_id and r.reporter_id = auth.uid())
);

create policy "baca update" on report_updates for select using (
  is_staff() or exists (select 1 from reports r where r.id = report_id and r.reporter_id = auth.uid())
);

create policy "konfirmasi sendiri" on report_confirmations for select using (user_id = auth.uid() or is_staff());
create policy "buat konfirmasi" on report_confirmations for insert with check (
  user_id = auth.uid()
  and not exists (select 1 from reports r where r.id = report_id and r.reporter_id = auth.uid())
);

-- layanan
create policy "baca layanan sendiri/staf" on service_requests for select using (user_id = auth.uid() or is_staff());
create policy "ajukan layanan" on service_requests for insert with check (user_id = auth.uid());
create policy "baca update layanan" on service_updates for select using (
  is_staff() or exists (select 1 from service_requests s where s.id = service_id and s.user_id = auth.uid())
);

-- izin akses view/fungsi publik
grant select on v_public_reports, v_public_report_updates, v_public_report_photos to anon, authenticated;
grant execute on function responsiveness_score(int), reports_by_dusun_category(int),
  monthly_report_trend(int), track_ticket(text) to anon, authenticated;
grant execute on function update_report_status(uuid, report_status, text),
  update_service_status(uuid, service_status, text), rate_report(uuid, int, text) to authenticated;

-- ---------- STORAGE (jalankan juga di dashboard Storage) ----------
insert into storage.buckets (id, name, public) values
  ('report-photos', 'report-photos', true),
  ('project-photos', 'project-photos', true)
on conflict do nothing;

create policy "foto laporan publik baca" on storage.objects for select
  using (bucket_id in ('report-photos', 'project-photos'));
create policy "login unggah foto laporan" on storage.objects for insert
  with check (bucket_id = 'report-photos' and auth.uid() is not null);
create policy "staf unggah foto kegiatan" on storage.objects for insert
  with check (bucket_id = 'project-photos' and is_staff());

-- ---------- SEED MINIMAL ----------
insert into dusun (nama, jumlah_rw) values
  ('Dusun 1', 3), ('Dusun 2', 3), ('Dusun 3', 2), ('Dusun 4', 2)
on conflict do nothing;
-- Catatan: ganti nama dusun dengan data asli Desa Lelea.
-- Seed lain (APBDes, kegiatan, laporan contoh) dibuat oleh OpenCode di supabase/seed.sql.
