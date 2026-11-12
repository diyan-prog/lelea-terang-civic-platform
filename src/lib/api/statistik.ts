import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Database } from '../../types/database';
import { mapDbReport } from './laporan';
import { isLate } from '../mock';

export type StatsDusun = Database['public']['Tables']['desa_stats_dusun']['Row'];
export type StatsUsia = Database['public']['Tables']['desa_stats_usia']['Row'];
export type StatsPekerjaan = Database['public']['Tables']['desa_stats_pekerjaan']['Row'];
export type StatsPendidikan = Database['public']['Tables']['desa_stats_pendidikan']['Row'];
export type StatsBansos = Database['public']['Tables']['bansos_stats']['Row'];

export const useStatsDusun = () =>
  useQuery({
    queryKey: ['stats_dusun'],
    queryFn: async () => {
      const { data, error } = await supabase.from('desa_stats_dusun').select('*').order('dusun_name');
      if (error) throw error;
      return (data as StatsDusun[]) || [];
    },
  });

export const useStatsUsia = () =>
  useQuery({
    queryKey: ['stats_usia'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('desa_stats_usia')
        .select('*, dusun:desa_stats_dusun(dusun_name)');
      if (error) throw error;
      return (data as StatsUsia[]) || [];
    },
  });

export const useStatsPekerjaan = () =>
  useQuery({
    queryKey: ['stats_pekerjaan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('desa_stats_pekerjaan')
        .select('*')
        .order('jumlah', { ascending: false });
      if (error) throw error;
      return (data as StatsPekerjaan[]) || [];
    },
  });

export const useStatsPendidikan = () =>
  useQuery({
    queryKey: ['stats_pendidikan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('desa_stats_pendidikan')
        .select('*')
        .order('jumlah', { ascending: false });
      if (error) throw error;
      return (data as StatsPendidikan[]) || [];
    },
  });

export const useStatsBansos = () =>
  useQuery({
    queryKey: ['stats_bansos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bansos_stats')
        .select('*')
        .eq('tahun', 2026);
      if (error) throw error;
      return data || [];
    },
  });



export const useStats = () =>
  useQuery({
    queryKey: ['stats_dashboard'],
    queryFn: async () => {
      const { data: budgets } = await supabase
        .from('apbdes_budgets')
        .select('*')
        .eq('year', 2026);
      
      const realized = (budgets || [])
        .reduce((sum, b) => sum + (b.realized || 0), 0);
      
      const allocated = (budgets || [])
        .reduce((sum, b) => sum + (b.allocated || 0), 0);
      
      const { data: dbReports } = await supabase.from('reports').select('*, updates:report_updates(*), photos:report_photos(*)');
      const reports = (dbReports || []).map(mapDbReport);
      const selesaiLive = reports.filter(r => r.status === 'Selesai').length;
      
      // Calculate weighted score like Insight page
      const n = reports.length || 1;
      
      // Fast response (< 48 hours)
      const fastLive = reports.filter((r) =>
        r.updates.length < 2
          ? Date.now() - +new Date(r.createdAt) < 48 * 3600e3
          : +new Date(r.updates[1].at) - +new Date(r.createdAt) <= 48 * 3600e3
      ).length;
      const resp = Math.round((fastLive / n) * 100);
      
      // Completed reports
      const done = Math.round((selesaiLive / n) * 100);
      
      // SLA compliance - use mock isLate
      const late = reports.filter(isLate).length;
      const sla = Math.round(((n - late) / n) * 100);
      
      // Rating satisfaction - simplified
      const rated = reports.filter((r) => r.rating);
      const ratingAvg = rated.length > 0
        ? rated.reduce((a, r) => a + (r.rating || 0), 0) / rated.length
        : 0;
      const rating = Math.round((ratingAvg / 5) * 100);
      
      // Weighted score: 30% resp + 30% done + 25% sla + 15% rating
      const score = Math.round(resp * 0.3 + done * 0.3 + sla * 0.25 + rating * 0.15);

      return {
        serap: allocated > 0 ? Math.round((realized / allocated) * 100) : 0,
        selesaiTotal: selesaiLive,
        score
      };
    },
  });
