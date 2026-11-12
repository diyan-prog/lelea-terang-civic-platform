import { Link } from "react-router"
import {
  ArrowRight,
  BarChart3,
  Eye,
  FileText,
  HardHat,
  Landmark,
  PenSquare,
  Search,
  Star,
  Lightbulb,
  Gauge,
  CheckCircle2,
  Quote,
} from "lucide-react"
import { Squiggle } from "../components/Squiggle"
import { VillageIllustration } from "../components/Brand"
import {
  Card,
  CatIcon,
  Container,
  DataBadge,
  IconCircle,
  LinkButton,
  Section,
  SectionHead,
  StatCard,
  StatusBadge,
  Thumb,
} from "../components/ui"
import { useReports, mapDbReport } from "../lib/api/laporan"
import { useProjects } from "../lib/api/kegiatan"
import { useBudgets } from "../lib/api/anggaran"
import { useStats } from "../lib/api/statistik"
import { DUSUN_SHORT, catLabel } from "../lib/mock"
import { pct, timeAgo } from "../lib/format"

const services = [
  {
    icon: Landmark,
    title: "Open Data",
    to: "/anggaran",
    text: "Lihat ke mana uang desa digunakan, lengkap dengan grafik dan penjelasan yang mudah dipahami.",
    link: "Lihat Data Desa",
  },
  {
    icon: FileText,
    title: "Layanan",
    to: "/layanan",
    text: "Ajukan surat keterangan, pengantar KTP/KK, SKTM, dan lainnya, lalu pantau statusnya.",
    link: "Ajukan Layanan",
  },
  {
    icon: PenSquare,
    title: "Laporan",
    to: "/lapor",
    text: "Laporkan jalan rusak, saluran tersumbat, atau masalah lain lengkap dengan foto dan lokasi.",
    link: "Buat Laporan",
  },
  {
    icon: BarChart3,
    title: "Insight",
    to: "/insight",
    text: "Pahami masalah yang sering berulang dan rekomendasi untuk musyawarah desa.",
    link: "Buka Insight",
  },
]
const steps = [
  {
    icon: Eye,
    t: "Lihat Data",
    d: "Cek anggaran, kegiatan, dan statistik desa.",
  },
  {
    icon: PenSquare,
    t: "Lapor",
    d: "Sampaikan masalah dengan foto dan lokasi.",
  },
  { icon: Search, t: "Lacak", d: "Pantau status laporan dengan kode tiket." },
  {
    icon: Lightbulb,
    t: "Insight",
    d: "Lihat pola masalah untuk keputusan desa.",
  },
]
const testi: any[] = []

