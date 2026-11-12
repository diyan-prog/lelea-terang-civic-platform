import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Database } from '../../types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export const useProfiles = () =>
  useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      return (data as Profile[]) || [];
    },
  });
