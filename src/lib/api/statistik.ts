import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Database } from '../../types/database';

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

const ARCHIVE = {
  months: [
    { m: "Mei", masuk: 10, selesai: 10 },
    { m: "Jun", masuk: 14, selesai: 13 },
    { m: "Jul", masuk: 16, selesai: 15 },
    { m: "Agu", masuk: 18, selesai: 17 },
    { m: "Sep", masuk: 22, selesai: 21 },
  ],
  total: 80,
  selesai: 76,
  fast: 62,
  onTime: 70,
  ratingSum: 176,
  ratingN: 40,
};

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
      
      const { data: reports } = await supabase.from('reports').select('*');
      const reportList = reports || [];
      const selesaiLive = reportList.filter(r => r.status === 'Selesai').length;
      
      // Calculate weighted score like Insight page
      const n = reportList.length + ARCHIVE.total;
      
      // Fast response (< 48 hours)
      const fastLive = reportList.filter((r: any) =>
        r.updates?.length < 2
          ? Date.now() - new Date(r.created_at).getTime() < 48 * 3600e3
          : new Date(r.updates?.[1]?.created_at).getTime() - new Date(r.created_at).getTime() <= 48 * 3600e3
      ).length;
      const resp = Math.round(((fastLive + ARCHIVE.fast) / n) * 100);
      
      // Completed reports
      const done = Math.round(((selesaiLive + ARCHIVE.selesai) / n) * 100);
      
      // SLA compliance - simplified: use late reports
      const isLate = (r: any) => {
        const created = new Date(r.created_at).getTime();
        const now = Date.now();
        const days = (now - created) / (24 * 3600e3);
        return days > 14 && r.status !== 'Selesai';
      };
      const late = reportList.filter(isLate).length;
      const sla = Math.round(((n - late - (ARCHIVE.total - ARCHIVE.onTime)) / n) * 100);
      
      // Rating satisfaction - simplified
      const rated = reportList.filter((r: any) => r.rating);
      const ratingAvg = rated.length > 0
        ? (ARCHIVE.ratingSum + rated.reduce((a, r: any) => a + (r.rating || 0), 0)) / (ARCHIVE.ratingN + rated.length)
        : ARCHIVE.ratingSum / ARCHIVE.ratingN;
      const rating = Math.round((ratingAvg / 5) * 100);
      
      // Weighted score: 30% resp + 30% done + 25% sla + 15% rating
      const score = Math.round(resp * 0.3 + done * 0.3 + sla * 0.25 + rating * 0.15);

      return {
        serap: allocated > 0 ? Math.round((realized / allocated) * 100) : 0,
        selesaiTotal: selesaiLive + ARCHIVE.selesai,
        score
      };
    },
  });
