import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Database } from '../../types/database';

export type ServiceRequest = Database['public']['Tables']['service_requests']['Row'];
export type ServiceAttachment = Database['public']['Tables']['service_attachments']['Row'];

export const useServiceRequests = (email?: string) =>
  useQuery({
    queryKey: ['services', email],
    queryFn: async () => {
      let query = supabase
        .from('service_requests')
        .select('*, updates:service_updates(*), attachments:service_attachments(*)')
        .order('created_at', { ascending: false });
      if (email) query = query.eq('email', email);
      const { data, error } = await query;
      if (error) throw error;
      return (data as ServiceRequest[]) || [];
    },
  });

export const useSubmitService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      type: string;
      email: string;
      name: string;
      purpose: string;
      note?: string;
      pemohon_data: Record<string, unknown>;
      data: Record<string, unknown>;
      instansi_tujuan?: string;
      tanggal_dibutuhkan?: string;
    }) => {
      const ticket = `LS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          ticket,
          type: payload.type,
          email: payload.email,
          name: payload.name,
          purpose: payload.purpose,
          note: payload.note ?? null,
          status: 'Diajukan',
          pemohon_data: payload.pemohon_data,
          data: payload.data,
          instansi_tujuan: payload.instansi_tujuan ?? null,
          tanggal_dibutuhkan: payload.tanggal_dibutuhkan ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from('service_updates').insert({
        request_id: data.id,
        status: 'Diajukan',
        note: 'Pengajuan surat berhasil diterima.',
      });
      return data as ServiceRequest;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); },
  });
};

export const useUploadAttachment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      file,
      name,
      userId,
    }: {
      requestId: string;
      file: File;
      name: string;
      userId: string;
    }): Promise<ServiceAttachment> => {
      // Kompres gambar sebelum upload
      const processedFile = await compressImage(file);
      const ext = processedFile.name.split('.').pop() || 'jpg';
      const path = `${userId}/${requestId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('service-docs')
        .upload(path, processedFile, { upsert: false });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('service_attachments')
        .insert({ request_id: requestId, name, path })
        .select()
        .single();
      if (error) throw error;
      return data as ServiceAttachment;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); },
  });
};

export const useAttachmentUrl = (path: string | null) =>
  useQuery({
    queryKey: ['attachment-url', path],
    queryFn: async () => {
      if (!path) return null;
      const { data, error } = await supabase.storage
        .from('service-docs')
        .createSignedUrl(path, 60);
      if (error) return null;
      return data.signedUrl;
    },
    enabled: !!path,
  });

export const useUpdateServiceStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      note,
    }: {
      requestId: string;
      status: string;
      note: string;
    }) => {
      const { error } = await supabase
        .from('service_updates')
        .insert({ request_id: requestId, status, note });
      if (error) throw error;
      const { error: updateError } = await supabase
        .from('service_requests')
        .update({ status })
        .eq('id', requestId);
      if (updateError) throw updateError;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); },
  });
};

// Fungsi kompres gambar dengan canvas
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX_W = 1200;
      const scale = Math.min(1, MAX_W / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name, { type: file.type }));
        },
        file.type,
        0.8
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}
