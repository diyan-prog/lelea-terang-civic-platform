import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Database } from '../../types/database';

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportUpdate = Database['public']['Tables']['report_updates']['Row'];

export const useReports = (dusunId?: string, status?: string) =>
  useQuery({
    queryKey: ['reports', dusunId, status],
    queryFn: async () => {
      let query = supabase.from('reports').select('*, updates:report_updates(*)').order('created_at', { ascending: false });
      if (dusunId) query = query.eq('dusun_id', dusunId);
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return (data as Report[]) || [];
    },
  });

export const useTrackReport = (ticket: string) =>
  useQuery({
    queryKey: ['track', ticket],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, updates:report_updates(*)')
        .eq('ticket', ticket)
        .single();
      if (error) throw error;
      return data as Report;
    },
    enabled: !!ticket,
  });

export const useSubmitReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string; description: string; category: string; dusun_id: string;
      rw: string; lat: number; lng: number; anonymous: boolean;
      photos?: string[]; reporter_id?: string;
    }) => {
      const { data, error } = await supabase.from('reports').insert({
        judul: payload.title,
        deskripsi: payload.description,
        kategori: payload.category,
        dusun_id: parseInt(payload.dusun_id),
        rw: parseInt(payload.rw),
        lat: payload.lat,
        lng: payload.lng,
        is_anonymous: payload.anonymous,
        reporter_id: payload.reporter_id || null,
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
