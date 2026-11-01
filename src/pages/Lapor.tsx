import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import {
  AlertTriangle,
  Camera,
  Check,
  Copy,
  Crosshair,
  Info,
  Share2,
  X,
} from "lucide-react"
import {
  Button,
  Card,
  CatIcon,
  Container,
  Field,
  IconCircle,
  LinkButton,
  MapView,
  PageHeader,
  Select,
  inputCls,
  cx,
} from "../components/ui"
import { actions, toast, useApp } from "../lib/store"
import {
  CATEGORIES,
  CENTER,
  DUSUN,
  catLabel,
  isClosed,
  type CatId,
  type Report,
} from "../lib/mock"
import { CheckCircle2 } from "lucide-react"

const STEPS = ["Kategori", "Detail", "Lokasi & Foto", "Konfirmasi"]

export default function Lapor() {
  const { reports, projects, user } = useApp()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const pid = Number(sp.get("project")) || undefined
  const [step, setStep] = useState(0)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [d, setD] = useState({
    category: "" as CatId | "",
    title: "",
    desc: "",
    projectId: pid ? String(pid) : "",
    mismatch: !!pid,
    dusun: user ? String(user.dusun) : "",
    rw: "",
    lat: CENTER.lat,
    lng: CENTER.lng,
    photos: [] as string[],
    anonymous: false,
  })
  const [done, setDone] = useState<Report | null>(null)
  const up = (p: Partial<typeof d>) => setD({ ...d, ...p })

  const similar = reports.filter(
    (r) =>
      d.category &&
      r.category === d.category &&
      d.dusun !== "" &&
      r.dusun === +d.dusun &&
      !isClosed(r),
  )

  const validate = (s: number) => {
    const e: Record<string, string> = {}
    if (s === 0 && !d.category) e.category = "Pilih salah satu kategori masalah"
    if (s === 1) {
      if (d.title.trim().length < 8) e.title = "Judul minimal 8 karakter"
      if (d.desc.trim().length < 20)
        e.desc = "Ceritakan masalahnya minimal 20 karakter"
    }
    if (s === 2) {
      if (d.dusun === "") e.dusun = "Pilih dusun"
      if (!d.rw) e.rw = "Pilih RW"
    }
    setErrs(e)
    return !Object.keys(e).length
  }
  const next = () => validate(step) && setStep(step + 1)
  const addPhotos = (files: FileList | null) => {
    if (!files) return
    const room = 3 - d.photos.length
    Array.from(files)
      .slice(0, room)
      .forEach((f) => {
        const rd = new FileReader()
        rd.onload = () =>
          setD((x) => ({
            ...x,
            photos: [...x.photos, rd.result as string].slice(0, 3),
          }))
        rd.readAsDataURL(f)
      })
  }
  const geo = () => {
    if (!navigator.geolocation)
      return toast("Lokasi tidak tersedia di perangkat ini", "err")
    navigator.geolocation.getCurrentPosition(
      (p) => {
        up({ lat: p.coords.latitude, lng: p.coords.longitude })
        toast("Lokasi Anda dipakai")
      },
      () => toast("Izin lokasi ditolak. Geser pin pada peta.", "err"),
    )
  }
  const submit = () => {
    if (![0, 1, 2].every(validate)) return
    const r = actions.addReport({
      title: d.title.trim(),
      desc: d.desc.trim(),
      category: d.category as CatId,
      dusun: +d.dusun,
      rw: d.rw,
      lat: d.lat,
      lng: d.lng,
      photos: d.photos,
      anonymous: d.anonymous,
      projectId: d.projectId ? +d.projectId : undefined,
      mismatch: d.mismatch && !!d.projectId,
    })
    setDone(r)
    toast("Laporan berhasil dikirim")
    window.scrollTo(0, 0)
  }

  if (done)
    return (
      <Container className="py-12">
        <Card className="mx-auto max-w-lg text-center">
          <div className="flex justify-center">
            <IconCircle icon={CheckCircle2} tone="green" size={80} />
          </div>
          <h1 className="mt-4 text-[28px]">Laporan terkirim!</h1>
          <p className="mt-1">
            Simpan kode tiket ini untuk melacak laporan Anda.
          </p>
          <div className="mt-5 rounded-2xl border-2 border-dashed border-teal bg-pale p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-teal">
              Kode Tiket
            </div>
            <div className="mt-1 text-[32px] font-extrabold tracking-wider text-navy">
              {done.ticket}
            </div>
            <div className="mt-3 flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(done.ticket)
                  toast("Kode tiket disalin")
                }}
              >
                <Copy size={16} />
                Salin
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const url = `${location.origin}/laporan/${done.ticket}`
                  if (navigator.share)
                    navigator
                      .share({ title: "Laporan Lelea Terang", url })
                      .catch(() => {})
                  else {
                    navigator.clipboard?.writeText(url)
                    toast("Tautan laporan disalin")
                  }
                }}
              >
                <Share2 size={16} />
                Bagikan
              </Button>
            </div>
          </div>
          <p className="mt-5 font-semibold text-navy">
            Kami akan menanggapi dalam 3 hari.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <LinkButton to={`/laporan/${done.ticket}`}>
              Lacak Laporan Ini
            </LinkButton>
            <LinkButton to="/" variant="secondary">
              Kembali ke Beranda
            </LinkButton>
          </div>
        </Card>
      </Container>
    )

  return (
    <>
      <PageHeader
        title="Buat Laporan Warga"
        sub="Empat langkah singkat. Laporan Anda akan terlihat publik tanpa menampilkan data pribadi."
      />
      <Container className="max-w-3xl py-8">
        <ol className="mb-8 flex items-center" aria-label="Langkah">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className="flex flex-1 items-center last:flex-none"
              aria-current={i === step ? "step" : undefined}
            >
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cx(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 font-extrabold",
                    i < step
                      ? "border-teal bg-teal text-white"
                      : i === step
                        ? "border-teal bg-white text-teal"
                        : "border-slate-300 bg-white text-slate-400",
                  )}
                >
                  {i < step ? <Check size={18} /> : i + 1}
                </span>
                <span
                  className={cx(
                    "hidden text-xs font-bold sm:block",
                    i <= step ? "text-navy" : "text-slate-400",
                  )}
                >
                  {s}
                </span>
              </div>
              {i < 3 && (
                <span
                  className={cx(
                    "mx-2 mb-5 h-0.5 flex-1 sm:mb-6",
                    i < step ? "bg-teal" : "bg-line",
                  )}
                />
              )}
            </li>
          ))}
        </ol>
        <p className="mb-4 text-sm font-bold text-teal sm:hidden">
          Langkah {step + 1}: {STEPS[step]}
        </p>

        <Card className="space-y-5">
          {step === 0 && (
            <>
              <h2 className="text-xl">Masalah apa yang ingin Anda laporkan?</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      up({ category: c.id })
                      setErrs({})
                    }}
                    aria-pressed={d.category === c.id}
                    className={cx(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition hover:border-teal",
                      d.category === c.id
                        ? "border-teal bg-pale"
                        : "border-line bg-white",
                    )}
                  >
                    <CatIcon id={c.id} size={56} />
                    <span className="font-bold text-navy">{c.label}</span>
                    <span className="text-xs">{c.hint}</span>
                  </button>
                ))}
              </div>
              {errs.category && (
                <p className="flex items-center gap-1 text-sm font-semibold text-bad">
                  <AlertTriangle size={14} />
                  {errs.category}
                </p>
              )}
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-xl">Ceritakan masalahnya</h2>
              <Field label="Judul laporan" error={errs.title}>
                <input
                  className={inputCls}
                  maxLength={90}
                  value={d.title}
                  onChange={(e) => up({ title: e.target.value })}
                  placeholder="Contoh: Jalan berlubang di depan balai desa"
                />
              </Field>
              <Field
                label="Penjelasan"
                error={errs.desc}
                hint={`${d.desc.length} karakter`}
              >
                <textarea
                  rows={5}
                  className={cx(inputCls, "py-3")}
                  value={d.desc}
                  onChange={(e) => up({ desc: e.target.value })}
                  placeholder="Sejak kapan terjadi, seberapa parah, siapa yang terdampak?"
                />
              </Field>
              <Field label="Terkait kegiatan pembangunan (opsional)">
                <Select
                  value={d.projectId}
                  onChange={(e) => up({ projectId: e.target.value })}
                >
                  <option value="">Tidak terkait kegiatan</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Field>
              {d.projectId && (
                <label className="flex items-start gap-3 rounded-xl border border-sun bg-sun/10 p-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 accent-teal"
                    checked={d.mismatch}
                    onChange={(e) => up({ mismatch: e.target.checked })}
                  />
                  <span>
                    <b className="text-navy">
                      Kondisi lapangan tidak sesuai data proyek.
                    </b>{" "}
                    Misalnya proyek tercatat selesai tetapi kenyataannya belum.
                    Laporan akan diberi prioritas tinggi.
                  </span>
                </label>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-xl">Di mana lokasinya?</h2>
              <MapView
                height={260}
                drag={{
                  lat: d.lat,
                  lng: d.lng,
                  onChange: (lat, lng) => up({ lat, lng }),
                }}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500">
                  Geser pin merah atau klik peta untuk menandai lokasi.
                </p>
                <Button variant="secondary" onClick={geo}>
                  <Crosshair size={18} />
                  Pakai lokasi saya
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Dusun" error={errs.dusun}>
                  <Select
                    value={d.dusun}
                    onChange={(e) => up({ dusun: e.target.value })}
                  >
                    <option value="">Pilih dusun</option>
                    {DUSUN.map((x, i) => (
                      <option key={x} value={i}>
                        {x}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="RW" error={errs.rw}>
                  <Select
                    value={d.rw}
                    onChange={(e) => up({ rw: e.target.value })}
                  >
                    <option value="">Pilih RW</option>
                    {["01", "02", "03", "04", "05"].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              {similar.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl bg-info/10 p-4 text-sm text-blue-900">
                  <Info size={20} className="shrink-0" />
                  <span className="flex-1 font-semibold">
                    Ada {similar.length} laporan serupa di dekat sini: “
                    {similar[0].title}”.
                  </span>
                  <Button
                    variant="secondary"
                    className="!min-h-10"
                    onClick={() => {
                      actions.confirmReport(similar[0].ticket)
                      toast("Terima kasih, konfirmasi Anda dicatat")
                      nav(`/laporan/${similar[0].ticket}`)
                    }}
                  >
                    Saya juga mengalami ini
                  </Button>
                </div>
              )}
              <div>
                <div className="mb-1.5 text-sm font-bold text-navy">
                  Foto (maksimal 3)
                </div>
                <div className="flex flex-wrap gap-3">
                  {d.photos.map((p, i) => (
                    <div key={i} className="relative h-24 w-24">
                      <img
                        src={p}
                        alt={`Foto laporan ${i + 1}`}
                        className="h-full w-full rounded-xl object-cover"
                      />
                      <button
                        aria-label="Hapus foto"
                        onClick={() =>
                          up({ photos: d.photos.filter((_, k) => k !== i) })
                        }
                        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-bad text-white shadow"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {d.photos.length < 3 && (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-teal text-xs font-bold text-teal hover:bg-pale focus-within:outline focus-within:outline-[3px] focus-within:outline-sun">
                      <Camera /> Tambah
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          addPhotos(e.target.files)
                          e.target.value = ""
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
              <label className="flex items-center justify-between gap-4 rounded-xl border border-line p-4">
                <span>
                  <b className="block text-navy">Kirim sebagai anonim</b>
                  <span className="text-sm">
                    Nama Anda tidak akan ditampilkan.
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={d.anonymous}
                  onClick={() => up({ anonymous: !d.anonymous })}
                  className={cx(
                    "relative h-7 w-12 shrink-0 rounded-full transition",
                    d.anonymous ? "bg-teal" : "bg-slate-300",
                  )}
                >
                  <span
                    className={cx(
                      "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all",
                      d.anonymous ? "left-[22px]" : "left-0.5",
                    )}
                  />
                </button>
              </label>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-xl">Periksa kembali laporan Anda</h2>
              <dl className="divide-y divide-line text-sm">
                {[
                  ["Kategori", d.category ? catLabel(d.category) : ""],
                  ["Judul", d.title],
                  ["Penjelasan", d.desc],
                  ["Lokasi", `${DUSUN[+d.dusun]}, RW ${d.rw}`],
                  ["Foto", `${d.photos.length} foto`],
                  [
                    "Pelapor",
                    d.anonymous
                      ? "Anonim"
                      : (user?.name ?? "Warga (nama tidak ditampilkan)"),
                  ],
                  [
                    "Kegiatan terkait",
                    d.projectId
                      ? projects.find((p) => p.id === +d.projectId)?.name +
                        (d.mismatch ? " (tidak sesuai data)" : "")
                      : "-",
                  ],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="grid gap-1 py-3 sm:grid-cols-[150px_1fr]"
                  >
                    <dt className="font-bold text-navy">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-start gap-2 rounded-xl bg-pale p-3 text-sm">
                <Info size={18} className="mt-0.5 shrink-0 text-teal" />
                Laporan akan tampil di halaman publik. Jangan menulis nomor KTP
                atau data pribadi orang lain.
              </div>
            </>
          )}
          <div className="flex justify-between gap-3 border-t border-line pt-5">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Kembali
              </Button>
            ) : (
              <Link to="/laporan">
                <Button variant="ghost">Batal</Button>
              </Link>
            )}
            {step < 3 ? (
              <Button onClick={next}>Lanjut</Button>
            ) : (
              <Button onClick={submit}>Kirim Laporan</Button>
            )}
          </div>
        </Card>
      </Container>
    </>
  )
}
