import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export const mapDbProject = (p: any): any => ({
  id: p.id,
  name: p.title,
  desc: p.description,
  bidang: p.category === 'infrastruktur' ? 'Pembangunan' : 
          p.category === 'pertanian' ? 'Pemberdayaan Masyarakat' : 
          p.category === 'kesehatan' ? 'Pembinaan Kemasyarakatan' : 'Penyelenggaraan Pemerintahan',
  category: p.category,
  dusun: p.dusun_id ? parseInt(p.dusun_id.replace('d', '')) - 1 : 0,
  anggaran: p.budget,
  realized: p.realized_budget,
  progress: p.progress,
  status: p.status === 'selesai' ? 'Selesai' : p.status === 'sedang_berjalan' ? 'Berjalan' : 'Direncanakan',
  date: p.start_date,
  lat: p.lat,
  lng: p.lng,
  photos: p.photos?.map((ph: any) => ph.url) || [],
})

// ---- QUERIES ----

export const useProjects = (dusunId?: string) =>
  useQuery({
    queryKey: ['projects', dusunId],
    queryFn: async () => {
      let query = supabase.from('projects').select('*, photos:project_photos(*)');
      if (dusunId) query = query.eq('dusun_id', dusunId);
      const { data, error } = await query;
      if (error) throw error;
      return ((data || []) as any[]).map(mapDbProject);
    },
  });

export const useProject = (id: string) =>
  useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, photos:project_photos(*)')
          .eq('id', id)
          .single();
        if (error || !data) return null;
        return mapDbProject(data);
      } catch (err) {
        console.error("Failed to fetch project:", err);
        return null;
      }
    },
    enabled: !!id,
  });

// ---- MUTATIONS ----

export const useSaveProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ project, photos }: { project: any; photos: string[] }) => {
      const isEdit = !!project._dbId;

      // Simpan/update data proyek
      const dbData = isEdit
        ? await (async () => {
            const { data, error } = await supabase
              .from('projects')
              .update({
                title: project.name,
                description: project.desc,
                category: project.category,
                dusun_id: `d${project.dusun + 1}`,
                budget: project.anggaran,
                realized_budget: project.realisasi,
                progress: project.progress,
                status: project.status === 'Selesai' ? 'selesai' : project.status === 'Berjalan' ? 'sedang_berjalan' : 'direncanakan',
                start_date: project.date,
                contractor: project.bidang,
                lat: project.lat,
                lng: project.lng,
              })
              .eq('id', project._dbId)
              .select()
              .single();
            if (error) throw error;
            return data;
          })()
        : await (async () => {
            const id = `p${Date.now()}`;
            const { data, error } = await supabase
              .from('projects')
              .insert({
                id,
                title: project.name,
                description: project.desc,
                category: project.category,
                dusun_id: `d${project.dusun + 1}`,
                budget: project.anggaran,
                realized_budget: project.realisasi,
                progress: project.progress,
                status: project.status === 'Selesai' ? 'selesai' : project.status === 'Berjalan' ? 'sedang_berjalan' : 'direncanakan',
                start_date: project.date,
                contractor: project.bidang,
                lat: project.lat,
                lng: project.lng,
              })
              .select()
              .single();
            if (error) throw error;
            return data;
          })();

      // Hapus foto lama
      await supabase.from('project_photos').delete().eq('project_id', dbData.id);

      // Insert foto baru
      if (photos.length > 0) {
        const photoInserts = photos.map((url) => ({
          project_id: dbData.id,
          url,
        }));
        const { error: photoError } = await supabase
          .from('project_photos')
          .insert(photoInserts);
        if (photoError) throw photoError;
      }

      return dbData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project'] });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
