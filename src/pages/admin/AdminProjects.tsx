import { useState } from "react"
import { ImagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react"
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
import { actions, toast, useApp } from "../../lib/store"
import {
  BIDANG,
  CATEGORIES,
  CENTER,
  DUSUN_SHORT,
  type Project,
} from "../../lib/mock"
import { rp } from "../../lib/format"
import { AdminTitle, TableWrap, thCls } from "./AdminReports"

const blank = (id: number): Project => ({
  id,
  name: "",
  desc: "",
  bidang: BIDANG[1],
  category: "jalan",
  dusun: 0,
  anggaran: 0,
  realisasi: 0,
  progress: 0,
  status: "Direncanakan",
  date: new Date().toISOString().slice(0, 10),
  lat: CENTER.lat,
  lng: CENTER.lng,
})

export default function AdminProjects() {
  const { projects } = useApp()
  const [q, setQ] = useState("")
  const [fs, setFs] = useState("")
  const [fd, setFd] = useState("")
  const [form, setForm] = useState<Project | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [del, setDel] = useState<Project | null>(null)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const list = projects.filter(
    (p) =>
      (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
      (!fs || p.status === fs) &&
      (!fd || p.dusun === +fd),
  )
  const set = (p: Partial<Project>) => setForm({ ...form!, ...p })
  const save = () => {
    const e: Record<string, string> = {}
    if (form!.name.trim().length < 5)
      e.name = "Nama kegiatan minimal 5 karakter"
    if (form!.anggaran <= 0) e.anggaran = "Isi anggaran lebih dari 0"
    setErrs(e)
    if (Object.keys(e).length) return
    const exists = projects.some((p) => p.id === form!.id)
    actions.saveProject(form!)
    toast(exists ? "Kegiatan diperbarui" : "Kegiatan ditambahkan")
    setForm(null)
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
        <Button
          onClick={() => {
            setForm(blank(Math.max(0, ...projects.map((p) => p.id)) + 1))
            setPhotos([])
            setErrs({})
          }}
        >
          <Plus size={18} />
          Tambah Kegiatan
        </Button>
      </AdminTitle>
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            aria-label="Cari"
            className={cx(inputCls, "pl-10")}
            placeholder="Cari kegiatan"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select
          aria-label="Status"
          value={fs}
          onChange={(e) => setFs(e.target.value)}
        >
          <option value="">Semua status</option>
          <option>Direncanakan</option>
          <option>Berjalan</option>
          <option>Selesai</option>
        </Select>
        <Select
          aria-label="Dusun"
          value={fd}
          onChange={(e) => setFd(e.target.value)}
        >
          <option value="">Semua dusun</option>
          {DUSUN_SHORT.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </Select>
      </div>
      <TableWrap>
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr>
              {["Kegiatan", "Dusun", "Anggaran", "Progres", "Status", ""].map(
                (h) => (
                  <th key={h} className={thCls}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-3 py-3 font-semibold text-navy">
                  {p.name}
                  <div className="text-xs font-normal text-slate-500">
                    {p.bidang}
                  </div>
                </td>
                <td className="px-3 py-3">{DUSUN_SHORT[p.dusun]}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  {rp(p.anggaran)}
                </td>
                <td className="w-40 px-3 py-3">
                  <ProgressBar value={p.progress} />
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right">
                  <button
                    aria-label="Ubah"
                    className="rounded-lg p-2 text-teal hover:bg-pale"
                    onClick={() => {
                      setForm(p)
                      setPhotos([])
                      setErrs({})
                    }}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    aria-label="Hapus"
                    className="rounded-lg p-2 text-bad hover:bg-bad/10"
                    onClick={() => setDel(p)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  Tidak ada kegiatan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableWrap>
      <Modal open={!!del} onClose={() => setDel(null)} title="Hapus kegiatan?">
        <p>Kegiatan “{del?.name}” akan dihapus dari halaman publik.</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDel(null)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              actions.deleteProject(del!.id)
              toast("Kegiatan dihapus")
              setDel(null)
            }}
          >
            Hapus
          </Button>
        </div>
      </Modal>
      <SlideOver
        open={!!form}
        onClose={() => setForm(null)}
        title={
          projects.some((p) => p.id === form?.id)
            ? "Ubah Kegiatan"
            : "Tambah Kegiatan"
        }
        footer={
          <>
            <Button className="flex-1" onClick={save}>
              Simpan
            </Button>
            <Button variant="ghost" onClick={() => setForm(null)}>
              Batal
            </Button>
          </>
        }
      >
        {form && (
          <>
            <Field label="Nama kegiatan" error={errs.name}>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
              />
            </Field>
            <Field label="Deskripsi">
              <textarea
                rows={3}
                className={cx(inputCls, "py-2")}
                value={form.desc}
                onChange={(e) => set({ desc: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bidang">
                <Select
                  value={form.bidang}
                  onChange={(e) => set({ bidang: e.target.value })}
                >
                  {BIDANG.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Kategori terkait laporan">
                <Select
                  value={form.category}
                  onChange={(e) =>
                    set({ category: e.target.value as Project["category"] })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Dusun">
                <Select
                  value={form.dusun}
                  onChange={(e) => set({ dusun: +e.target.value })}
                >
                  {DUSUN_SHORT.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(e) =>
                    set({ status: e.target.value as Project["status"] })
                  }
                >
                  <option>Direncanakan</option>
                  <option>Berjalan</option>
                  <option>Selesai</option>
                </Select>
              </Field>
              <Field label="Anggaran (Rp)" error={errs.anggaran}>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.anggaran || ""}
                  onChange={(e) => set({ anggaran: +e.target.value })}
                />
              </Field>
              <Field label="Tanggal mulai">
                <input
                  type="date"
                  className={inputCls}
                  value={form.date}
                  onChange={(e) => set({ date: e.target.value })}
                />
              </Field>
            </div>
            <Field
              label={`Realisasi anggaran: ${rp(form.realisasi)} (${pctReal}%)`}
            >
              <input
                type="range"
                min={0}
                max={100}
                value={pctReal}
                onChange={(e) =>
                  set({
                    realisasi: Math.round(
                      form.anggaran * (+e.target.value / 100),
                    ),
                  })
                }
                className="h-11 w-full accent-teal"
              />
            </Field>
            <Field label={`Progres fisik: ${form.progress}%`}>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.progress}
                onChange={(e) => set({ progress: +e.target.value })}
                className="h-11 w-full accent-teal"
              />
            </Field>
            <div>
              <div className="mb-1.5 text-sm font-bold text-navy">
                Lokasi (geser pin)
              </div>
              <MapView
                height={200}
                drag={{
                  lat: form.lat,
                  lng: form.lng,
                  onChange: (lat, lng) => set({ lat, lng }),
                }}
              />
            </div>
            <div>
              <div className="mb-1.5 text-sm font-bold text-navy">
                Foto progres
              </div>
              <div className="flex flex-wrap gap-3">
                {photos.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt={`Foto progres ${i + 1}`}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                ))}
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-teal text-xs font-bold text-teal hover:bg-pale">
                  <ImagePlus />
                  Unggah
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) {
                        const rd = new FileReader()
                        rd.onload = () =>
                          setPhotos((x) => [...x, rd.result as string])
                        rd.readAsDataURL(f)
                      }
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
