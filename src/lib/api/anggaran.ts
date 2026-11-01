import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Database } from '../../types/database';

export type Budget = Database['public']['Tables']['apbdes_budgets']['Row'];

export const useBudgets = (year?: number) =>
  useQuery({
    queryKey: ['budgets', year],
    queryFn: async () => {
      let query = supabase.from('apbdes_budgets').select('*');
      if (year) query = query.eq('year', year);
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        // Fallback mock data jika supabase kosong agar tampilan langsung tampil
        return [
          { id: "1", year: year || 2026, category: "pendapatan", title: "Dana Desa (APBN)", allocated: 941750000, realized: 941750000, description: "Sumber APBN" },
          { id: "2", year: year || 2026, category: "pendapatan", title: "Alokasi Dana Desa (ADD)", allocated: 517384000, realized: 400000000, description: "Sumber APBD Kab" },
          { id: "3", year: year || 2026, category: "pendapatan", title: "Bantuan Keuangan Provinsi", allocated: 225214940, realized: 225214940, description: "Sumber APBD Prov" },
          { id: "4", year: year || 2026, category: "pendapatan", title: "Pendapatan Asli Desa (PADes)", allocated: 45000000, realized: 30000000, description: "Hasil Usaha Desa" },
          { id: "5", year: year || 2026, category: "belanja", title: "Penyelenggaraan Pemerintahan Desa", allocated: 450000000, realized: 380000000, description: "Operasional kantor & perangkat" },
          { id: "6", year: year || 2026, category: "belanja", title: "Pelaksanaan Pembangunan Desa", allocated: 750000000, realized: 520000000, description: "Infrastruktur & jalan" },
          { id: "7", year: year || 2026, category: "belanja", title: "Pembinaan Kemasyarakatan Desa", allocated: 120000000, realized: 95000000, description: "Keagamaan & kepemudaan" },
          { id: "8", year: year || 2026, category: "belanja", title: "Pemberdayaan Masyarakat Desa", allocated: 180000000, realized: 140000000, description: "Pelatihan UMKM" },
          { id: "9", year: year || 2026, category: "belanja", title: "Penanggulangan Bencana & Darurat", allocated: 50000000, realized: 25000000, description: "Tanggap darurat" },
        ] as Budget[];
      }
      return (data as Budget[]) || [];
    },
  });
