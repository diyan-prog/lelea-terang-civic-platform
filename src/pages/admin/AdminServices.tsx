import { useState } from "react"
import { CheckCircle2, FileText, Inbox, Loader, Download, ExternalLink, Printer } from "lucide-react"
import {
  Button,
  Card,
  Field,
  Select,
  SlideOver,
  StatCard,
  StatusBadge,
  Timeline,
  cx,
  inputCls,
} from "../../components/ui"
import { svcName } from "../../components/ServiceList"
import { toast } from "../../lib/store"
import { useServiceRequests, useUpdateServiceStatus, useAttachmentUrl, type ServiceRequest, type ServiceAttachment } from "../../lib/api/layanan"
import { fmtDate } from "../../lib/format"
import { AdminTitle, TableWrap, thCls } from "./AdminReports"

function AttachmentViewer({ att }: { att: ServiceAttachment }) {
  const { data: url } = useAttachmentUrl(att.path)
  if (!url) return <span className="text-xs text-slate-400">Memuat...</span>
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal hover:underline">
      <ExternalLink size={13} /> {att.name}
    </a>
  )
}

export default function AdminServices() {
  const { data: services = [], isLoading } = useServiceRequests()
  const updateStatus = useUpdateServiceStatus()

  const [sel, setSel] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Diajukan")
  const [note, setNote] = useState("")
  const [err, setErr] = useState("")

  const s = services.find((x) => x.ticket === sel)

  const open = (t: string) => {
    const x = services.find((y) => y.ticket === t)!
    setSel(t)
    setStatus(x.status)
    setNote("")
    setErr("")
  }

  const apply = async (st: string, defNote?: string) => {
    const n = note.trim() || defNote || ""
    if (!n) {
      return setErr(st === "Ditolak" ? "Alasan penolakan wajib diisi" : "Catatan wajib diisi")
    }
    try {
      await updateStatus.mutateAsync({ requestId: s!.id, status: st, note: n })
      toast(`${s!.ticket}: ${st}`)
      setSel(null)
    } catch {
      toast("Gagal memperbarui status", "err")
    }
  }

  const printDraft = (req: ServiceRequest) => {
    const p = (req.pemohon_data || {}) as Record<string, string>
    const d = (req.data || {}) as Record<string, string>
    const w = window.open("", "_blank")
    if (!w) return
    w.document.write(`
      <html>
        <head>
          <title>Draf Surat - ${req.ticket}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #000; }
            .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 30px; }
            .title { font-weight: bold; font-size: 16pt; text-transform: uppercase; margin-top: 10px; }
            .content { margin-top: 20px; }
            .table { width: 100%; margin-top: 15px; border-collapse: collapse; }
            .table td { padding: 5px 0; vertical-align: top; }
            .sign { margin-top: 50px; float: right; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>PEMERINTAH KABUPATEN INDRAMAYU</h3>
            <h3>KECAMATAN LELEA — DESA LELEA</h3>
            <p>Jl. Raya Lelea No. 1, Desa Lelea, Kode Pos 45261</p>
            <div class="title">SURAT KETERANGAN ${svcName(req.type).toUpperCase()}</div>
            <p>Nomor: ${req.ticket}/DS-LL/II/2026</p>
          </div>
          <div class="content">
            <p>Yang bertanda tangan di bawah ini Kepala Desa Lelea, Kecamatan Lelea, Kabupaten Indramayu, menerangkan bahwa:</p>
            <table class="table">
              <tr><td style="width: 200px;">Nama Lengkap</td><td>: <b>${p.nama || req.name}</b></td></tr>
              <tr><td>NIK</td><td>: ${p.nik || "-"}</td></tr>
              <tr><td>Tempat/Tgl Lahir</td><td>: ${p.tempat_lahir || "-"}, ${p.tanggal_lahir || "-"}</td></tr>
              <tr><td>Jenis Kelamin</td><td>: ${p.jenis_kelamin || "-"}</td></tr>
              <tr><td>Agama</td><td>: ${p.agama || "-"}</td></tr>
              <tr><td>Pekerjaan</td><td>: ${p.pekerjaan || "-"}</td></tr>
              <tr><td>Alamat</td><td>: ${p.alamat || "-"}, RT ${p.rt || "-"}/RW ${p.rw || "-"}, Desa Lelea</td></tr>
              <tr><td>Keperluan</td><td>: ${req.purpose}</td></tr>
              ${d.instansi_tujuan ? `<tr><td>Instansi Tujuan</td><td>: ${d.instansi_tujuan}</td></tr>` : ""}
              ${d.nama_usaha ? `<tr><td>Nama Usaha</td><td>: ${d.nama_usaha} (${d.jenis_usaha})</td></tr>` : ""}
              ${d.nominal_penghasilan ? `<tr><td>Penghasilan</td><td>: Rp ${Number(d.nominal_penghasilan).toLocaleString("id-ID")} (${d.sumber_penghasilan})</td></tr>` : ""}
              ${d.nama_almarhum ? `<tr><td>Almarhum</td><td>: ${d.nama_almarhum} (Meninggal tgl ${d.tgl_meninggal})</td></tr>` : ""}
            </table>
            <p style="margin-top: 20px;">Demikian surat keterangan ini dibuat dengan sebenarnya dan untuk dipergunakan sebagaimana mestinya.</p>
          </div>
          <div class="sign">
            <p>Lelea, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p>Kepala Desa Lelea</p>
            <br><br><br>
            <p><b>( KUWU LELEA )</b></p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `)
    w.document.close()
  }

  if (isLoading) return <div className="py-20 text-center">Memuat data...</div>

  return (
    <>
      <AdminTitle title="Layanan Surat" sub="Periksa dan proses pengajuan surat warga." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Inbox} value={services.filter((x) => x.status === "Diajukan").length} label="Diajukan" tone="blue" />
        <StatCard icon={Loader} value={services.filter((x) => x.status === "Diperiksa").length} label="Diperiksa" tone="yellow" />
        <StatCard icon={FileText} value={services.filter((x) => x.status === "Siap diambil").length} label="Siap diambil" tone="green" />
        <StatCard icon={CheckCircle2} value={services.filter((x) => x.status === "Selesai").length} label="Selesai" />
      </div>
      <TableWrap>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr>
              {["Tiket", "Pemohon", "Jenis", "Tanggal", "Status", "Aksi"].map((h) => (
                <th key={h} className={thCls}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((x) => (
              <tr key={x.ticket} className="border-t border-line">
                <td className="px-3 py-3 font-bold text-navy">{x.ticket}</td>
                <td className="px-3 py-3">{x.name}</td>
                <td className="px-3 py-3">{svcName(x.type)}</td>
                <td className="px-3 py-3">{fmtDate(x.created_at)}</td>
                <td className="px-3 py-3"><StatusBadge status={x.status} /></td>
                <td className="px-3 py-3 flex gap-2">
                  <Button variant="secondary" className="!min-h-9 !px-3" onClick={() => open(x.ticket)}>Periksa</Button>
                  <Button variant="ghost" className="!min-h-9 !px-2" onClick={() => printDraft(x)} title="Cetak Draf Surat"><Printer size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      <SlideOver
        open={!!s}
        onClose={() => setSel(null)}
        title={s?.ticket ?? ""}
        footer={
          s && (
            <>
              <Button className="flex-1" onClick={() => apply(status)} disabled={updateStatus.isPending}>Simpan</Button>
              <Button variant="yellow" onClick={() => apply("Siap diambil", "Surat dapat diambil di kantor desa pada jam kerja.")} disabled={updateStatus.isPending}>Siap Diambil</Button>
              <Button variant="danger" onClick={() => { if (!note.trim()) return setErr("Alasan penolakan wajib diisi"); apply("Ditolak") }} disabled={updateStatus.isPending}>Tolak</Button>
              <Button variant="secondary" onClick={() => printDraft(s)}><Printer size={16} /> Cetak</Button>
            </>
          )
        }
      >
        {s && (() => {
          const p = (s.pemohon_data || {}) as Record<string, string>
          const d = (s.data || {}) as Record<string, string>
          return (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl bg-pale p-4 space-y-2">
                <p className="font-bold text-navy text-base">Detail Pemohon</p>
                <p><b>Nama:</b> {p.nama || s.name}</p>
                <p><b>NIK:</b> {p.nik || "-"}</p>
                <p><b>TTL:</b> {p.tempat_lahir || "-"}, {p.tanggal_lahir || "-"}</p>
                <p><b>Kelamin / Agama:</b> {p.jenis_kelamin || "-"} / {p.agama || "-"}</p>
                <p><b>Pekerjaan:</b> {p.pekerjaan || "-"}</p>
                <p><b>Alamat:</b> {p.alamat || "-"}, RT {p.rt || "-"}/RW {p.rw || "-"}</p>
                <p><b>No HP:</b> {p.no_hp || "-"}</p>
              </div>

              <div className="rounded-xl border border-line p-4 space-y-2">
                <p className="font-bold text-navy text-base">Detail Surat</p>
                <p><b>Jenis:</b> {svcName(s.type)}</p>
                <p><b>Keperluan:</b> {s.purpose}</p>
                {d.instansi_tujuan && <p><b>Instansi Tujuan:</b> {d.instansi_tujuan}</p>}
                {d.tanggal_dibutuhkan && <p><b>Tgl Dibutuhkan:</b> {d.tanggal_dibutuhkan}</p>}
                {d.nama_usaha && <p><b>Usaha:</b> {d.nama_usaha} ({d.jenis_usaha}) - {d.alamat_usaha}</p>}
                {d.nominal_penghasilan && <p><b>Penghasilan:</b> Rp {Number(d.nominal_penghasilan).toLocaleString("id-ID")} dari {d.sumber_penghasilan}</p>}
                {d.nama_almarhum && <p><b>Almarhum:</b> {d.nama_almarhum} (Tgl: {d.tgl_meninggal}, Hub: {d.hubungan})</p>}
                {s.note && <p><b>Catatan Pemohon:</b> {s.note}</p>}
              </div>

              <Field label="Status">
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {["Diajukan", "Diperiksa", "Siap diambil", "Selesai", "Ditolak"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Catatan untuk pemohon" error={err}>
                <textarea
                  rows={3}
                  className={cx(inputCls, "py-2")}
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value)
                    setErr("")
                  }}
                  placeholder="Berikan catatan atau alasan..."
                />
              </Field>
            </div>
          )
        })()}
      </SlideOver>
    </>
  )
}
