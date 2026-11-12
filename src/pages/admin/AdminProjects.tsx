import { useState } from "react"
import { ImagePlus, MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react"
import {
  Button,
  Field,
  MapView,
  Modal,
  ProgressBar,
  Select,
  SlideOver,
  StatusBadge,
  cx,
  inputCls,
} from "../../components/ui"
import { toast } from "../../lib/store"
import { BIDANG, CATEGORIES, CENTER, DUSUN_SHORT } from "../../lib/mock"
import { rp } from "../../lib/format"
import { AdminTitle, TableWrap, thCls } from "./AdminReports"
import { useProjects, useSaveProject, useDeleteProject } from "../../lib/api/kegiatan"
import { useMemo } from "react"
import { supabase } from "../../lib/supabase"

export default function AdminProjects() {
  const { data: dbProjects = [] } = useProjects()
  const projects = useMemo(() => dbProjects, [dbProjects])
  const saveProject = useSaveProject()
  const deleteProject = useDeleteProject()
  const [q, setQ] = useState("")
  const [fs, setFs] = useState("")
  const [fd, setFd] = useState("")
  const [form, setForm] = useState<any | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [dbPhotos, setDbPhotos] = useState<string[]>([])
  const [del, setDel] = useState<any | null>(null)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const list = projects.filter(
    (p) =>
      (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
      (!fs || p.status === fs) &&
      (!fd || String(p.dusun) === fd),
  )

  const set = (p: Partial<any>) => setForm({ ...form!, ...p })

  const handleOpenForm = (p?: any) => {
    if (p) {
      setForm({ ...p, _dbId: p.id })
      setDbPhotos(p.photos || [])
      setPhotos([])
    } else {
      setForm({
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        desc: "",
        bidang: BIDANG[0],
        category: "jalan",
        dusun: 0,
        anggaran: 0,
        realized: 0,
        progress: 0,
        status: "Direncanakan",
        date: new Date().toISOString().slice(0, 10),
        lat: CENTER.lat,
        lng: CENTER.lng,
      })
      setDbPhotos([])
      setPhotos([])
    }
    setErrs({})
  }

  const uploadPhotos = async (files: File[]): Promise<string[]> => {
    const urls: string[] = []
    for (const file of files) {
      const fileName = `projects/${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from('laporan')
        .upload(fileName, file, { upsert: false })
      if (error) throw error
      const { data: urlData } = supabase.storage
        .from('laporan')
        .getPublicUrl(fileName)
      urls.push(urlData.publicUrl)
    }
    return urls
  }

  const save = async () => {
    const e: Record<string, string> = {}
    if (!form?.name?.trim() || form.name.trim().length < 5)
      e.name = "Nama kegiatan minimal 5 karakter"
    if (!form?.anggaran || form.anggaran <= 0)
      e.anggaran = "Isi anggaran lebih dari 0"
    setErrs(e)
    if (Object.keys(e).length) return
    setSaving(true)
    try {
      const newPhotoFiles = photos.filter((p) => p.startsWith('data:'))
      const newPhotoUrls = await uploadPhotos(
        newPhotoFiles.map((p) => {
          const parts = p.split(',')
          const meta = parts[0].split(';')[0].split(':')[1]
          const bin = atob(parts[1])
          const arr = new Uint8Array(bin.length)
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
          return new File([arr], 'photo.jpg', { type: meta })
        }),
      )
      const allPhotos = [...dbPhotos, ...newPhotoUrls]
      await saveProject.mutateAsync({ project: form, photos: allPhotos })
      toast(form._dbId ? "Kegiatan diperbarui" : "Kegiatan ditambahkan")
      setForm(null)
    } catch (err: any) {
      toast("Gagal menyimpan: " + (err.message || err), "err")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(del._dbId || del.id)
      toast("Kegiatan dihapus")
      setDel(null)
    } catch (err: any) {
      toast("Gagal menghapus: " + (err.message || err), "err")
    }
  }

  const removePhoto = (index: number, fromDb: boolean) => {
    if (fromDb) {
      setDbPhotos((x) => x.filter((_, i) => i !== index))
    } else {
      setPhotos((x) => x.filter((_, i) => i !== index))
    }
  }

  const pctReal =
    form && form.anggaran
      ? Math.round((form.realisasi / form.anggaran) * 100)
      : 0

  return (
    <>
      <AdminTitle
        title="Kegiatan Pembangunan"
        sub="Kelola data kegiatan yang tampil di halaman publik."
      >
        <Button onClick={() => handleOpenForm()}>
          <Plus size={18} />
          Tambah Kegiatan
        </Button>
      </AdminTitle>
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Cari"
            className={cx(inputCls, "pl-10")}
            placeholder="Cari kegiatan"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select aria-label="Status" value={fs} onChange={(e) => setFs(e.target.value)}>
          <option value="">Semua status</option>
          <option>Direncanakan</option>
          <option>Berjalan</option>
          <option>Selesai</option>
        </Select>
        <Select aria-label="Dusun" value={fd} onChange={(e) => setFd(e.target.value)}>
          <option value="">Semua dusun</option>
          {DUSUN_SHORT.map((d, i) => (
            <option key={d} value={String(i)}>{d}</option>
          ))}
        </Select>
      </div>
      <TableWrap>
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr>
              {["Kegiatan", "Dusun", "Anggaran", "Progres", "Status", ""].map((h) => (
                <th key={h} className={thCls}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-3 py-3 font-semibold text-navy">
                  {p.name}
                  <div className="text-xs font-normal text-slate-500">{p.bidang}</div>
                  {p.photos && p.photos.length > 0 && (
                    <div className="mt-1 flex gap-1">
                      {p.photos.map((url: string, i: number) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">{DUSUN_SHORT[p.dusun]}</td>
                <td className="whitespace-nowrap px-3 py-3">{rp(p.anggaran)}</td>
                <td className="w-40 px-3 py-3"><ProgressBar value={p.progress} /></td>
                <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                <td className="whitespace-nowrap px-3 py-3 text-right">
                  <button aria-label="Ubah" className="rounded-lg p-2 text-teal hover:bg-pale" onClick={() => handleOpenForm(p)}>
                    <Pencil size={18} />
                  </button>
                  <button aria-label="Hapus" className="rounded-lg p-2 text-bad hover:bg-bad/10" onClick={() => setDel(p)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center">Tidak ada kegiatan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </TableWrap>

      <Modal open={!!del} onClose={() => setDel(null)} title="Hapus kegiatan?">
        <p>Kegiatan "{del?.name}" akan dihapus dari halaman publik.</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDel(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>

      <SlideOver
        open={!!form}
        onClose={() => setForm(null)}
        title={form?._dbId ? "Ubah Kegiatan" : "Tambah Kegiatan"}
        footer={
          <>
            <Button className="flex-1" onClick={save} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button variant="ghost" onClick={() => setForm(null)}>Batal</Button>
          </>
        }
      >
        {form && (
          <>
            <Field label="Nama kegiatan" error={errs.name}>
              <input className={inputCls} value={form.name} onChange={(e) => set({ name: e.target.value })} />
            </Field>
            <Field label="Deskripsi">
              <textarea rows={3} className={cx(inputCls, "py-2")} value={form.desc || ""} onChange={(e) => set({ desc: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bidang">
                <Select value={form.bidang} onChange={(e) => set({ bidang: e.target.value })}>
                  {BIDANG.map((b) => <option key={b}>{b}</option>)}
                </Select>
              </Field>
              <Field label="Kategori terkait">
                <Select value={form.category} onChange={(e) => set({ category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </Select>
              </Field>
              <Field label="Dusun">
                <Select value={form.dusun} onChange={(e) => set({ dusun: +e.target.value })}>
                  {DUSUN_SHORT.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => set({ status: e.target.value })}>
                  <option>Direncanakan</option>
                  <option>Berjalan</option>
                  <option>Selesai</option>
                </Select>
              </Field>
              <Field label="Anggaran (Rp)" error={errs.anggaran}>
                <input type="number" min={0} className={inputCls} value={form.anggaran || ""} onChange={(e) => set({ anggaran: +e.target.value })} />
              </Field>
              <Field label="Tanggal mulai">
                <input type="date" className={inputCls} value={form.date || ""} onChange={(e) => set({ date: e.target.value })} />
              </Field>
            </div>
            <Field label={`Realisasi anggaran: ${rp(form.realisasi)} (${pctReal}%)`}>
              <input type="range" min={0} max={100} value={pctReal} onChange={(e) => set({ realized: Math.round(form.anggaran * (+e.target.value / 100)) })} className="h-11 w-full accent-teal" />
            </Field>
            <Field label={`Progres fisik: ${form.progress}%`}>
              <input type="range" min={0} max={100} step={5} value={form.progress} onChange={(e) => set({ progress: +e.target.value })} className="h-11 w-full accent-teal" />
            </Field>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-bold text-navy">Lokasi (geser pin)</span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => set({ lat: position.coords.latitude, lng: position.coords.longitude }),
                        (error) => toast("Gagal lokasi: " + error.message, "err"),
                      )
                    }
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-teal hover:underline"
                >
                  <MapPin size={14} /> Gunakan Lokasi Terkini
                </button>
              </div>
              <MapView height={200} drag={{ lat: form.lat, lng: form.lng, onChange: (lat, lng) => set({ lat, lng }) }} />
            </div>
            <div>
              <div className="mb-1.5 text-sm font-bold text-navy">Foto progres</div>
              <div className="flex flex-wrap gap-2">
                {dbPhotos.map((url, i) => (
                  <div key={`db-${i}`} className="relative group">
                    <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                    <button
                      onClick={() => removePhoto(i, true)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-bad text-white opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photos.map((url, i) => (
                  <div key={`new-${i}`} className="relative group">
                    <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                    <button
                      onClick={() => removePhoto(i, false)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-bad text-white opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-teal text-xs font-bold text-teal hover:bg-pale">
                  <ImagePlus />
                  Unggah
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      files.forEach((f) => {
                        const rd = new FileReader()
                        rd.onload = () => setPhotos((x) => [...x, rd.result as string])
                        rd.readAsDataURL(f)
                      })
                    }}
                  />
                </label>
              </div>
            </div>
          </>
        )}
      </SlideOver>
    </>
  )
}
