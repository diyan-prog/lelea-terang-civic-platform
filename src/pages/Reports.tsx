import { useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router"
import {
  ArrowLeft,
  Eye,
  Flag,
  List,
  MapIcon,
  Search,
  SearchX,
  Star,
  Users,
  EyeOff,
  Link2,
} from "lucide-react"
import {
  Button,
  Card,
  Chip,
  Container,
  EmptyState,
  Field,
  MapView,
  PageHeader,
  SLAIndicator,
  Select,
  StatusBadge,
  Stars,
  Thumb,
  Timeline,
  LateBadge,
  CatIcon,
  LinkButton,
  inputCls,
  reportTimeline,
  cx,
} from "../components/ui"
import { ReportCard } from "../components/ReportCard"
import { actions, toast, useApp } from "../lib/store"
import {
  CATEGORIES,
  DUSUN_SHORT,
  catLabel,
  isLate,
  priorityOf,
  type RStatus,
} from "../lib/mock"
import { fmtDateTime, timeAgo } from "../lib/format"

const PER = 6
const STATUSES: RStatus[] = [
  "Diterima",
  "Diverifikasi",
  "Diproses",
  "Selesai",
  "Ditolak",
]

export function ReportList() {
  const { reports } = useApp()
  const [q, setQ] = useState("")
  const [st, setSt] = useState("")
  const [cat, setCat] = useState("")
  const [dus, setDus] = useState("")
  const [late, setLate] = useState(false)
  const [mism, setMism] = useState(false)
  const [view, setView] = useState<"list" | "map">("list")
  const [page, setPage] = useState(1)
  const list = useMemo(
    () =>
      reports.filter(
        (r) =>
          (!q ||
            (r.title + r.ticket).toLowerCase().includes(q.toLowerCase())) &&
          (!st || r.status === st) &&
          (!cat || r.category === cat) &&
          (!dus || r.dusun === +dus) &&
          (!late || isLate(r)) &&
          (!mism || r.mismatch),
      ),
    [reports, q, st, cat, dus, late, mism],
  )
  const pages = Math.max(1, Math.ceil(list.length / PER))
  const cur = Math.min(page, pages)
  const reset = (fn: () => void) => {
    fn()
    setPage(1)
  }
  return (
    <>
      <PageHeader
        title="Laporan Warga"
        sub="Semua laporan terbuka untuk publik. Nama pelapor tidak ditampilkan."
      >
        <LinkButton to="/lapor">Buat Laporan</LinkButton>
      </PageHeader>
      <Container className="space-y-5 py-6">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_200px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              aria-label="Cari laporan"
              className={cx(inputCls, "pl-10")}
              placeholder="Cari judul atau kode tiket"
              value={q}
              onChange={(e) => reset(() => setQ(e.target.value))}
            />
          </div>
          <Select
            aria-label="Kategori"
            value={cat}
            onChange={(e) => reset(() => setCat(e.target.value))}
          >
            <option value="">Semua kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Dusun"
            value={dus}
            onChange={(e) => reset(() => setDus(e.target.value))}
          >
            <option value="">Semua dusun</option>
            {DUSUN_SHORT.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </Select>
          <div
            className="flex rounded-xl border border-slate-300 bg-white p-1"
            role="group"
            aria-label="Tampilan"
          >
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={cx(
                "flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-bold",
                view === "list" ? "bg-teal text-white" : "text-navy",
              )}
            >
              <List size={16} />
              Daftar
            </button>
            <button
              onClick={() => setView("map")}
              aria-pressed={view === "map"}
              className={cx(
                "flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-bold",
                view === "map" ? "bg-teal text-white" : "text-navy",
              )}
            >
              <MapIcon size={16} />
              Peta
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={!st} onClick={() => reset(() => setSt(""))}>
            Semua status
          </Chip>
          {STATUSES.map((s) => (
            <Chip
              key={s}
              active={st === s}
              onClick={() => reset(() => setSt(st === s ? "" : s))}
            >
              {s}
            </Chip>
          ))}
          <span className="mx-1 hidden w-px bg-line sm:block" />
          <Chip active={late} onClick={() => reset(() => setLate(!late))}>
            Terlambat
          </Chip>
          <Chip active={mism} onClick={() => reset(() => setMism(!mism))}>
            Tidak sesuai data proyek
          </Chip>
        </div>
        <p className="text-sm" aria-live="polite">
          {list.length} laporan ditemukan
        </p>
        {list.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Laporan tidak ditemukan"
            text="Coba kata kunci lain atau hapus beberapa filter."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQ("")
                  setSt("")
                  setCat("")
                  setDus("")
                  setLate(false)
                  setMism(false)
                }}
              >
                Hapus Semua Filter
              </Button>
            }
          />
        ) : view === "map" ? (
          <MapView
            height={520}
            pins={list.map((r) => ({
              id: r.ticket,
              lat: r.lat,
              lng: r.lng,
              label: `${r.title} (${r.status})`,
              color:
                r.status === "Selesai"
                  ? "#2F9E5B"
                  : isLate(r)
                    ? "#D64545"
                    : "#0F8B8D",
              onClick: () => (location.href = `/laporan/${r.ticket}`),
            }))}
          />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {list.slice((cur - 1) * PER, cur * PER).map((r) => (
                <ReportCard key={r.ticket} r={r} />
              ))}
            </div>
            {pages > 1 && (
              <nav
                aria-label="Halaman"
                className="flex items-center justify-center gap-2 pt-4"
              >
                <Button
                  variant="secondary"
                  disabled={cur === 1}
                  onClick={() => setPage(cur - 1)}
                >
                  Sebelumnya
                </Button>
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    aria-current={cur === i + 1}
                    className={cx(
                      "h-11 w-11 rounded-xl font-bold",
                      cur === i + 1
                        ? "bg-teal text-white"
                        : "text-navy hover:bg-pale",
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <Button
                  variant="secondary"
                  disabled={cur === pages}
                  onClick={() => setPage(cur + 1)}
                >
                  Berikutnya
                </Button>
              </nav>
            )}
          </>
        )}
      </Container>
    </>
  )
}

