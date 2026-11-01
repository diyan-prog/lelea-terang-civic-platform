import { Home, Map as MapIcon, Users, Wheat, Lock, Loader } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Callout,
  Card,
  Container,
  DataBadge,
  PageHeader,
  StatCard,
} from "../components/ui"
import { COLORS } from "./Budget"
import { pct } from "../lib/format"
import {
  useStatsDusun,
  useStatsUsia,
  useStatsPekerjaan,
  useStatsPendidikan,
  useStatsBansos,
} from "../lib/api/statistik"

const num = (n: number) => n.toLocaleString("id-ID")
const Chart = ({
  title,
  label,
  children,
  note,
}: {
  title: string
  label: string
  children: React.ReactNode
  note: React.ReactNode
}) => (
  <Card className="space-y-4">
    <h2 className="text-xl">{title}</h2>
    <div className="h-72" role="img" aria-label={label}>
      {children}
    </div>
    <Callout>{note}</Callout>
  </Card>
)
const grid = <CartesianGrid vertical={false} stroke="#E2E8F0" />

export default function Stats() {
  const { data: dusunData = [], isLoading: loadingDusun } = useStatsDusun()
  const { data: usiaData = [], isLoading: loadingUsia } = useStatsUsia()
  const { data: pekerjaanData = [], isLoading: loadingPekerjaan } = useStatsPekerjaan()
  const { data: pendidikanData = [], isLoading: loadingPendidikan } = useStatsPendidikan()
  const { data: bansosData = [], isLoading: loadingBansos } = useStatsBansos()

  const isLoading = loadingDusun || loadingUsia || loadingPekerjaan || loadingPendidikan || loadingBansos

  if (isLoading) {
    return (
      <Container className="py-20 text-center">
        <Loader className="mx-auto h-12 w-12 animate-spin text-teal" />
        <p className="mt-4 text-navy">Memuat statistik desa...</p>
      </Container>
    )
  }

  const total = dusunData.reduce((a, d) => a + (d?.penduduk || 0), 0)
  const kk = dusunData.reduce((a, d) => a + (d?.kk || 0), 0)
  const sawah = dusunData.reduce((a, d) => a + (d?.sawah || 0), 0)

  const perDusun = dusunData
    .filter((d) => d?.dusun_name)
    .map((d) => ({
      name: (d.dusun_name || '').replace('Dusun ', ''),
      Penduduk: d?.penduduk || 0,
    }))

  // Aggregate usia across all dusun
  const usiaAggregate = [
    { name: "0-4", value: usiaData.reduce((a, d) => a + (d.usia_0_4 || 0), 0) },
    { name: "5-9", value: usiaData.reduce((a, d) => a + (d.usia_5_9 || 0), 0) },
    { name: "10-14", value: usiaData.reduce((a, d) => a + (d.usia_10_14 || 0), 0) },
    { name: "15-19", value: usiaData.reduce((a, d) => a + (d.usia_15_19 || 0), 0) },
    { name: "20-29", value: usiaData.reduce((a, d) => a + (d.usia_20_29 || 0), 0) },
    { name: "30-39", value: usiaData.reduce((a, d) => a + (d.usia_30_39 || 0), 0) },
    { name: "40-49", value: usiaData.reduce((a, d) => a + (d.usia_40_49 || 0), 0) },
    { name: "50-59", value: usiaData.reduce((a, d) => a + (d.usia_50_59 || 0), 0) },
    { name: "60-69", value: usiaData.reduce((a, d) => a + (d.usia_60_69 || 0), 0) },
    { name: "70+", value: usiaData.reduce((a, d) => a + (d.usia_70_plus || 0), 0) },
  ]

  const pekerjaan = pekerjaanData
    .filter((p) => p?.name && p?.jumlah)
    .map((p) => ({
      name: p.name || '',
      n: p.jumlah || 0,
    }))

  const pendidikan = pendidikanData
    .filter((p) => p?.name && p?.jumlah)
    .map((p) => ({
      name: p.name || '',
      n: p.jumlah || 0,
    }))

  // Group bansos by dusun and pivot programs into columns
  const bansosMap = new Map<string, { name: string; PKH: number; BPNT: number; BLT: number }>();
  
  try {
    bansosData.forEach((b: any) => {
      const dusunName = b.dusun_id?.replace('Dusun ', '') || 'Unknown';
      
      if (!bansosMap.has(b.dusun_id)) {
        bansosMap.set(b.dusun_id, { name: dusunName, PKH: 0, BPNT: 0, BLT: 0 });
      }
      
      const entry = bansosMap.get(b.dusun_id)!;
      if (b.program === 'PKH') entry.PKH = b.jumlah_penerima;
      if (b.program === 'BPNT') entry.BPNT = b.jumlah_penerima;
      if (b.program === 'BLT') entry.BLT = b.jumlah_penerima;
    });
  } catch (err) {
    console.error('Error processing bansos data:', err);
  }
  
  const bansos = Array.from(bansosMap.values());

  const bigD = perDusun.length > 0 ? [...perDusun].sort((a, b) => b.Penduduk - a.Penduduk)[0] : null;
  const prod = usiaAggregate.length >= 8 
    ? (usiaAggregate[4]?.value || 0) + (usiaAggregate[5]?.value || 0) + (usiaAggregate[6]?.value || 0) + (usiaAggregate[7]?.value || 0)
    : 0;
  const pend = pendidikan.reduce((a, x) => a + (x?.n || 0), 0)
  const totBs = bansos.reduce((a, b) => a + (b?.PKH || 0) + (b?.BPNT || 0) + (b?.BLT || 0), 0)

  return (
    <>
      <PageHeader
        title="Statistik Desa"
        sub="Gambaran penduduk, pekerjaan, pendidikan, dan bantuan sosial di Desa Lelea."
      >
        <DataBadge />
      </PageHeader>
      <Container className="space-y-8 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} value={num(total)} label="Total Penduduk" />
          <StatCard
            icon={Home}
            value={num(kk)}
            label="Kepala Keluarga"
            tone="yellow"
          />
          <StatCard
            icon={MapIcon}
            value={dusunData.length}
            label="Jumlah Dusun"
            tone="blue"
          />
          <StatCard
            icon={Wheat}
            value={`${num(sawah)} ha`}
            label="Luas Sawah"
            tone="green"
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Chart
            title="Penduduk per Dusun"
            label="Diagram batang penduduk per dusun"
            note={bigD ? `${bigD.name} adalah dusun terpadat dengan ${num(bigD.Penduduk)} jiwa (${pct(bigD.Penduduk, total)}% dari seluruh penduduk).` : 'Data tidak tersedia'}
          >
            <ResponsiveContainer>
              <BarChart data={perDusun}>
                {grid}
                <XAxis dataKey="name" />
                <YAxis width={50} />
                <Tooltip />
                <Bar dataKey="Penduduk" fill="#0F8B8D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Chart>
          <Chart
            title="Komposisi Usia"
            label="Diagram donat komposisi usia"
            note={`Sekitar ${pct(prod, total)}% penduduk berusia 15–59 tahun, usia yang paling produktif bekerja.`}
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={usiaAggregate}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={100}
                  paddingAngle={2}
                  label={(e) => `${e.name}`}
                >
                  {usiaAggregate.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Chart>
          <Chart
            title="Pekerjaan Utama"
            label="Diagram batang horizontal pekerjaan utama"
            note={pekerjaan.length > 0 && pekerjaan[0] ? `Mayoritas warga bekerja sebagai ${(pekerjaan[0].name || '').toLowerCase()} (${pct(
              pekerjaan[0].n,
              pekerjaan.reduce((a, x) => a + (x?.n || 0), 0),
            )}%). Program irigasi sangat penting bagi mata pencaharian warga.` : 'Data tidak tersedia'}
          >
            <ResponsiveContainer>
              <BarChart
                data={pekerjaan}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  dataKey="n"
                  name="Jiwa"
                  fill="#F2B632"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Chart>
          <Chart
            title="Tingkat Pendidikan"
            label="Diagram batang tingkat pendidikan"
            note={pendidikan.length > 1 && pendidikan[0] && pendidikan[pendidikan.length - 1] ? `Sebagian besar warga lulusan ${pendidikan[0].name} (${pct(pendidikan[0].n, pend)}%). Hanya ${pct(pendidikan[pendidikan.length - 1].n, pend)}% yang lulus perguruan tinggi, sehingga pelatihan keterampilan perlu diperkuat.` : 'Data tidak tersedia'}
          >
            <ResponsiveContainer>
              <BarChart data={pendidikan}>
                {grid}
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis width={50} />
                <Tooltip />
                <Bar
                  dataKey="n"
                  name="Jiwa"
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Chart>
        </div>
        <Card className="space-y-4">
          <h2 className="text-xl">Bantuan Sosial (agregat per dusun)</h2>
          <div
            className="h-72"
            role="img"
            aria-label="Diagram batang bertumpuk bantuan sosial per dusun"
          >
            <ResponsiveContainer>
              <BarChart data={bansos}>
                {grid}
                <XAxis dataKey="name" />
                <YAxis width={40} />
                <Tooltip />
                <Legend />
                <Bar dataKey="PKH" stackId="a" fill="#0F8B8D" />
                <Bar dataKey="BPNT" stackId="a" fill="#F2B632" />
                <Bar
                  dataKey="BLT"
                  stackId="a"
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-info/10 p-3 text-sm text-blue-900">
            <Lock size={18} className="mt-0.5 shrink-0" />
            Nama penerima tidak ditampilkan untuk melindungi privasi.
          </div>
          <Callout>
            Total {num(totBs)} penerima manfaat (PKH, BPNT, dan BLT) tercatat.
            Data hanya berupa jumlah per dusun, bukan daftar nama.
          </Callout>
        </Card>
      </Container>
    </>
  )
}
