export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      apbdes_budgets: {
        Row: {
          allocated: number
          category: string
          description: string | null
          id: string
          realized: number
          title: string
          year: number
        }
        Insert: {
          allocated: number
          category: string
          description?: string | null
          id: string
          realized?: number
          title: string
          year?: number
        }
        Update: {
          allocated?: number
          category?: string
          description?: string | null
          id?: string
          realized?: number
          title?: string
          year?: number
        }
        Relationships: []
      }
      bansos_stats: {
        Row: {
          dusun_id: string | null
          id: string
          jumlah_penerima: number
          program: string
          tahun: number
        }
        Insert: {
          dusun_id?: string | null
          id?: string
          jumlah_penerima: number
          program: string
          tahun: number
        }
        Update: {
          dusun_id?: string | null
          id?: string
          jumlah_penerima?: number
          program?: string
          tahun?: number
        }
        Relationships: []
      }
      desa_stats_bansos: {
        Row: {
          blt: number | null
          bpnt: number | null
          created_at: string | null
          dusun_id: string
          id: string
          pkh: number | null
        }
        Insert: {
          blt?: number | null
          bpnt?: number | null
          created_at?: string | null
          dusun_id: string
          id?: string
          pkh?: number | null
        }
        Update: {
          blt?: number | null
          bpnt?: number | null
          created_at?: string | null
          dusun_id?: string
          id?: string
          pkh?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "desa_stats_bansos_dusun_id_fkey"
            columns: ["dusun_id"]
            isOneToOne: true
            referencedRelation: "desa_stats_dusun"
            referencedColumns: ["id"]
          },
        ]
      }
      desa_stats_dusun: {
        Row: {
          created_at: string | null
          dusun_name: string
          id: string
          kk: number
          penduduk: number
          sawah: number
        }
        Insert: {
          created_at?: string | null
          dusun_name: string
          id?: string
          kk?: number
          penduduk?: number
          sawah?: number
        }
        Update: {
          created_at?: string | null
          dusun_name?: string
          id?: string
          kk?: number
          penduduk?: number
          sawah?: number
        }
        Relationships: []
      }
      desa_stats_pekerjaan: {
        Row: {
          created_at: string | null
          id: string
          jumlah: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          jumlah?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          jumlah?: number
          name?: string
        }
        Relationships: []
      }
      desa_stats_pendidikan: {
        Row: {
          created_at: string | null
          id: string
          jumlah: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          jumlah?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          jumlah?: number
          name?: string
        }
        Relationships: []
      }
      desa_stats_usia: {
        Row: {
          created_at: string | null
          dusun_id: string
          id: string
          usia_0_4: number | null
          usia_10_14: number | null
          usia_15_19: number | null
          usia_20_29: number | null
          usia_30_39: number | null
          usia_40_49: number | null
          usia_5_9: number | null
          usia_50_59: number | null
          usia_60_69: number | null
          usia_70_plus: number | null
        }
        Insert: {
          created_at?: string | null
          dusun_id: string
          id?: string
          usia_0_4?: number | null
          usia_10_14?: number | null
          usia_15_19?: number | null
          usia_20_29?: number | null
          usia_30_39?: number | null
          usia_40_49?: number | null
          usia_5_9?: number | null
          usia_50_59?: number | null
          usia_60_69?: number | null
          usia_70_plus?: number | null
        }
        Update: {
          created_at?: string | null
          dusun_id?: string
          id?: string
          usia_0_4?: number | null
          usia_10_14?: number | null
          usia_15_19?: number | null
          usia_20_29?: number | null
          usia_30_39?: number | null
          usia_40_49?: number | null
          usia_5_9?: number | null
          usia_50_59?: number | null
          usia_60_69?: number | null
          usia_70_plus?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "desa_stats_usia_dusun_id_fkey"
            columns: ["dusun_id"]
            isOneToOne: true
            referencedRelation: "desa_stats_dusun"
            referencedColumns: ["id"]
          },
        ]
      }
      dusun: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      population_stats: {
        Row: {
          dusun_id: string | null
          id: string
          indikator: string
          nilai: number
          tahun: number
        }
        Insert: {
          dusun_id?: string | null
          id?: string
          indikator: string
          nilai: number
          tahun: number
        }
        Update: {
          dusun_id?: string | null
          id?: string
          indikator?: string
          nilai?: number
          tahun?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agama: string | null
          alamat: string | null
          dusun_id: number | null
          email: string | null
          full_name: string | null
          id: string
          jenis_kelamin: string | null
          nik: string | null
          pekerjaan: string | null
          role: string | null
          rt: string | null
          rw: string | null
          tanggal_lahir: string | null
          tempat_lahir: string | null
        }
        Insert: {
          agama?: string | null
          alamat?: string | null
          dusun_id?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          jenis_kelamin?: string | null
          nik?: string | null
          pekerjaan?: string | null
          role?: string | null
          rt?: string | null
          rw?: string | null
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
        }
        Update: {
          agama?: string | null
          alamat?: string | null
          dusun_id?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          jenis_kelamin?: string | null
          nik?: string | null
          pekerjaan?: string | null
          role?: string | null
          rt?: string | null
          rw?: string | null
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number
          category: string
          contractor: string | null
          description: string | null
          dusun_id: string | null
          end_date: string | null
          id: string
          lat: number | null
          lng: number | null
          progress: number
          realized_budget: number
          start_date: string | null
          status: string
          title: string
        }
        Insert: {
          budget?: number
          category: string
          contractor?: string | null
          description?: string | null
          dusun_id?: string | null
          end_date?: string | null
          id: string
          lat?: number | null
          lng?: number | null
          progress?: number
          realized_budget?: number
          start_date?: string | null
          status?: string
          title: string
        }
        Update: {
          budget?: number
          category?: string
          contractor?: string | null
          description?: string | null
          dusun_id?: string | null
          end_date?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          progress?: number
          realized_budget?: number
          start_date?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_dusun_id_fkey"
            columns: ["dusun_id"]
            isOneToOne: false
            referencedRelation: "dusun"
            referencedColumns: ["id"]
          },
        ]
      }
      report_updates: {
        Row: {
          created_at: string
          id: string
          is_sample: boolean | null
          note: string
          photo: string | null
          report_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_sample?: boolean | null
          note: string
          photo?: string | null
          report_id?: string | null
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          is_sample?: boolean | null
          note?: string
          photo?: string | null
          report_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_updates_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          anonymous: boolean | null
          category: string
          confirmations: number | null
          created_at: string
          description: string
          dusun_id: string | null
          id: string
          is_sample: boolean | null
          lat: number
          lng: number
          mismatch: boolean | null
          rating: number | null
          reporter_id: string | null
          rw: string
          status: string
          ticket: string
          title: string
          user_id: string | null
        }
        Insert: {
          anonymous?: boolean | null
          category: string
          confirmations?: number | null
          created_at?: string
          description: string
          dusun_id?: string | null
          id?: string
          is_sample?: boolean | null
          lat: number
          lng: number
          mismatch?: boolean | null
          rating?: number | null
          reporter_id?: string | null
          rw: string
          status?: string
          ticket: string
          title: string
          user_id?: string | null
        }
        Update: {
          anonymous?: boolean | null
          category?: string
          confirmations?: number | null
          created_at?: string
          description?: string
          dusun_id?: string | null
          id?: string
          is_sample?: boolean | null
          lat?: number
          lng?: number
          mismatch?: boolean | null
          rating?: number | null
          reporter_id?: string | null
          rw?: string
          status?: string
          ticket?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_dusun_id_fkey"
            columns: ["dusun_id"]
            isOneToOne: false
            referencedRelation: "dusun"
            referencedColumns: ["id"]
          },
        ]
      }
      service_attachments: {
        Row: {
          created_at: string
          id: string
          name: string
          path: string
          request_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          path: string
          request_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          path?: string
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_attachments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          created_at: string
          data: Json | null
          email: string
          id: string
          instansi_tujuan: string | null
          is_sample: boolean | null
          name: string
          note: string | null
          pemohon_data: Json | null
          purpose: string
          status: string
          tanggal_dibutuhkan: string | null
          ticket: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          email: string
          id?: string
          instansi_tujuan?: string | null
          is_sample: boolean | null
          name: string
          note?: string | null
          pemohon_data?: Json | null
          purpose: string
          status?: string
          tanggal_dibutuhkan?: string | null
          ticket: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          email?: string
          id?: string
          instansi_tujuan?: string | null
          is_sample?: boolean | null
          name?: string
          note?: string | null
          pemohon_data?: Json | null
          purpose?: string
          status?: string
          tanggal_dibutuhkan?: string | null
          ticket?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      service_updates: {
        Row: {
          created_at: string
          id: string
          is_sample: boolean | null
          note: string
          request_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_sample?: boolean | null
          note: string
          request_id?: string | null
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          is_sample?: boolean | null
          note?: string
          request_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_updates_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