export default function Home() {
  const { data: dbReports = [] } = useReports()
  const reports = dbReports.map(mapDbReport)
  const { data: projects = [] } = useProjects()
  const { data: budget = [] } = useBudgets()
  const { data: ins } = useStats()

  // Suara Warga: laporan selesai yang punya deskripsi — selalu 3 kartu
  const PLACEHOLDER = [
    { n: "Warga", r: "Dusun Ilir", q: "Laporan warga menunggu...", stars: 5 },
    { n: "Warga", r: "Dusun Weluntas", q: "Laporan warga menunggu...", stars: 5 },
    { n: "Warga", r: "Dusun 3", q: "Laporan warga menunggu...", stars: 5 },
  ]
  const suaraWarga = [
    ...reports
      .filter((r: any) => r.status === "Selesai" && r.desc)
      .slice(0, 3)
      .map((r: any) => ({
        n: r.reporter || "Warga",
        r: "Dusun " + DUSUN_SHORT[r.dusun] || "1",
        q: r.desc,
        stars: r.rating || 5,
      })),
    ...PLACEHOLDER,
  ].slice(0, 3)
  
  // ins now contains serap, selesaiTotal, and score
  const serap = ins?.serap ?? 0
  const selesaiTotal = ins?.selesaiTotal ?? 0
  const score = ins?.score ?? 0

  if (!ins) return <Container className="py-20 text-center">Memuat data...</Container>
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-pale via-pale/50 to-white pb-28 pt-10 lg:pb-32 lg:pt-16">
        <Container className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:-mt-12">
          <div className="fade-up">

            <h1 className="mt-5 text-[36px] leading-[1.1] sm:text-[48px] lg:text-[54px]">
              Transparansi &amp; Partisipasi Desa <br/> <Squiggle color="#F2B33D">di Ujung Jari Anda</Squiggle>
            </h1>
            <p className="mt-5 max-w-xl text-lg">
              Pantau penggunaan dana desa, layanan publik, dan pembangunan Desa
              Lelea secara terbuka dan real-time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton to="/anggaran">
                Jelajahi Data Desa <ArrowRight size={18} />
              </LinkButton>
              <LinkButton to="/lapor" variant="secondary">
                Buat Laporan Warga
              </LinkButton>
            </div>
          </div>
          <div className="relative lg:-mr-[max(0px,calc((100vw-1200px)/2))]">
            <div className="aspect-[560/460] w-full overflow-hidden bg-white shadow-soft [border-radius:62%_38%_0_0/48%_55%_0_0] sm:[border-radius:58%_42%_0_42%/52%_46%_54%_48%] lg:[border-radius:58%_0_0_42%/52%_0_0_48%]">
              <img src="/logo home.jpeg" alt="Desa Lelea" className="h-full w-full object-cover" />
            </div>
          </div>
        </Container>
      </section>

      <Container className="relative z-10 -mt-20 lg:-mt-28">
        <div className="mb-2 flex justify-end">
          <DataBadge />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Landmark}
            value={`${serap}%`}
            label="Anggaran Terserap"
          />
          <StatCard
            icon={HardHat}
            value={projects.length}
            label="Kegiatan Pembangunan"
            tone="yellow"
          />
          <StatCard
            icon={CheckCircle2}
            value={selesaiTotal}
            label="Laporan Diselesaikan"
            tone="green"
          />
          <StatCard
            icon={Gauge}
            value={`${score}/100`}
            label="Skor Responsivitas"
            tone="blue"
          />
        </div>
      </Container>

      <Section>
        <SectionHead
          title="Layanan Utama Lelea Terang"
          sub="Empat cara untuk ikut mengawasi dan membangun desa."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(services || []).map((s) => (
            <Card
              key={s.title}
              className="group flex flex-col transition hover:-translate-y-1"
            >
              <IconCircle icon={s.icon} size={56} />
              <h3 className="mt-4 text-xl">{s.title}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-[15px]">{s.text}</p>
              <Link
                to={s.to}
                className="mt-4 inline-flex min-h-11 items-center gap-1 font-bold text-teal group-hover:gap-2 transition-all"
              >
                {s.link}
                <ArrowRight size={16} />
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section pale className="relative overflow-hidden">
        <div className="relative z-10">
          <SectionHead
            title="Laporan Terbaru"
            sub="Laporan warga yang baru masuk dan sedang ditangani."
            action={
              <Link
                to="/laporan"
                className="inline-flex min-h-11 items-center gap-1 font-bold text-teal"
              >
                Lihat semua laporan
                <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="grid gap-5 md:grid-cols-3">
            {(reports || []).slice(0, 3).map((r) => (
              <Link
                key={r.ticket}
                to={`/laporan/${r.ticket}`}
                className="group overflow-hidden rounded-card border border-line bg-white/95 shadow-soft transition hover:-translate-y-1"
              >
                <Thumb
                  category={r.category}
                  src={r.photos?.[0]}
                  className="h-40 w-full"
                />
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-xs font-bold text-slate-500">
                      {r.ticket}
                    </span>
                  </div>
                  <h3 className="text-lg group-hover:text-teal">{r.title}</h3>
                  <p className="mt-1 text-sm">
                    {DUSUN_SHORT[r.dusun]} • RW {r.rw} • {catLabel(r.category)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {timeAgo(r.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <SectionHead
          title="Cara Kerja"
          sub="Empat langkah sederhana, tanpa perlu datang ke kantor desa."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.t} className="relative text-center">
              {i < 3 && (
                <ArrowRight className="absolute -right-4 top-6 hidden text-teal/40 lg:block" />
              )}
              <div className="relative mx-auto w-fit">
                <IconCircle icon={s.icon} size={72} />
                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-sun text-sm font-extrabold text-navy">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg">{s.t}</h3>
              <p className="mt-1 text-[15px]">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section pale>
        <SectionHead title="Suara Warga" />
        <div className="grid gap-5 md:grid-cols-3">
          {suaraWarga.slice(0, 3).map((t: any, idx: number) => (
            <Card key={idx}>
              <Quote className="text-teal/40" />
              <p className="mt-2 text-[15px] text-[#334155]">{t.q}</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pale font-extrabold text-teal">
                  {t.n[0].toUpperCase()}
                </span>
                <div>
                  <div className="font-bold text-navy">{t.n}</div>
                  <div className="text-xs">{t.r}</div>
                </div>
                <div className="ml-auto flex">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={14} className="fill-sun text-sun" />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  )
}
