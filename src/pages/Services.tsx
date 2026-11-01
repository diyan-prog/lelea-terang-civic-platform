import { useState, useRef } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  HeartHandshake,
  IdCard,
  Plus,
  ShieldCheck,
  Store,
  Trash2,
  Upload,
  X,
  type LucideIcon,
  Home,
} from "lucide-react"
import { z } from "zod"
import {
  Button,
  Card,
  Container,
  Field,
  IconCircle,
  PageHeader,
  Select,
  ToastHost,
  cx,
  inputCls,
} from "../components/ui"
import { ServiceList } from "../components/ServiceList"
import { RequireRole } from "../components/Layout"
import { toast, useApp } from "../lib/store"
import { useAuth } from "../lib/auth"
import { useServiceRequests, useSubmitService, useUploadAttachment } from "../lib/api/layanan"
import { DUSUN } from "../lib/mock"

const pemohonSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  nik: z.string().length(16, "NIK harus 16 digit angka").regex(/^\d+$/, "NIK hanya boleh angka"),
  tempat_lahir: z.string().min(2, "Isi tempat lahir"),
  tanggal_lahir: z.string().min(1, "Isi tanggal lahir"),
  jenis_kelamin: z.string().min(1, "Pilih jenis kelamin"),
  agama: z.string().min(1, "Pilih agama"),
  pekerjaan: z.string().min(1, "Isi pekerjaan"),
  dusun: z.string().min(1, "Pilih dusun"),
  rt: z.string().min(1, "Isi RT"),
  rw: z.string().min(1, "Isi RW"),
  alamat: z.string().min(5, "Isi alamat lengkap"),
  no_hp: z.string().regex(/^0\d{9,12}$/, "No HP tidak valid (contoh: 0812xxxxxxxx)"),
})

const detailSchema = z.object({
  type: z.string().min(1, "Pilih jenis surat"),
  keperluan: z.string().min(5, "Isi keperluan minimal 5 karakter"),
  instansi_tujuan: z.string().optional(),
  tanggal_dibutuhkan: z.string().optional(),
  note: z.string().optional(),
  nama_usaha: z.string().optional(),
  jenis_usaha: z.string().optional(),
  alamat_usaha: z.string().optional(),
  nominal_penghasilan: z.string().optional(),
  sumber_penghasilan: z.string().optional(),
  nama_almarhum: z.string().optional(),
  tgl_meninggal: z.string().optional(),
  hubungan: z.string().optional(),
})

type Pemohon = Partial<z.infer<typeof pemohonSchema>> & { nama: string }
type Detail = Partial<z.infer<typeof detailSchema>> & { type: string; keperluan: string }

interface Lampiran {
  file: File
  name: string
  preview: string
}

type LampiranType = "ktp" | "kk" | "surat_rt" | "pendukung"

const LAMPIRAN_TYPES: { id: LampiranType; label: string; required: boolean; hint: string }[] = [
  { id: "ktp", label: "KTP Pemohon", required: true, hint: "JPG/PNG/PDF, maks 5 MB" },
  { id: "kk", label: "Kartu Keluarga (KK)", required: true, hint: "JPG/PNG/PDF, maks 5 MB" },
  { id: "surat_rt", label: "Pengantar RT/RW", required: false, hint: "JPG/PNG/PDF, maks 5 MB" },
  { id: "pendukung", label: "Dokumen Pendukung (opsional)", required: false, hint: "JPG/PNG/PDF, maks 5 MB" },
]

const JENIS_SURAT: { id: string; label: string; icon: LucideIcon; hint: string }[] = [
  { id: "domisili", label: "Surat Keterangan Domisili", icon: Home, hint: "Bukti alamat tinggal di desa" },
  { id: "usaha", label: "Surat Keterangan Usaha", icon: Store, hint: "Untuk keperluan usaha / izin usaha" },
  { id: "penghasilan", label: "Surat Keterangan Penghasilan", icon: FileText, hint: "Untuk bantuan sosial / sekolah" },
  { id: "belum_menikah", label: "Surat Keterangan Belum Menikah", icon: HeartHandshake, hint: "Untuk pengurusan dokumen" },
  { id: "kelakuan_baik", label: "Surat Keterangan Kelakuan Baik", icon: ShieldCheck, hint: "Untuk melamar kerja / sekolah" },
  { id: "kematian", label: "Surat Keterangan Kematian", icon: Clock, hint: "Untuk pengurusan akta kematian" },
  { id: "lainnya", label: "Surat Keterangan Lainnya", icon: IdCard, hint: "Keperluan lain yang tidak tercantum" },
]

