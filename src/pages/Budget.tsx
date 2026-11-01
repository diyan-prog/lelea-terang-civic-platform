import { useMemo, useState } from "react"
import { ArrowDownUp, Download, Wallet, TrendingDown, TrendingUp, Search, Filter, PieChart } from "lucide-react"
import {
  Button,
  Card,
  Container,
  DataBadge,
  IconCircle,
  PageHeader,
  Select,
} from "../components/ui"
import { toast } from "../lib/store"
import { useBudgets } from "../lib/api/anggaran"
import { pct, rp, downloadCSV } from "../lib/format"

export const COLORS = ["#0F8B8D", "#F2B632", "#3B82F6", "#2F9E5B", "#D64545", "#EC4899", "#8B5CF6", "#F97316"]

export function Ring({ value, size = 88 }: { value: number; size?: number }) {
  const r = size / 2 - 8
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} role="img" aria-label={`${value}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E3F1F2" strokeWidth="9" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#0F8B8D"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-navy text-[18px] font-extrabold">
        {value}%
      </text>
    </svg>
  )
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const p = pct(value, max)
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-pale">
        <div className="h-full bg-teal transition-all" style={{ width: `${Math.min(p, 100)}%` }} />
      </div>
      <span className="w-12 text-right text-sm font-bold text-navy">{p}%</span>
    </div>
  )
}

function PieChartViz({ data, total }: { data: Array<{ title: string; value: number; color: string }>; total: number }) {
  if (!total) return <div className="flex h-64 items-center justify-center text-sm text-gray-400">Tidak ada data</div>
  
  let acc = 0
  const segments = data.map((d) => {
    const p = (d.value / total) * 100
    const start = acc
    acc += p
    return { ...d, percent: p, start }
  })

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <svg viewBox="0 0 200 200" className="h-48 w-48 shrink-0">
        <circle cx="100" cy="100" r="80" fill="#F0F9F9" />
        {segments.map((s, i) => {
          const startAngle = (s.start / 100) * 360 - 90
          const endAngle = ((s.start + s.percent) / 100) * 360 - 90
          const rad1 = (startAngle * Math.PI) / 180
          const rad2 = (endAngle * Math.PI) / 180
          const x1 = 100 + 80 * Math.cos(rad1)
          const y1 = 100 + 80 * Math.sin(rad1)
          const x2 = 100 + 80 * Math.cos(rad2)
          const y2 = 100 + 80 * Math.sin(rad2)
          const large = s.percent > 50 ? 1 : 0
          return (
            <path
              key={i}
              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${large} 1 ${x2} ${y2} Z`}
              fill={s.color}
              opacity="0.9"
            />
          )
        })}
        <circle cx="100" cy="100" r="50" fill="white" />
        <text x="100" y="95" textAnchor="middle" className="text-[14px] font-bold fill-navy">TOTAL</text>
        <text x="100" y="115" textAnchor="middle" className="text-[10px] fill-gray-600">
          {total >= 1e9 ? `${(total / 1e9).toFixed(1)}M` : `${(total / 1e6).toFixed(0)}jt`}
        </text>
      </svg>
      <div className="flex flex-1 flex-wrap gap-x-4 gap-y-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-sm">
              <span className="font-semibold text-navy">{s.title}</span>
              <span className="ml-1 text-gray-600">({s.percent.toFixed(1)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Budget() {
  const [year, setYear] = useState(2026)
  const { data: budget = [], isLoading, error } = useBudgets(year)
  const [sort, setSort] = useState<{ k: "title" | "allocated" | "realized"; asc: boolean }>({ k: "allocated", asc: false })
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState<"all" | "pendapatan" | "belanja">("all")
  
  const pend = budget.filter((b) => b.category === "pendapatan")
  const bel = budget.filter((b) => b.category === "belanja")
  
  const sum = (a: typeof budget, k: "allocated" | "realized") => a.reduce((s, x) => s + x[k], 0)

  const filtered = useMemo(() => {
    let f = catFilter === "all" ? budget : catFilter === "pendapatan" ? pend : bel
    if (search) f = f.filter((x) => x.title.toLowerCase().includes(search.toLowerCase()))
    return f
  }, [budget, pend, bel, catFilter, search])

  const rows = useMemo(() => {
    const r = [...filtered].map((x) => ({ ...x, p: pct(x.realized, x.allocated) }))
    r.sort((a, b) => (sort.k === "title" ? a.title.localeCompare(b.title) : a[sort.k] - b[sort.k]) * (sort.asc ? 1 : -1))
    return r
  }, [filtered, sort])

  const th = (k: typeof sort.k, l: string, right?: boolean) => (
    <th className={`px-3 py-3 ${right ? "text-right" : "text-left"}`}>
      <button onClick={() => setSort({ k, asc: sort.k === k ? !sort.asc : false })} className="inline-flex items-center gap-1 font-bold">
        {l} <ArrowDownUp size={13} />
      </button>
    </th>
  )

  const handleExport = () => {
    if (!budget.length) return toast("Tidak ada data untuk diunduh")
    const headers = ["Kategori", "Uraian", "Anggaran", "Realisasi", "Persentase"]
    const data = budget.map((b) => [
      b.category === "pendapatan" ? "Pendapatan" : "Belanja",
      b.title,
      b.allocated,
      b.realized,
      `${pct(b.realized, b.allocated)}%`,
    ])
    downloadCSV(`apbdes-${year}.csv`, [headers, ...data])
    toast("Data berhasil diunduh")
  }

  const pendChartData = pend.slice(0, 8).map((p, i) => ({ title: p.title, value: p.allocated, color: COLORS[i % COLORS.length] }))
  const belChartData = bel.slice(0, 8).map((b, i) => ({ title: b.title, value: b.allocated, color: COLORS[i % COLORS.length] }))

  if (isLoading) {
    return (
      <Container className="py-20 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pale border-t-teal" />
        <p className="mt-4 text-navy">Memuat data anggaran...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bad/10">
          <TrendingDown className="text-bad" size={32} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-navy">Gagal Memuat Data</h3>
        <p className="text-gray-600">Terjadi kesalahan saat mengambil data anggaran. Coba lagi nanti.</p>
      </Container>
    )
  }

  if (!budget.length) {
    return (
      <>
        <PageHeader title="Uang Desa Kita" sub="Dari mana uang desa berasal dan untuk apa digunakan." />
        <Container className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pale">
            <Wallet className="text-teal" size={32} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-navy">Belum Ada Data</h3>
          <p className="text-gray-600">Data anggaran untuk tahun {year} belum tersedia.</p>
        </Container>
      </>
    )
  }

  const totalPend = sum(pend, "allocated")
  const totalBel = sum(bel, "allocated")
  const realBel = sum(bel, "realized")
  const realPend = sum(pend, "realized")

  return (
    <>
      <PageHeader title="Uang Desa Kita" sub="Dari mana uang desa berasal dan untuk apa digunakan. Semua angka dalam Rupiah.">
        <div className="flex flex-wrap items-center gap-3">
          <DataBadge />
          <div className="w-36">
            <Select aria-label="Tahun" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              <option value={2026}>Tahun 2026</option>
              <option value={2025}>Tahun 2025</option>
              <option value={2024}>Tahun 2024</option>
            </Select>
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <Download size={18} /> Unduh CSV
          </Button>
        </div>
      </PageHeader>
      <Container className="space-y-8 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="flex items-center gap-4">
            <IconCircle icon={TrendingUp} tone="green" size={56} />
            <div>
              <div className="text-sm font-medium">Total Pendapatan</div>
              <div className="text-[26px] font-extrabold text-navy">{rp(totalPend)}</div>
              <div className="text-xs text-gray-600">Realisasi: {rp(realPend)}</div>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <IconCircle icon={TrendingDown} tone="yellow" size={56} />
            <div>
              <div className="text-sm font-medium">Total Belanja</div>
              <div className="text-[26px] font-extrabold text-navy">{rp(totalBel)}</div>
              <div className="text-xs text-gray-600">Realisasi: {rp(realBel)}</div>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <Ring value={pct(realBel, totalBel)} />
            <div>
              <div className="text-sm font-medium">Realisasi Belanja</div>
              <div className="text-xl font-extrabold text-navy">{pct(realBel, totalBel)}%</div>
              <div className="text-xs text-gray-600">{rp(realBel)} dari {rp(totalBel)}</div>
            </div>
          </Card>
        </div>

        {pend.length > 0 && (
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <PieChart className="text-teal" size={20} />
              <h3 className="text-lg font-bold text-navy">Komposisi Pendapatan</h3>
            </div>
            <PieChartViz data={pendChartData} total={totalPend} />
          </Card>
        )}

        {bel.length > 0 && (
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <PieChart className="text-sun" size={20} />
              <h3 className="text-lg font-bold text-navy">Komposisi Belanja</h3>
            </div>
            <PieChartViz data={belChartData} total={totalBel} />
          </Card>
        )}

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari uraian..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border-2 border-line bg-white pl-10 pr-4 text-sm transition focus:border-teal focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value as typeof catFilter)}>
                <option value="all">Semua Kategori</option>
                <option value="pendapatan">Pendapatan</option>
                <option value="belanja">Belanja</option>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto !p-0">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-pale/70 text-navy">
                <tr>
                  <th className="px-3 py-3 text-left font-bold">Kategori</th>
                  {th("title", "Uraian")}
                  {th("allocated", "Anggaran", true)}
                  {th("realized", "Realisasi", true)}
                  <th className="px-3 py-3 text-right font-bold">Progress</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      {search || catFilter !== "all" ? "Tidak ada data yang sesuai filter" : "Tidak ada data"}
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t border-line hover:bg-pale/30 transition">
                      <td className="px-3 py-3">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                          r.category === "pendapatan" ? "bg-green/10 text-green" : "bg-sun/20 text-amber-700"
                        }`}>
                          {r.category === "pendapatan" ? "Pendapatan" : "Belanja"}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-navy">{r.title}</td>
                      <td className="px-3 py-3 text-right">{rp(r.allocated)}</td>
                      <td className="px-3 py-3 text-right">{rp(r.realized)}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24">
                            <ProgressBar value={r.realized} max={r.allocated} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Container>
    </>
  )
}