export function ReportDetail() {
  const { ticket } = useParams()
  const { reports, projects } = useApp()
  const r = reports.find((x) => x.ticket === ticket)
  const [rate, setRate] = useState(0)
  const [comment, setComment] = useState("")
  if (!r)
    return (
      <Container className="py-16">
        <EmptyState
          icon={SearchX}
          title="Laporan tidak ditemukan"
          text={`Tiket ${ticket} tidak ada dalam data kami.`}
          action={<LinkButton to="/lacak">Lacak Tiket Lain</LinkButton>}
        />
      </Container>
    )
  const proj = r.projectId
    ? projects.find((p) => p.id === r.projectId)
    : undefined
  const photos = r.photos.length ? r.photos : [undefined]
  return (
    <Container className="py-8">
      <Link
        to="/laporan"
        className="mb-4 inline-flex min-h-11 items-center gap-1 font-bold text-teal"
      >
        <ArrowLeft size={18} />
        Semua laporan
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={r.status} />
              <LateBadge r={r} />
              {priorityOf(r) === "Tinggi" && <StatusBadge status="Tinggi" />}
              <span className="text-sm font-bold text-slate-500">
                {r.ticket}
              </span>
            </div>
            <h1 className="text-[28px] sm:text-[34px]">{r.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <CatIcon id={r.category} size={22} />
                {catLabel(r.category)}
              </span>
              <span>
                {DUSUN_SHORT[r.dusun]}, RW {r.rw}
              </span>
              <span>{timeAgo(r.createdAt)}</span>
              <span>
                {r.anonymous
                  ? "Pelapor: Anonim"
                  : `Pelapor: warga ${r.reporter.split(" ")[0]}`}
              </span>
            </p>
          </div>
          <div
            className={cx("grid gap-3", photos.length > 1 ? "grid-cols-3" : "")}
          >
            {photos.map((p, i) => (
              <Thumb
                key={i}
                category={r.category}
                src={p}
                className={cx(
                  "w-full rounded-card",
                  photos.length > 1 ? "h-32" : "h-64",
                )}
              />
            ))}
          </div>
          <Card>
            <h2 className="mb-2 text-lg">Penjelasan</h2>
            <p>{r.desc}</p>
          </Card>
          {proj && r.mismatch && (
            <div className="rounded-card border-2 border-sun bg-sun/10 p-5">
              <div className="flex items-start gap-3">
                <Flag className="mt-1 shrink-0 text-[#8a6410]" />
                <div>
                  <div className="font-bold text-navy">
                    Terkait kegiatan: {proj.name} (selesai {proj.progress}%)
                  </div>
                  <p className="mt-1 text-sm">
                    Kondisi lapangan dilaporkan tidak sesuai data proyek.
                  </p>
                  <Link
                    to={`/pembangunan/${proj.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-teal"
                  >
                    <Link2 size={14} />
                    Lihat data kegiatan
                  </Link>
                </div>
              </div>
            </div>
          )}
          {proj && !r.mismatch && (
            <p className="text-sm">
              Terkait kegiatan:{" "}
              <Link
                className="font-bold text-teal"
                to={`/pembangunan/${proj.id}`}
              >
                {proj.name}
              </Link>
            </p>
          )}
          {r.status === "Selesai" && (
            <Card>
              <h2 className="mb-1 text-lg">Beri penilaian</h2>
              {r.rating ? (
                <div className="flex items-center gap-3">
                  <Stars value={r.rating} />
                  <span className="text-sm">
                    Terima kasih atas penilaian Anda.
                  </span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!rate) return toast("Pilih jumlah bintang dulu", "err")
                    actions.rateReport(r.ticket, rate)
                    toast("Terima kasih atas penilaiannya")
                  }}
                  className="space-y-3"
                >
                  <p className="text-sm">
                    Seberapa puas Anda dengan penyelesaian laporan ini?
                  </p>
                  <Stars value={rate} onChange={setRate} />
                  <Field label="Komentar (opsional)">
                    <textarea
                      rows={2}
                      className={cx(inputCls, "py-2")}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </Field>
                  <Button type="submit">Kirim Penilaian</Button>
                </form>
              )}
            </Card>
          )}
        </div>
        <div className="space-y-5">
          <Card>
            <h2 className="mb-3 text-lg">Batas Waktu Tanggapan</h2>
            <SLAIndicator report={r} />
          </Card>
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Users size={18} className="text-teal" />
                <b className="text-navy">{r.confirmations}</b> warga
                mengonfirmasi
              </div>
              <Button
                variant={r.confirmed ? "ghost" : "secondary"}
                disabled={r.confirmed}
                onClick={() => {
                  actions.confirmReport(r.ticket)
                  toast("Konfirmasi Anda dicatat")
                }}
              >
                <Eye size={16} />
                {r.confirmed ? "Sudah dikonfirmasi" : "Saya juga melihat ini"}
              </Button>
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 text-lg">Riwayat Penanganan</h2>
            <Timeline items={reportTimeline(r)} />
          </Card>
          <MapView
            height={220}
            pins={[
              {
                id: r.ticket,
                lat: r.lat,
                lng: r.lng,
                label: r.title,
                color: "#D64545",
              },
            ]}
          />
        </div>
      </div>
    </Container>
  )
}

export function Track() {
  const { reports } = useApp()
  const [sp] = useSearchParams()
  const [code, setCode] = useState(sp.get("t") ?? "")
  const [q, setQ] = useState(sp.get("t") ?? "")
  const [err, setErr] = useState("")
  const r = q
    ? reports.find((x) => x.ticket.toLowerCase() === q.trim().toLowerCase())
    : undefined
  return (
    <>
      <PageHeader
        title="Lacak Laporan"
        sub="Masukkan kode tiket yang Anda terima setelah membuat laporan."
      />
      <Container className="max-w-xl py-8">
        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!code.trim())
                return setErr("Masukkan kode tiket terlebih dahulu")
              setErr("")
              setQ(code.trim())
            }}
            className="space-y-3"
          >
            <Field label="Masukkan kode tiket" error={err}>
              <input
                className={inputCls}
                placeholder="LT-202610-0012"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </Field>
            <Button type="submit" className="w-full">
              <Search size={18} />
              Lacak
            </Button>
          </form>
        </Card>
        {q && !r && (
          <div className="mt-6">
            <EmptyState
              icon={SearchX}
              title="Tiket tidak ditemukan"
              text={`Kode ${q} tidak ada. Periksa kembali huruf dan angkanya, contoh: LT-202610-0012.`}
            />
          </div>
        )}
        {r && (
          <Card className="fade-up mt-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={r.status} />
              <LateBadge r={r} />
              <span className="text-sm font-bold text-slate-500">
                {r.ticket}
              </span>
            </div>
            <div>
              <h2 className="text-xl">{r.title}</h2>
              <p className="text-sm">
                {DUSUN_SHORT[r.dusun]}, RW {r.rw} • dikirim{" "}
                {fmtDateTime(r.createdAt)}
              </p>
            </div>
            <SLAIndicator report={r} />
            <Timeline items={reportTimeline(r)} />
            <LinkButton
              to={`/laporan/${r.ticket}`}
              variant="secondary"
              className="w-full"
            >
              Lihat Detail Lengkap
            </LinkButton>
          </Card>
        )}
      </Container>
    </>
  )
}
