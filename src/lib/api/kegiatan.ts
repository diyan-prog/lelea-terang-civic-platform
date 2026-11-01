import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Database } from '../../types/database';

export type Project = Database['public']['Tables']['projects']['Row'];

export const useProjects = (dusunId?: string) =>
  useQuery({
    queryKey: ['projects', dusunId],
    queryFn: async () => {
      let query = supabase.from('projects').select('*');
      if (dusunId) query = query.eq('dusun_id', dusunId);
      const { data, error } = await query;
      if (error) throw error;
      return (data as Project[]) || [];
    },
  });
