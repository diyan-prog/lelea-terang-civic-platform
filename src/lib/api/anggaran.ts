import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export const mapDbBudgetItem = (b: any): any => ({
  id: b.id,
  title: b.title,
  year: b.year,
  category: b.category === 'pendapatan' ? 'pendapatan' : b.category === 'pembiayaan' ? 'pembiayaan' : 'belanja',
  allocated: Number(b.allocated || 0),
  realized: Number(b.realized || 0),
});

export const useBudgets = (year?: number) =>
  useQuery({
    queryKey: ['budgets', year],
    queryFn: async () => {
      let query = supabase.from('apbdes_budgets').select('*').order('year', { ascending: false }).order('id');
      if (year) query = query.eq('year', year);
      const { data, error } = await query;
      if (error) throw error;
      return ((data || []) as any[]).map(mapDbBudgetItem);
    },
  });

export const useSaveBudgetItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ item, isEdit }: { item: any; isEdit: boolean }) => {
      const payload = {
        year: item.year,
        category: item.category === 'belanja' ? item.bidang : item.category,
        title: item.title,
        allocated: item.allocated,
        realized: item.realized,
      };
      if (isEdit) {
        const { error } = await supabase.from('apbdes_budgets').update(payload).eq('id', item.id);
        if (error) throw error;
      } else {
        const id = `bud-${Date.now()}`;
        const { error } = await supabase.from('apbdes_budgets').insert({ ...payload, id });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); },
  });
};

export const useDeleteBudgetItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('apbdes_budgets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); },
  });
};
