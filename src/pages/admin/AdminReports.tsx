import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  Inbox,
  Loader,
  ShieldCheck,
} from "lucide-react"
import {
  Button,
  Chip,
  Field,
  MapView,
  SLAIndicator,
  Select,
  SlideOver,
  StatCard,
  StatusBadge,
  Thumb,
  Timeline,
  LateBadge,
  cx,
  inputCls,
  reportTimeline,
} from "../../components/ui"
import { toast, useApp, actions } from "../../lib/store"
import { DUSUN_SHORT, catLabel, type RStatus } from "../../lib/mock"
import { useAuth } from "../../lib/auth"
import { useAdminReports, useUpdateReportStatus, type Report } from "../../lib/api/laporan"

const isLate = (r: Report) => 
  !['Selesai', 'Ditolak'].includes(r.status) && r.sla_selesai_due ? new Date() > new Date(r.sla_selesai_due) : false;
const priorityOf = (r: Report) =>
  r.category === "dugaan_penyimpangan" || r.mismatch_flag || (r.confirmation_count ?? 0) >= 3
    ? "Tinggi"
    : "Normal"

const toUiReport = (r: Report): any => ({
  ticket: r.ticket,
  title: r.title,
  desc: r.description,
  category: r.category,
  dusun: r.dusun_id ? r.dusun_id - 1 : 0,
  rw: r.rw,
  status: r.status,
  createdAt: r.created_at,
  confirmations: r.confirmation_count ?? 0,
  anonymous: r.anonymous ?? false,
  reporter: r.anonymous ? "Anonim" : "Warga",
  lat: r.lat,
  lng: r.lng,
  photos: (r as any).photos?.map((p: any) => p.url) ?? [],
  updates: (r as any).updates ?? [],
  mismatch: r.mismatch_flag,
  slaDays: 3,
})

export const AdminTitle = ({
  title,
  sub,
  children,
}: {
  title: string
  sub?: string
  children?: React.ReactNode
}) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal text-white shadow-soft">
        <ShieldCheck size={26} />
      </div>
      <div>
        <h1 className="text-[28px] font-bold text-navy">{title}</h1>
        {sub && <p className="text-sm text-slate-500">{sub}</p>}
      </div>
    </div>
    {children}
  </div>
)
export const TableWrap = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto rounded-card border border-line bg-white shadow-soft">
    {children}
  </div>
)
export const thCls =
  "bg-pale/70 px-3 py-3 text-left text-sm font-bold text-navy"

