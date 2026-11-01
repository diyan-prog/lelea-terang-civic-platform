import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { ArrowLeft, Flag, HardHat, Lock, MapPin, Calendar } from "lucide-react"
import {
  Card,
  Container,
  EmptyState,
  MapView,
  PageHeader,
  ProgressBar,
  Select,
  StatusBadge,
  Thumb,
  Button,
  Callout,
  DataBadge,
} from "../components/ui"
import { ReportCard } from "../components/ReportCard"
import { useApp } from "../lib/store"
import { BIDANG, DUSUN_SHORT, type Project } from "../lib/mock"
import { fmtDate, pct, rp } from "../lib/format"

const tone = (s: Project["status"]) =>
  s === "Selesai" ? "green" : s === "Berjalan" ? "teal" : "yellow"

export function Projects() {
  const { projects } = useApp()
  const nav = useNavigate()
  const [f, setF] = useState({ dusun: "", status: "", bidang: "" })
  const [hl, setHl] = useState<number | null>(null)
  const list = projects.filter(
    (p) =>
      (!f.dusun || p.dusun === +f.dusun) &&
      (!f.status || p.status === f.status) &&
      (!f.bidang || p.bidang === f.bidang),
  )
  return (
    <>
      <PageHeader
        title="Pembangunan Desa"
        sub="Pantau kegiatan pembangunan Desa Lelea beserta anggaran dan perkembangannya."
      >
        <DataBadge />
      </PageHeader>
      <Container className="py-6">
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Select
            aria-label="Dusun"
            value={f.dusun}
            onChange={(e) => setF({ ...f, dusun: e.target.value })}
          >
            <option value="">Semua dusun</option>
            {DUSUN_SHORT.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Status"
            value={f.status}
            onChange={(e) => setF({ ...f, status: e.target.value })}
          >
            <option value="">Semua status</option>
            <option>Direncanakan</option>
            <option>Berjalan</option>
            <option>Selesai</option>
          </Select>
          <Select
            aria-label="Bidang"
            value={f.bidang}
            onChange={(e) => setF({ ...f, bidang: e.target.value })}
          >
            <option value="">Semua bidang</option>
            {BIDANG.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </Select>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {list.length === 0 && (
              <div className="sm:col-span-2">
                <EmptyState
                  icon={HardHat}
                  title="Tidak ada kegiatan"
                  text="Coba ubah filter yang dipilih."
                />
              </div>
            )}
            {list.map((p) => (
              <Link
                key={p.id}
                to={`/pembangunan/${p.id}`}
                onMouseEnter={() => setHl(p.id)}
                onMouseLeave={() => setHl(null)}
                className={`overflow-hidden rounded-card border bg-white shadow-soft transition hover:-translate-y-0.5 ${
                  hl === p.id ? "border-teal" : "border-line"
                }`}
              >
                <Thumb
                  category={p.category}
                  className="h-36 w-full"
                  label={`Foto contoh ${p.name}`}
                />
                <div className="space-y-2 p-5">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={p.status} />
                    <span className="text-xs">{DUSUN_SHORT[p.dusun]}</span>
                  </div>
                  <h3 className="text-lg">{p.name}</h3>
                  <div className="text-sm">
                    Anggaran <b className="text-navy">{rp(p.anggaran)}</b>
                  </div>
                  <ProgressBar value={p.progress} tone={tone(p.status)} />
                </div>
              </Link>
            ))}
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <MapView
              height={460}
              pins={list.map((p) => ({
                id: p.id,
                lat: p.lat,
                lng: p.lng,
                label: p.name,
                color: hl === p.id ? "#F2B632" : "#0F8B8D",
                onClick: () => nav(`/pembangunan/${p.id}`),
              }))}
            />
            <p className="mt-2 text-xs text-slate-500">
              Klik pin untuk membuka detail kegiatan.
            </p>
          </div>
        </div>
      </Container>
    </>
  )
}

export function ProjectDetail() {
  const { id } = useParams()
  const { projects, reports } = useApp()
  const p = projects.find((x) => x.id === Number(id))
  const nav = useNavigate()
  if (!p)
    return (
      <Container className="py-16">
        <EmptyState
          icon={HardHat}
          title="Kegiatan tidak ditemukan"
          action={<Button onClick={() => nav("/pembangunan")}>Kembali</Button>}
        />
      </Container>
    )
  const related = reports.filter((r) => r.projectId === p.id)
  return (
    <Container className="py-8">
      <Link
        to="/pembangunan"
        className="mb-4 inline-flex min-h-11 items-center gap-1 font-bold text-teal"
      >
        <ArrowLeft size={18} />
        Semua kegiatan
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div>
            <StatusBadge status={p.status} />
            <h1 className="mt-2 text-[30px] sm:text-[36px]">{p.name}</h1>
            <p className="mt-2 text-lg">{p.desc}</p>
          </div>
          <Card>
            <h2 className="mb-4 text-xl">Galeri Progres Foto</h2>
            <div className="grid grid-cols-3 gap-3">
              {[0, 50, 100].map((m) => {
                const ok = p.progress >= m
                return (
                  <div key={m} className="text-center">
                    {ok ? (
                      <Thumb
                        category={p.category}
                        className="h-28 w-full rounded-xl sm:h-36"
                        label={`Foto progres ${m}%`}
                      />
                    ) : (
                      <div className="flex h-28 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400 sm:h-36">
                        <Lock />
                      </div>
                    )}
                    <div className="mt-1.5 text-sm font-bold text-navy">
                      {m}%
                    </div>
                    <div className="text-xs">
                      {ok ? "Tersedia" : "Belum tercapai"}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
          {related.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl">Laporan warga terkait</h2>
              <div className="space-y-4">
                {related.map((r) => (
                  <ReportCard key={r.ticket} r={r} row />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-5">
          <Card className="space-y-4">
            <div>
              <div className="text-sm">Anggaran</div>
              <div className="text-2xl font-extrabold text-navy">
                {rp(p.anggaran)}
              </div>
            </div>
            <div>
              <div className="mb-1 text-sm">
                Realisasi: {rp(p.realisasi)} ({pct(p.realisasi, p.anggaran)}%)
              </div>
              <ProgressBar value={pct(p.realisasi, p.anggaran)} tone="yellow" />
            </div>
            <div>
              <div className="mb-1 text-sm">Progres fisik</div>
              <ProgressBar value={p.progress} tone={tone(p.status)} />
            </div>
            <ul className="space-y-2 border-t border-line pt-4 text-sm">
              <li className="flex gap-2">
                <MapPin size={18} className="text-teal" />
                {DUSUN_SHORT[p.dusun]}, Desa Lelea
              </li>
              <li className="flex gap-2">
                <HardHat size={18} className="text-teal" />
                Bidang {p.bidang}
              </li>
              <li className="flex gap-2">
                <Calendar size={18} className="text-teal" />
                Mulai {fmtDate(p.date)}
              </li>
            </ul>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => nav(`/lapor?project=${p.id}`)}
            >
              <Flag size={18} />
              Laporkan masalah kegiatan ini
            </Button>
          </Card>
          <MapView
            height={240}
            pins={[{ id: p.id, lat: p.lat, lng: p.lng, label: p.name }]}
          />
          <Callout>
            Realisasi anggaran {pct(p.realisasi, p.anggaran)}% dan progres fisik{" "}
            {p.progress}%. Bila keduanya jauh berbeda, warga bisa melaporkannya.
          </Callout>
        </div>
      </div>
    </Container>
  )
}
