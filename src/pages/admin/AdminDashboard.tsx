import { MessageSquareWarning, FileText, Users, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react"
import { Card, LinkButton, StatCard } from "../../components/ui"
import { AdminTitle } from "./AdminReports"
import { useAdminReports } from "../../lib/api/laporan"
import { useServiceRequests } from "../../lib/api/layanan"

export default function AdminDashboard() {
  const { data: reports = [] } = useAdminReports()
  const { data: services = [] } = useServiceRequests()

  const pendingReports = reports.filter(r => ['diterima', 'diverifikasi'].includes(r.status.toLowerCase())).length
  const pendingServices = services.filter(s => s.status.toLowerCase() === 'diajukan').length
  const finishedReportsThisMonth = reports.filter(r => {
    const completedUpdate = r.updates?.some((u: any) => 
      u.status?.toLowerCase() === 'selesai' &&
      new Date(u.created_at).getMonth() === new Date().getMonth() &&
      new Date(u.created_at).getFullYear() === new Date().getFullYear()
    )
    return completedUpdate || (
      r.status?.toLowerCase() === 'selesai' && 
      new Date(r.created_at).getMonth() === new Date().getMonth() &&
      new Date(r.created_at).getFullYear() === new Date().getFullYear()
    )
  }).length

  return (
    <>
      <AdminTitle
        title="Dashboard Desa Lelea"
        sub="Ringkasan aktivitas dan statistik platform warga Desa Lelea."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          icon={MessageSquareWarning}
          value={reports.length}
          label="Total Laporan Warga"
          tone="blue"
        />
        <StatCard
          icon={FileText}
          value={pendingReports}
          label="Laporan Perlu Ditindaklanjuti"
          tone="yellow"
        />
        <StatCard
          icon={CheckCircle2}
          value={finishedReportsThisMonth}
          label="Selesai Bulan Ini"
          tone="green"
        />
        <StatCard
          icon={Users}
          value={services.length}
          label="Total Layanan Surat"
          tone="green"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy">Manajemen Laporan</h3>
            <LinkButton to="/admin/laporan" variant="secondary" className="!min-h-9 !px-3 text-xs">
              Kelola <ArrowRight size={14} />
            </LinkButton>
          </div>
          <p className="text-sm text-slate-600">
            Periksa laporan kerusakan jalan, irigasi, sampah, dan aduan warga lainnya. Berikan tanggapan dan perbarui status pengerjaan.
          </p>
          <div className="rounded-xl bg-pale p-4 text-sm font-medium text-navy">
            {pendingReports} laporan menunggu verifikasi dan penanganan.
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy">Layanan Surat Menyurat</h3>
            <LinkButton to="/admin/layanan" variant="secondary" className="!min-h-9 !px-3 text-xs">
              Kelola <ArrowRight size={14} />
            </LinkButton>
          </div>
          <p className="text-sm text-slate-600">
            Proses pengajuan surat keterangan domisili, usaha, penghasilan, dan kematian dari warga secara online.
          </p>
          <div className="rounded-xl bg-pale p-4 text-sm font-medium text-navy">
            {pendingServices} pengajuan surat baru belum diperiksa.
          </div>
        </Card>
      </div>
    </>
  )
}
