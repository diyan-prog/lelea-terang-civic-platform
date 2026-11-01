import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Download, Info, Lightbulb, Printer, Repeat } from "lucide-react"
import {
  Button,
  Card,
  Container,
  DataBadge,
  PageHeader,
  ProgressBar,
  cx,
} from "../components/ui"
import { useApp } from "../lib/store"
import { computeInsight } from "../lib/insight"
import { CATEGORIES, DUSUN_SHORT, catLabel } from "../lib/mock"
import { downloadCSV, rpShort } from "../lib/format"

function Gauge({ score }: { score: number }) {
  const r = 80,
    c = Math.PI * r
  const tone = score >= 80 ? "#2F9E5B" : score >= 60 ? "#F2B632" : "#D64545"
  return (
    <div
      className="relative mx-auto w-[220px]"
      role="img"
      aria-label={`Skor responsivitas ${score} dari 100`}
    >
      <svg viewBox="0 0 200 110" className="w-full">
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="#E3F1F2"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke={tone}
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="text-5xl font-extrabold text-navy">{score}</div>
        <div className="text-xs font-bold">dari 100</div>
      </div>
    </div>
  )
}

export default function Insight() {
  const { reports, projects, budget } = useApp()
  const d = useMemo(
    () => computeInsight(reports, projects, budget),
    [reports, projects, budget],
  )
  const max = Math.max(1, ...d.heat.flat())
  const csv = () =>
    downloadCSV("insight-lelea-terang.csv", [
      ["Metrik", "Nilai"],
      ["Skor responsivitas", d.score],
      ["Respons cepat (%)", d.resp],
      ["Laporan selesai (%)", d.done],
      ["Tepat waktu (%)", d.sla],
      ["Rating warga (%)", d.rating],
      [],
      ["Dusun", ...CATEGORIES.map((c) => c.label)],
      ...DUSUN_SHORT.map((n, i) => [n, ...d.heat[i]]),
      [],
      ["Bidang", "Anggaran", "Realisasi", "Laporan"],
      ...d.perBidang.map((b) => [
        b.bidang,
        b.anggaran,
        b.realisasi,
        b.complaints,
      ]),
    ])
  const subs = [
    ["Respons cepat (≤48 jam)", d.resp, "30%"],
    ["Laporan selesai", d.done, "30%"],
    ["Tepat waktu (SLA)", d.sla, "25%"],
    ["Kepuasan warga", d.rating, "15%"],
  ] as const
  return (
    <>
      <PageHeader
        title="Insight Desa"
        sub="Ringkasan untuk Musyawarah Desa: apa yang warga keluhkan, dan seberapa cepat desa menanggapi."
      >
        <div className="no-print flex gap-3">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={18} />
            Cetak
          </Button>
          <Button onClick={csv}>
            <Download size={18} />
            Unduh CSV
          </Button>
        </div>
      </PageHeader>
      <Container className="space-y-6 pb-16">
        <DataBadge />
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-xl">Skor Responsivitas Desa</h2>
              <span className="group relative">
                <button
                  aria-label="Cara menghitung skor"
                  className="rounded-full p-1 text-teal"
                >
                  <Info size={20} />
                </button>
                <span
                  role="tooltip"
                  className="invisible absolute right-0 top-8 z-10 w-64 rounded-xl bg-navy p-3 text-xs font-medium text-white opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
                >
                  Skor = 30% respons cepat + 30% laporan selesai + 25% tepat
                  waktu + 15% kepuasan warga.
                </span>
              </span>
            </div>
            <Gauge score={d.score} />
            <div className="mt-6 space-y-4">
              {subs.map(([l, v, w]) => (
                <div key={l}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold text-navy">{l}</span>
                    <span>
                      {v}% <span className="text-xs">(bobot {w})</span>
                    </span>
                  </div>
                  <ProgressBar
                    value={v}
                    tone={v >= 80 ? "green" : v >= 60 ? "yellow" : "red"}
                  />
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="mb-1 text-xl">Laporan Masuk vs Selesai</h2>
            <p className="mb-4 text-sm">Per bulan, Mei–Oktober 2026.</p>
            <div
              className="h-72"
              role="img"
              aria-label="Grafik garis laporan masuk dan selesai per bulan"
            >
              <ResponsiveContainer>
                <LineChart data={d.monthly}>
                  <CartesianGrid stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 13 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    name="Masuk"
                    dataKey="masuk"
                    stroke="#0F8B8D"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    name="Selesai"
                    dataKey="selesai"
                    stroke="#F2B632"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <Card>
          <h2 className="mb-1 text-xl">Peta Panas Keluhan</h2>
          <p className="mb-4 text-sm">Semakin pekat, semakin banyak laporan.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-1.5 text-sm">
              <thead>
                <tr>
                  <th />
                  {CATEGORIES.map((c) => (
                    <th key={c.id} className="px-1 text-xs font-bold text-navy">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DUSUN_SHORT.map((n, i) => (
                  <tr key={n}>
                    <th className="pr-2 text-left font-bold text-navy">{n}</th>
                    {d.heat[i].map((v, j) => (
                      <td
                        key={j}
                        className={cx(
                          "h-12 rounded-lg text-center font-bold",
                          v / max > 0.5 ? "text-white" : "text-navy",
                        )}
                        style={{
                          background: `rgba(15,139,141,${
                            v ? 0.12 + (v / max) * 0.88 : 0.04
                          })`,
                        }}
                        title={`${n}: ${v} laporan`}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-xl">
              <Repeat size={20} className="text-bad" />
              Masalah Berulang
            </h2>
            {d.recurring.length ? (
              <ul className="space-y-3">
                {d.recurring.map((r) => (
                  <li
                    key={r.dusun + r.category}
                    className="flex items-center justify-between gap-3 rounded-xl bg-bad/5 p-3"
                  >
                    <span className="font-semibold text-navy">
                      {catLabel(r.category)} di {DUSUN_SHORT[r.dusun]}
                    </span>
                    <span className="rounded-full bg-bad px-2.5 py-0.5 text-xs font-bold text-white">
                      {r.count}x dalam 90 hari
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Belum ada masalah yang berulang.</p>
            )}
          </Card>
          <Card>
            <h2 className="mb-1 text-xl">
              Anggaran vs Jumlah Keluhan per Bidang
            </h2>
            <p className="mb-4 text-sm">
              Belanja 2026 (juta rupiah) dan jumlah laporan.
            </p>
            <div
              className="h-64"
              role="img"
              aria-label="Grafik batang anggaran dan keluhan per bidang"
            >
              <ResponsiveContainer>
                <BarChart
                  data={d.perBidang.map((b) => ({
                    ...b,
                    nama: b.bidang.split(" ")[1] ?? b.bidang,
                    juta: Math.round(b.anggaran / 1e6),
                  }))}
                >
                  <CartesianGrid stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="nama" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="r"
                    orientation="right"
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(v, n) => [
                      n === "Anggaran" ? rpShort(Number(v) * 1e6) : v,
                      n,
                    ]}
                  />
                  <Legend />
                  <Bar
                    yAxisId="l"
                    name="Anggaran"
                    dataKey="juta"
                    fill="#0B4F5C"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    yAxisId="r"
                    name="Keluhan"
                    dataKey="complaints"
                    fill="#F2B632"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <Card className="border-teal/40 bg-pale/50">
          <h2 className="mb-4 flex items-center gap-2 text-xl">
            <Lightbulb size={22} className="text-[#b8860b]" />
            Rekomendasi untuk Musdes
          </h2>
          <ol className="space-y-3">
            {d.recs.map((r, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs">
            Rekomendasi disusun otomatis dari aturan sederhana pada data contoh.
            Keputusan akhir tetap melalui musyawarah.
          </p>
        </Card>
      </Container>
    </>
  )
}