export default function AdminReports() {
  const { user } = useAuth()
  const { data: reports = [], isLoading } = useAdminReports()
  const updateStatus = useUpdateReportStatus()

  const [chip, setChip] = useState("Semua")
  const [sel, setSel] = useState<string | null>(null)
  const [status, setStatus] = useState<RStatus>("Diterima")
  const [note, setNote] = useState("")
  const [photo, setPhoto] = useState<string>()
  const [err, setErr] = useState("")
  
  const uiReports = reports.map(toUiReport)
  const r = reports.find((x: any) => x.ticket === sel) as any
  const uiR = r ? toUiReport(r) : null
  const month = new Date().getMonth()
  const list = uiReports.filter(
    (x: any) =>
      chip === "Semua" ||
      (chip === "Terlambat"
        ? isLate(x)
        : chip === "Prioritas Tinggi"
          ? priorityOf(x) === "Tinggi"
          : x.status === chip),
  )
  const open = (t: string) => {
    const x = reports.find((y) => y.ticket === t)!
    setSel(t)
    setStatus(x.status as RStatus)
    setNote("")
    setPhoto(undefined)
    setErr("")
  }
  const save = async () => {
    if (!r || !user) return
    if (!note.trim())
      return setErr(
        status === "Ditolak"
          ? "Alasan penolakan wajib diisi"
          : "Catatan wajib diisi agar warga tahu perkembangannya",
      )
    try {
      await updateStatus.mutateAsync({
        reportId: r.id,
        status,
        note: note.trim(),
        staffId: user.id
      })
      toast(`Laporan ${r.ticket} diperbarui`)
      setSel(null)
    } catch {
      toast("Gagal memperbarui status laporan", "err")
    }
  }

  return (
    <>
      <AdminTitle
        title="Antrean Laporan"
        sub="Tanggapi laporan warga sebelum batas waktu berakhir."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Inbox}
          value={uiReports.filter((x) => x.status === "Diterima").length}
          label="Baru"
          tone="teal"
        />
        <StatCard
          icon={Loader}
          value={uiReports.filter((x) => x.status === "Diproses").length}
          label="Diproses"
          tone="yellow"
        />
        <StatCard
          icon={AlertTriangle}
          value={
            <span className="text-bad">{uiReports.filter(isLate).length}</span>
          }
          label="Terlambat"
          tone="red"
        />
        <StatCard
          icon={CheckCircle2}
          value={
            uiReports.filter(
              (x) =>
                x.status === "Selesai" &&
                x.updates.length > 0 &&
                new Date(x.updates.at(-1)!.at).getMonth() === month,
            ).length
          }
          label="Selesai bulan ini"
          tone="green"
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          "Semua",
          "Diterima",
          "Diverifikasi",
          "Diproses",
          "Selesai",
          "Ditolak",
          "Terlambat",
          "Prioritas Tinggi",
        ].map((c) => (
          <Chip key={c} active={chip === c} onClick={() => setChip(c)}>
            {c}
          </Chip>
        ))}
      </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {[
                  "Tiket",
                  "Judul",
                  "Dusun",
                  "Prioritas",
                  "SLA",
                  "Status",
                  "Aksi",
                ].map((h) => (
                  <th key={h} className={thCls}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((x) => (
                <tr
                  key={x.ticket}
                  className="border-t border-line hover:bg-pale/30"
                >
                  <td className="whitespace-nowrap px-3 py-3 font-bold text-navy">
                    {x.ticket}
                  </td>
                  <td className="max-w-[260px] px-3 py-3">
                    {x.title}
                    <div className="text-xs text-slate-500">
                      {catLabel(x.category)}
                    </div>
                  </td>
                  <td className="px-3 py-3">{DUSUN_SHORT[x.dusun]}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={priorityOf(x)} />
                  </td>
                  <td className="px-3 py-3">
                    <SLAIndicator report={x} compact />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge status={x.status} />
                      <LateBadge r={x} />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Button
                      variant="secondary"
                      className="!min-h-9 !px-3"
                      onClick={() => open(x.ticket)}
                    >
                      Tangani
                    </Button>
                  </td>
                </tr>
              ))}
              {!list.length && (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    Tidak ada laporan pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      <SlideOver
        open={!!uiR}
        onClose={() => setSel(null)}
        title={uiR ? uiR.ticket : ""}
        footer={
          uiR && (
            <>
              <Button className="flex-1" onClick={save}>
                Simpan perubahan
              </Button>
              <Button variant="ghost" onClick={() => setSel(null)}>
                Batal
              </Button>
            </>
          )
        }
      >
        {uiR && (
          <>
            <div>
              <h3 className="text-xl">{uiR.title}</h3>
              <p className="mt-1 text-sm">
                {catLabel(uiR.category)} • {DUSUN_SHORT[uiR.dusun]}, RW {uiR.rw} •
                Pelapor: {uiR.reporter}
              </p>
              <p className="mt-2">{uiR.desc}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(uiR.photos.length ? uiR.photos : [undefined]).map((p: any, i: number) => (
                <Thumb
                  key={i}
                  category={uiR.category}
                  src={p}
                  className="h-28 w-full rounded-xl"
                />
              ))}
            </div>
            <MapView
              height={160}
              pins={[
                {
                  id: 1,
                  lat: uiR.lat,
                  lng: uiR.lng,
                  label: uiR.title,
                  color: "#D64545",
                },
              ]}
            />
            <SLAIndicator report={uiR} />
            <Timeline items={reportTimeline(uiR)} />
            <hr className="border-line" />
            <Field label="Ubah status">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as RStatus)}
              >
                {[
                  "Diterima",
                  "Diverifikasi",
                  "Diproses",
                  "Selesai",
                  "Ditolak",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field
              label={
                status === "Ditolak"
                  ? "Alasan penolakan (wajib)"
                  : "Catatan untuk warga (wajib)"
              }
              error={err}
            >
              <textarea
                rows={3}
                className={cx(inputCls, "py-2")}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value)
                  setErr("")
                }}
              />
            </Field>
            <div>
              <div className="mb-1.5 text-sm font-bold text-navy">
                Foto bukti
              </div>
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-teal px-4 font-bold text-teal hover:bg-pale">
                <ImagePlus size={18} />
                Unggah foto bukti
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      const rd = new FileReader()
                      rd.onload = () => setPhoto(rd.result as string)
                      rd.readAsDataURL(f)
                    }
                  }}
                />
              </label>
              {photo && (
                <img
                  src={photo}
                  alt="Pratinjau foto bukti"
                  className="mt-3 h-24 rounded-xl"
                />
              )}
            </div>
          </>
        )}
      </SlideOver>
    </>
  )
}