function StepPemohon({
  data,
  onChange,
  errors,
}: {
  data: Pemohon
  onChange: (d: Partial<Pemohon>) => void
  errors: Partial<Record<string, string>>
}) {
  const { user: authUser } = useAuth()
  const app = useApp()
  const profile = authUser?.user_metadata

  const fill = () => {
    onChange({
      nama: profile?.full_name || authUser?.email?.split("@")[0] || app.user?.name || "",
      nik: profile?.nik || "",
      tempat_lahir: profile?.tempat_lahir || "",
      tanggal_lahir: profile?.tanggal_lahir || "",
      jenis_kelamin: profile?.jenis_kelamin || "",
      agama: profile?.agama || "",
      pekerjaan: profile?.pekerjaan || "",
      dusun: profile?.dusun_id || "",
      rt: profile?.rt || "",
      rw: profile?.rw || "",
      alamat: profile?.alamat || "",
      no_hp: profile?.phone || "",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy">Data Pemohon</h2>
        {profile?.full_name && (
          <button type="button" onClick={fill} className="text-xs font-bold text-teal hover:underline">
            Isi otomatis dari profil
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Lengkap *" error={errors.nama}>
          <input className={inputCls} value={data.nama} onChange={e => onChange({ nama: e.target.value })} placeholder="Sesuai KTP" />
        </Field>
        <Field label="NIK *" error={errors.nik}>
          <input className={inputCls} inputMode="numeric" value={data.nik} onChange={e => onChange({ nik: e.target.value.replace(/\D/g, "").slice(0, 16) })} placeholder="16 digit angka NIK" maxLength={16} />
        </Field>
        <Field label="Tempat Lahir *" error={errors.tempat_lahir}>
          <input className={inputCls} value={data.tempat_lahir} onChange={e => onChange({ tempat_lahir: e.target.value })} placeholder="Contoh: Indramayu" />
        </Field>
        <Field label="Tanggal Lahir *" error={errors.tanggal_lahir}>
          <input className={inputCls} type="date" value={data.tanggal_lahir} onChange={e => onChange({ tanggal_lahir: e.target.value })} />
        </Field>
        <Field label="Jenis Kelamin *" error={errors.jenis_kelamin}>
          <Select value={data.jenis_kelamin} onChange={e => onChange({ jenis_kelamin: e.target.value })}>
            <option value="">Pilih</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </Select>
        </Field>
        <Field label="Agama *" error={errors.agama}>
          <Select value={data.agama} onChange={e => onChange({ agama: e.target.value })}>
            <option value="">Pilih</option>
            {["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya"].map(a => <option key={a} value={a}>{a}</option>)}
          </Select>
        </Field>
        <Field label="Pekerjaan *" error={errors.pekerjaan}>
          <input className={inputCls} value={data.pekerjaan} onChange={e => onChange({ pekerjaan: e.target.value })} placeholder="Contoh: Petani, Pedagang, Guru" />
        </Field>
        <Field label="Dusun *" error={errors.dusun}>
          <Select value={data.dusun} onChange={e => onChange({ dusun: e.target.value })}>
            <option value="">Pilih dusun</option>
            {DUSUN.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </Select>
        </Field>
        <Field label="RT *" error={errors.rt}>
          <input className={inputCls} inputMode="numeric" value={data.rt} onChange={e => onChange({ rt: e.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="01" maxLength={3} />
        </Field>
        <Field label="RW *" error={errors.rw}>
          <input className={inputCls} inputMode="numeric" value={data.rw} onChange={e => onChange({ rw: e.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="01" maxLength={3} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Alamat Lengkap *" error={errors.alamat}>
            <textarea className={cx(inputCls, "py-2")} rows={2} value={data.alamat} onChange={e => onChange({ alamat: e.target.value })} placeholder="Jl. ..., Desa Lelea, Kec. Lelea, Kab. Indramayu" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="No. HP / WhatsApp *" error={errors.no_hp}>
            <input className={inputCls} inputMode="tel" value={data.no_hp} onChange={e => onChange({ no_hp: e.target.value.replace(/\D/g, "").slice(0, 13) })} placeholder="0812xxxxxxxx" maxLength={13} />
          </Field>
        </div>
      </div>
    </div>
  )
}

function StepDetail({
  data,
  onChange,
  errors,
}: {
  data: Detail
  onChange: (d: Partial<Detail>) => void
  errors: Partial<Record<string, string>>
}) {
  const isUsaha = data.type === "usaha"
  const isPenghasilan = data.type === "penghasilan"
  const isKematian = data.type === "kematian"

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-navy">Detail Surat</h2>

      <div>
        <p className="mb-2 text-sm font-semibold text-navy">Jenis Surat *</p>
        {errors.type && <p className="mb-2 text-xs text-bad font-semibold">{errors.type}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {JENIS_SURAT.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange({ type: s.id, nama_usaha: undefined, nominal_penghasilan: undefined, sumber_penghasilan: undefined, nama_almarhum: undefined, tgl_meninggal: undefined, hubungan: undefined })}
              aria-pressed={data.type === s.id}
              className={cx(
                "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition",
                data.type === s.id ? "border-teal bg-teal/5" : "border-line bg-white hover:border-teal/40"
              )}
            >
              <IconCircle icon={s.icon} size={36} />
              <div>
                <p className="text-sm font-bold text-navy">{s.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.hint}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Keperluan / Keterangan *" error={errors.keperluan}>
            <textarea className={cx(inputCls, "py-2")} rows={3} value={data.keperluan} onChange={e => onChange({ keperluan: e.target.value })} placeholder="Jelaskan keperluan pembuatan surat ini. Minimal 5 karakter." />
          </Field>
        </div>
        <Field label="Instansi Tujuan (opsional)" error={errors.instansi_tujuan}>
          <input className={inputCls} value={data.instansi_tujuan || ""} onChange={e => onChange({ instansi_tujuan: e.target.value })} placeholder="Contoh:SDN 1 Lelea, Bank BRI" />
        </Field>
        <Field label="Tanggal Dibutuhkan (opsional)" error={errors.tanggal_dibutuhkan}>
          <input className={inputCls} type="date" value={data.tanggal_dibutuhkan || ""} onChange={e => onChange({ tanggal_dibutuhkan: e.target.value })} min={new Date().toISOString().split("T")[0]} />
        </Field>

        {isUsaha && (
          <>
            <Field label="Nama Usaha" error={errors.nama_usaha}>
              <input className={inputCls} value={data.nama_usaha || ""} onChange={e => onChange({ nama_usaha: e.target.value })} placeholder="Contoh: Toko Serba Ada" />
            </Field>
            <Field label="Jenis Usaha" error={errors.jenis_usaha}>
              <input className={inputCls} value={data.jenis_usaha || ""} onChange={e => onChange({ jenis_usaha: e.target.value })} placeholder="Contoh: Perdagangan" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Alamat Usaha" error={errors.alamat_usaha}>
                <input className={inputCls} value={data.alamat_usaha || ""} onChange={e => onChange({ alamat_usaha: e.target.value })} placeholder="Lokasi usaha" />
              </Field>
            </div>
          </>
        )}

        {isPenghasilan && (
          <>
            <Field label="Nominal Penghasilan (Rp)" error={errors.nominal_penghasilan}>
              <input className={inputCls} inputMode="numeric" value={data.nominal_penghasilan || ""} onChange={e => onChange({ nominal_penghasilan: e.target.value.replace(/\D/g, "") })} placeholder="Contoh: 1500000" />
            </Field>
            <Field label="Sumber Penghasilan" error={errors.sumber_penghasilan}>
              <input className={inputCls} value={data.sumber_penghasilan || ""} onChange={e => onChange({ sumber_penghasilan: e.target.value })} placeholder="Contoh: Bertani, Nelayan" />
            </Field>
          </>
        )}

        {isKematian && (
          <>
            <Field label="Nama Almarhum/almarhumah" error={errors.nama_almarhum}>
              <input className={inputCls} value={data.nama_almarhum || ""} onChange={e => onChange({ nama_almarhum: e.target.value })} placeholder="Nama lengkap yang meninggal" />
            </Field>
            <Field label="Tanggal Meninggal" error={errors.tgl_meninggal}>
              <input className={inputCls} type="date" value={data.tgl_meninggal || ""} onChange={e => onChange({ tgl_meninggal: e.target.value })} />
            </Field>
            <Field label="Hubungan dengan Pemohon" error={errors.hubungan}>
              <input className={inputCls} value={data.hubungan || ""} onChange={e => onChange({ hubungan: e.target.value })} placeholder="Contoh: Orang tua, Suami, Anak" />
            </Field>
          </>
        )}

        <div className="sm:col-span-2">
          <Field label="Catatan (opsional)">
            <textarea className={cx(inputCls, "py-2")} rows={2} value={data.note || ""} onChange={e => onChange({ note: e.target.value })} placeholder="Informasi tambahan yang perlu diketahui petugas" />
          </Field>
        </div>
      </div>
    </div>
  )
}

function StepLampiran({
  attachments,
  onAdd,
  onRemove,
}: {
  attachments: Partial<Record<LampiranType, Lampiran>>
  onAdd: (type: LampiranType, file: File) => void
  onRemove: (type: LampiranType) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeType, setActiveType] = useState<LampiranType | null>(null)

  const handleFile = (type: LampiranType, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast("Ukuran file maksimal 5 MB", "err")
      return
    }
    const allowed = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowed.includes(file.type)) {
      toast("Format harus JPG, PNG, atau PDF", "err")
      return
    }
    onAdd(type, file)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-navy">Lampiran Dokumen</h2>
      <p className="text-sm text-slate-500">Unggah dokumen yang diperlukan. Format: JPG, PNG, atau PDF. Maksimal 5 MB per file.</p>

      <div className="space-y-3">
        {LAMPIRAN_TYPES.map(lt => {
          const att = attachments[lt.id]
          return (
            <div key={lt.id} className={cx(
              "rounded-xl border-2 border-dashed p-4 transition",
              att ? "border-teal bg-teal/5" : "border-line"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cx("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold", att ? "bg-teal text-white" : "bg-slate-200 text-slate-500")}>
                    {att ? "✓" : lt.required ? "!" : lt.id === "pendukung" ? "+" : lt.id === "surat_rt" ? "+" : lt.id === "ktp" ? "1" : lt.id === "kk" ? "2" : lt.id === "surat_rt" ? "3" : "?"}
                  </span>
                  <span className="text-sm font-semibold text-navy">
                    {lt.label}
                    {lt.required && <span className="text-bad ml-1">*</span>}
                  </span>
                </div>
                {att && (
                  <button
                    type="button"
                    onClick={() => onRemove(lt.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-bad/10 text-bad hover:bg-bad/20"
                    aria-label={`Hapus ${lt.label}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {att ? (
                <div className="flex items-center gap-3">
                  {att.preview && (
                    <img src={att.preview} alt={lt.label} className="h-16 w-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-navy truncate">{att.name}</p>
                    <p className="text-[10px] text-slate-400">{(att.file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pale text-teal">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">Klik untuk upload</p>
                    <p className="text-xs text-slate-400">{lt.hint}</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="sr-only"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) handleFile(lt.id, f)
                      e.target.value = ""
                    }}
                  />
                </label>
              )}

              {!att && lt.required && (
                <p className="mt-1 text-[11px] text-bad">Wajib diunggah</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepReview({
  pemohon,
  detail,
  attachments,
}: {
  pemohon: Pemohon
  detail: Detail
  attachments: Partial<Record<LampiranType, Lampiran>>
}) {
  const items: [string, string][] = [
    ["Nama", pemohon.nama || "-"],
    ["NIK", pemohon.nik ? `********${pemohon.nik.slice(-4)}` : "-"],
    ["Tempat / Tgl Lahir", pemohon.tempat_lahir ? `${pemohon.tempat_lahir}, ${pemohon.tanggal_lahir}` : "-"],
    ["Jenis Kelamin", pemohon.jenis_kelamin || "-"],
    ["Agama", pemohon.agama || "-"],
    ["Pekerjaan", pemohon.pekerjaan || "-"],
    ["Alamat", `${pemohon.alamat}, RT ${pemohon.rt}/RW ${pemohon.rw}, ${DUSUN[Number(pemohon.dusun)] || "-"}`],
    ["No. HP", pemohon.no_hp || "-"],
    ["Jenis Surat", JENIS_SURAT.find(s => s.id === detail.type)?.label || detail.type],
    ["Keperluan", detail.keperluan],
    ["Instansi", detail.instansi_tujuan || "-"],
    ["Tgl Dibutuhkan", detail.tanggal_dibutuhkan || "-"],
  ]
  if (detail.type === "usaha") {
    items.push(["Nama Usaha", detail.nama_usaha || "-"], ["Jenis Usaha", detail.jenis_usaha || "-"], ["Alamat Usaha", detail.alamat_usaha || "-"])
  }
  if (detail.type === "penghasilan") {
    items.push(["Nominal", detail.nominal_penghasilan ? `Rp ${Number(detail.nominal_penghasilan).toLocaleString("id-ID")}` : "-"], ["Sumber", detail.sumber_penghasilan || "-"])
  }
  if (detail.type === "kematian") {
    items.push(["Nama Almarhum", detail.nama_almarhum || "-"], ["Tgl Meninggal", detail.tgl_meninggal || "-"], ["Hubungan", detail.hubungan || "-"])
  }
  if (detail.note) items.push(["Catatan", detail.note])

  const lampiranList = LAMPIRAN_TYPES.map(lt => ({
    label: lt.label,
    done: !!attachments[lt.id],
    required: lt.required,
  }))

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-navy">Tinjau Pengajuan</h2>
      <p className="text-sm text-slate-500">Periksa kembali data sebelum diajukan. Data yang salah dapat memperlambat proses.</p>

      <Card className="!p-0">
        <div className="divide-y divide-line">
          {items.map(([k, v]) => (
            <div key={k} className="flex gap-3 px-4 py-3 text-sm">
              <span className="w-36 shrink-0 font-semibold text-navy">{k}</span>
              <span className="text-slate-600">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="rounded-xl border border-line p-4">
        <p className="mb-3 text-sm font-semibold text-navy">Lampiran</p>
        <div className="flex flex-wrap gap-2">
          {lampiranList.map(la => (
            <span key={la.label} className={cx("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", la.done ? "bg-ok/10 text-ok" : la.required ? "bg-bad/10 text-bad" : "bg-slate-100 text-slate-500")}>
              {la.done ? <CheckCircle2 size={12} /> : la.required ? "!" : "+"}
              {la.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function SuccessScreen({ ticket, onClose }: { ticket: string; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-12">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-ok/10">
        <CheckCircle2 size={48} className="text-ok" />
      </div>
      <h2 className="text-2xl font-extrabold text-navy">Pengajuan Terkirim!</h2>
      <p className="mt-2 text-slate-500">Pengajuan surat keterangan Anda telah kami terima.</p>
      <div className="mt-6 rounded-2xl bg-pale px-8 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nomor Tiket</p>
        <p className="mt-1 text-3xl font-extrabold text-teal">{ticket}</p>
        <p className="mt-2 text-xs text-slate-500">Simpan nomor tiket ini untuk melacak status pengajuan.</p>
      </div>
      <Button className="mt-6 w-full" onClick={onClose}>
        Lihat Daftar Pengajuan
      </Button>
      <Button variant="secondary" className="mt-3 w-full" onClick={() => window.location.href = '/'}>
        Kembali ke Beranda
      </Button>
    </div>
  )
}

function Inner() {
  const { user: authUser } = useAuth()
  const app = useApp()
  const user = authUser ? {
    name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Warga",
    email: authUser.email || "",
    role: authUser.user_metadata?.role || "warga",
  } : app.user

  const { data: remoteRequests = [] } = useServiceRequests(user?.email)
  const submitService = useSubmitService()
  const uploadAttachment = useUploadAttachment()

  const [step, setStep] = useState(0)
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null)

  const [pemohon, setPemohon] = useState<Pemohon>({ nama: "" })
  const [detail, setDetail] = useState<Detail>({ type: "", keperluan: "" })
  const [attachments, setAttachments] = useState<Partial<Record<LampiranType, Lampiran>>>({})
  const [confirmed, setConfirmed] = useState(false)
  const [pemohonErrors, setPemohonErrors] = useState<Partial<Record<string, string>>>({})
  const [detailErrors, setDetailErrors] = useState<Partial<Record<string, string>>>({})

  const STEPS = ["Data Pemohon", "Detail Surat", "Lampiran", "Tinjau & Kirim"]

  const next = () => setStep(s => Math.min(s + 1, 3))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const validateStep0 = () => {
    const r = pemohonSchema.safeParse(pemohon)
    if (!r.success) {
      const e: Partial<Record<string, string>> = {}
      r.error.errors.forEach(err => { e[err.path[0] as string] = err.message })
      setPemohonErrors(e)
      return false
    }
    setPemohonErrors({})
    return true
  }

  const validateStep1 = () => {
    const r = detailSchema.safeParse(detail)
    if (!r.success) {
      const e: Partial<Record<string, string>> = {}
      r.error.errors.forEach(err => { e[err.path[0] as string] = err.message })
      setDetailErrors(e)
      return false
    }
    setDetailErrors({})
    return true
  }

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return
    if (step === 1 && !validateStep1()) return
    if (step === 2) {
      const wajib = LAMPIRAN_TYPES.filter(l => l.required)
      const missing = wajib.filter(l => !attachments[l.id])
      if (missing.length > 0) {
        toast(`${missing.map(m => m.label).join(", ")} wajib diunggah`, "err")
        return
      }
    }
    next()
  }

  const handleSubmit = async () => {
    if (!confirmed) { toast("Centang 'Data sudah benar' untuk melanjutkan", "err"); return }
    if (!user) return

    const allData = {
      type: detail.type,
      email: user.email,
      name: pemohon.nama,
      purpose: detail.keperluan,
      note: detail.note,
      pemohon_data: pemohon,
      data: detail,
      instansi_tujuan: detail.instansi_tujuan,
      tanggal_dibutuhkan: detail.tanggal_dibutuhkan,
    }

    try {
      const s = await submitService.mutateAsync(allData)
      setSubmittedTicket(s.ticket)

      const userId = authUser?.id || "anon"
      for (const [, att] of Object.entries(attachments)) {
        if (att) {
          await uploadAttachment.mutateAsync({ requestId: s.id, file: att.file, name: att.name, userId })
        }
      }
      toast("Pengajuan terkirim!")
    } catch {
      toast("Gagal mengirim. Coba lagi.", "err")
    }
  }

  if (submittedTicket) {
    return (
      <Container className="py-8">
        <Card className="mx-auto max-w-lg">
          <SuccessScreen ticket={submittedTicket} onClose={() => { setSubmittedTicket(null); setStep(0) }} />
        </Card>
      </Container>
    )
  }

  return (
    <>
      <PageHeader
        title="Layanan Surat"
        sub="Ajukan surat dari rumah, lalu pantau statusnya sampai siap diambil."
      />
      <Container className="py-8 space-y-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div className={cx(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition",
                  i < step ? "bg-teal text-white" : i === step ? "bg-teal text-white ring-4 ring-teal/20" : "bg-slate-200 text-slate-500"
                )}>
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span className={cx("mt-1.5 text-[11px] font-semibold", i === step ? "text-teal" : "text-slate-400")}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={cx("mx-1 h-0.5 flex-1 transition", i < step ? "bg-teal" : "bg-slate-200")} />}
            </div>
          ))}
        </div>

        <Card className="mx-auto max-w-2xl">
          {step === 0 && <StepPemohon data={pemohon} onChange={d => setPemohon(p => ({ ...p, ...d }))} errors={pemohonErrors} />}
          {step === 1 && <StepDetail data={detail} onChange={d => setDetail(p => ({ ...p, ...d }))} errors={detailErrors} />}
          {step === 2 && <StepLampiran attachments={attachments} onAdd={(type, file) => setAttachments(a => ({ ...a, [type]: { file, name: file.name, preview: URL.createObjectURL(file) } }))} onRemove={type => setAttachments(a => { const next = { ...a }; delete next[type]; return next })} />}
          {step === 3 && <StepReview pemohon={pemohon} detail={detail} attachments={attachments} />}
        </Card>

        <div className="mx-auto flex max-w-2xl gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={back} className="flex-1">
              <ArrowLeft size={16} /> Kembali
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} className="flex-1">
              Lanjut <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!confirmed || submitService.isPending} className="flex-1">
              {submitService.isPending ? "Mengirim..." : "Ajukan Sekarang"}
            </Button>
          )}
        </div>

        {step === 3 && (
          <label className="mx-auto flex max-w-2xl items-center gap-2 text-sm font-semibold text-navy">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="h-5 w-5 accent-teal" />
            Data yang saya masukkan sudah benar dan sesuai.
          </label>
        )}
        
        <div>
          <h2 className="mb-4 text-2xl">Pengajuan Saya</h2>
          <ServiceList list={remoteRequests} />
        </div>
      </Container>
    </>
  )
}
export default function Services() {
  return (
    <RequireRole>
      <Inner />
    </RequireRole>
  )
}
