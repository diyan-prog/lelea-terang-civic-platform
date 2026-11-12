import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Database } from '../../types/database';

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportUpdate = Database['public']['Tables']['report_updates']['Row'];

export const useReports = (dusunId?: string, status?: string) =>
  useQuery({
    queryKey: ['reports', dusunId, status],
    queryFn: async () => {
      try {
        let query = supabase
          .from('reports')
          .select('*, updates:report_updates(*), photos:report_photos(*)')
          .order('created_at', { ascending: false });
        if (dusunId) query = query.eq('dusun_id', dusunId);
        if (status) query = query.eq('status', status);
        const { data, error } = await query;
        if (error) {
          console.warn('useReports error, returning empty array:', error.message);
          return [];
        }
        return (data as Report[]) || [];
      } catch (e) {
        console.warn('useReports crashed, returning empty array:', e);
        return [];
      }
    },
  });

export const useMyReports = (userId?: string, email?: string) =>
  useQuery({
    queryKey: ['my-reports', userId, email],
    queryFn: async () => {
      if (!userId && !email) return [];
      let query = supabase
        .from('reports')
        .select('*, updates:report_updates(*), photos:report_photos(*)')
        .order('created_at', { ascending: false });
      
      if (userId && email) {
        query = query.or(`user_id.eq.${userId},email.eq.${email}`);
      } else if (userId) {
        query = query.eq('user_id', userId);
      } else if (email) {
        query = query.eq('email', email);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as Report[]) || [];
    },
    enabled: !!userId || !!email,
  });

export const useTrackReport = (ticket: string) =>
  useQuery({
    queryKey: ['track', ticket],
    queryFn: async () => {
      try {
        const { data: report, error: reportError } = await supabase
          .from('reports')
          .select('*, updates:report_updates(*), photos:report_photos(*)')
          .ilike('ticket', ticket.trim())
          .single();
        if (reportError || !report) return null;

        // Fallback: jika photos kosong, ambil langsung dari tabel report_photos
        if (!report.photos || report.photos.length === 0) {
          const { data: manualPhotos } = await supabase
            .from('report_photos')
            .select('url')
            .eq('report_id', report.id);
          if (manualPhotos && manualPhotos.length > 0) {
            (report as any).photos = manualPhotos;
          }
        }

        return report as any;
      } catch (err) {
        console.error("Failed to fetch report:", err);
        return null;
      }
    },
    enabled: !!ticket,
  });

export const useSubmitReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string; description: string; category: string; dusun_id: string;
      rw: string; lat: number; lng: number; anonymous: boolean;
      user_id: string; // Tambahkan user_id
    }) => {
      // 1. Upload foto jika ada (placeholder logika, sesuaikan dengan input form)
      // payload.photos.map(...)

      // 2. Insert ke reports
      const { data, error } = await supabase.from('reports').insert({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        dusun_id: payload.dusun_id, // Sesuaikan tipe dengan DB
        rw: payload.rw,
        lat: payload.lat,
        lng: payload.lng,
        anonymous: payload.anonymous,
        user_id: payload.user_id,
        ticket: `LT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, // Generate sementara
        status: 'diterima',
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); },
  });
};

export const useConfirmReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reportId, userId }: { reportId: string; userId: string }) =>
      supabase.rpc('confirm_report', { p_report_id: reportId, p_user_id: userId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); },
  });
};

export const useAdminReports = () =>
  useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, updates:report_updates(*), photos:report_photos(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Report[];
    },
  });

export const useUpdateReportStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      note,
      staffId,
    }: {
      reportId: string;
      status: string;
      note: string;
      staffId: string;
    }) => {
      // 1. Insert update record
      const { error: insertError } = await supabase
        .from('report_updates')
        .insert({
          report_id: reportId,
          status,
          note,
          staff_id: staffId,
        });
      if (insertError) throw insertError;

      // 2. Update report status
      const { error: updateError } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId);
      if (updateError) throw updateError;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reports'] }); },
  });
};

const CAT_MAP: Record<string, any> = {
  'jalan_rusak': 'jalan',
  'irigasi': 'irigasi',
  'sampah_lingkungan': 'sampah',
  'lampu_jalan': 'lampu',
  'air_bersih': 'air',
  'dugaan_penyimpangan': 'dugaan',
}
const STATUS_MAP: Record<string, string> = {
  'diterima': 'Diterima',
  'diverifikasi': 'Diverifikasi',
  'diproses': 'Diproses',
  'selesai': 'Selesai',
  'ditolak': 'Ditolak',
}

export const mapDbReport = (r: any): any => {
  if (!r) return null;
  return {
    ticket: r.ticket || '',
    title: r.title || '',
    desc: r.description || '',
    category: CAT_MAP[r.category] || r.category || 'jalan',
    dusun: r.dusun_id ? (Number(r.dusun_id.replace('d','')) - 1) : 0,
    rw: r.rw || '',
    status: STATUS_MAP[r.status] || r.status || 'Diterima',
    createdAt: r.created_at || new Date().toISOString(),
    confirmations: r.confirmation_count || 0,
    anonymous: r.anonymous || false,
    reporter: r.anonymous ? 'Anonim' : 'Warga',
    lat: r.lat || -6.420,
    lng: r.lng || 108.251,
    photos: r.photos?.map((p: any) => p.url) || [],
    updates: r.updates?.map((u: any) => ({ status: STATUS_MAP[u.status] || u.status || 'Diterima', note: u.note || '', at: u.created_at })) || [],
    mismatch: r.mismatch_flag || false,
    projectId: r.project_id,
    rating: r.rating,
    slaDays: r.sla_selesai_due ? Math.ceil((new Date(r.sla_selesai_due).getTime() - Date.now()) / 86400000) : 3,
  };
};

export const useRateReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reportId,
      rating,
      comment,
    }: {
      reportId: string;
      rating: number;
      comment?: string;
    }) => {
      const { error } = await supabase
        .from('reports')
        .update({ rating, rating_comment: comment })
        .eq('id', reportId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); },
  });
};
