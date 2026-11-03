export interface Database {
  public: {
    Tables: {
      dusun: {
        Row: { id: number; nama: string; jumlah_rw: number }
        Insert: { id?: number; nama: string; jumlah_rw?: number }
        Update: { id?: number; nama?: string; jumlah_rw?: number }
      }
      apbdes_budgets: {
        Row: { id: string; year: number; category: string; title: string; allocated: number; realized: number; description: string | null }
        Insert: { id?: string; year: number; category: string; title: string; allocated: number; realized?: number; description?: string | null }
        Update: { id?: string; year?: number; category?: string; title?: string; allocated?: number; realized?: number; description?: string | null }
      }
      projects: {
        Row: { id: string; title: string; category: string; dusun_id: string; budget: number; realized_budget: number; start_date: string; end_date: string; progress: number; status: string; description: string | null; contractor: string | null; lat: number; lng: number }
        Insert: { id?: string; title: string; category: string; dusun_id: string; budget: number; realized_budget?: number; start_date: string; end_date: string; progress?: number; status?: string; description?: string | null; contractor?: string | null; lat: number; lng: number }
        Update: { id?: string; title?: string; category?: string; dusun_id?: string; budget?: number; realized_budget?: number; start_date?: string; end_date?: string; progress?: number; status?: string; description?: string | null; contractor?: string | null; lat?: number; lng?: number }
      }
      profiles: {
        Row: {
          id: string; full_name: string | null; email: string | null; role: string;
          dusun_id: string | null;
          nik: string | null; tempat_lahir: string | null; tanggal_lahir: string | null;
          jenis_kelamin: string | null; agama: string | null; pekerjaan: string | null;
          alamat: string | null; rt: string | null; rw: string | null;
        }
        Insert: {
          id: string; full_name?: string | null; email?: string | null; role?: string;
          dusun_id?: string | null;
          nik?: string | null; tempat_lahir?: string | null; tanggal_lahir?: string | null;
          jenis_kelamin?: string | null; agama?: string | null; pekerjaan?: string | null;
          alamat?: string | null; rt?: string | null; rw?: string | null;
        }
        Update: {
          id?: string; full_name?: string | null; email?: string | null; role?: string;
          dusun_id?: string | null;
          nik?: string | null; tempat_lahir?: string | null; tanggal_lahir?: string | null;
          jenis_kelamin?: string | null; agama?: string | null; pekerjaan?: string | null;
          alamat?: string | null; rt?: string | null; rw?: string | null;
        }
      }
      reports: {
        Row: {
          id: string; ticket_code: string; judul: string; deskripsi: string; kategori: string; dusun_id: number;
          rw: number; status: string; reporter_id: string | null; is_anonymous: boolean; lat: number | null; lng: number | null;
          confirmation_count: number; mismatch_flag: boolean; rating: number | null; created_at: string;
        }
        Insert: {
          id?: string; ticket_code?: string; judul: string; deskripsi: string; kategori: string; dusun_id: number;
          rw: number; status?: string; reporter_id?: string | null; is_anonymous?: boolean; lat?: number | null; lng?: number | null;
          mismatch_flag?: boolean;
        }
        Update: {
          id?: string; ticket_code?: string; judul?: string; deskripsi?: string; kategori?: string; dusun_id?: number;
          rw?: number; status?: string; reporter_id?: string | null; is_anonymous?: boolean; lat?: number | null; lng?: number | null;
          confirmation_count?: number; mismatch_flag?: boolean; rating?: number | null;
        }
      }
      report_updates: {
        Row: { id: string; report_id: string; status: string; note: string; photo: string | null; created_at: string }
        Insert: { id?: string; report_id: string; status: string; note: string; photo?: string | null }
        Update: { id?: string; report_id?: string; status?: string; note?: string; photo?: string | null }
      }
      service_requests: {
        Row: {
          id: string; ticket: string; type: string; email: string; name: string;
          purpose: string; note: string; status: string; created_at: string;
          pemohon_data: Record<string, unknown> | null;
          data: Record<string, unknown> | null;
          instansi_tujuan: string | null;
          tanggal_dibutuhkan: string | null;
        }
        Insert: {
          id?: string; ticket?: string; type: string; email: string; name: string;
          purpose: string; note?: string; status?: string;
          pemohon_data?: Record<string, unknown>; data?: Record<string, unknown>;
          instansi_tujuan?: string; tanggal_dibutuhkan?: string;
        }
        Update: {
          id?: string; ticket?: string; type?: string; email?: string; name?: string;
          purpose?: string; note?: string; status?: string;
          pemohon_data?: Record<string, unknown>; data?: Record<string, unknown>;
          instansi_tujuan?: string; tanggal_dibutuhkan?: string;
        }
      }
      service_updates: {
        Row: { id: string; request_id: string; status: string; note: string; created_at: string }
        Insert: { id?: string; request_id: string; status: string; note: string }
        Update: { id?: string; request_id?: string; status?: string; note?: string }
      }
      service_attachments: {
        Row: { id: string; request_id: string; name: string; path: string; created_at: string }
        Insert: { id?: string; request_id: string; name: string; path: string }
        Update: { id?: string; request_id?: string; name?: string; path?: string }
      }
      desa_stats_dusun: {
        Row: { id: string; dusun_name: string; penduduk: number; kk: number; sawah: number; created_at: string }
        Insert: { id?: string; dusun_name: string; penduduk: number; kk: number; sawah: number }
        Update: { id?: string; dusun_name?: string; penduduk?: number; kk?: number; sawah?: number }
      }
      desa_stats_usia: {
        Row: { id: string; dusun_id: string; usia_0_4: number; usia_5_9: number; usia_10_14: number; usia_15_19: number; usia_20_29: number; usia_30_39: number; usia_40_49: number; usia_50_59: number; usia_60_69: number; usia_70_plus: number; created_at: string }
        Insert: { id?: string; dusun_id: string; usia_0_4?: number; usia_5_9?: number; usia_10_14?: number; usia_15_19?: number; usia_20_29?: number; usia_30_39?: number; usia_40_49?: number; usia_50_59?: number; usia_60_69?: number; usia_70_plus?: number }
        Update: { id?: string; dusun_id?: string; usia_0_4?: number; usia_5_9?: number; usia_10_14?: number; usia_15_19?: number; usia_20_29?: number; usia_30_39?: number; usia_40_49?: number; usia_50_59?: number; usia_60_69?: number; usia_70_plus?: number }
      }
      desa_stats_pekerjaan: {
        Row: { id: string; name: string; jumlah: number; created_at: string }
        Insert: { id?: string; name: string; jumlah: number }
        Update: { id?: string; name?: string; jumlah?: number }
      }
      desa_stats_pendidikan: {
        Row: { id: string; name: string; jumlah: number; created_at: string }
        Insert: { id?: string; name: string; jumlah: number }
        Update: { id?: string; name?: string; jumlah?: number }
      }
      bansos_stats: {
        Row: { id: string; tahun: number; dusun_id: string; program: string; jumlah_penerima: number }
        Insert: { id?: string; tahun: number; dusun_id: string; program: string; jumlah_penerima: number }
        Update: { id?: string; tahun?: number; dusun_id?: string; program?: string; jumlah_penerima?: number }
      }
    }
  }
}
