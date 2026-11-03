import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react"
import { Link } from "react-router"
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock,
  Droplets,
  FileText,
  HeartHandshake,
  IdCard,
  Inbox,
  Lightbulb,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Store,
  Trash2,
  Waves,
  X,
  XCircle,
  BadgeCheck,
  Loader,
  ShieldAlert,
  Construction,
  Lamp,
  type LucideIcon,
} from "lucide-react"
import { useApp } from "../lib/store"
import {
  CENTER,
  isClosed,
  isLate,
  slaDue,
  type CatId,
  type Report,
} from "../lib/mock"
import { fmtDateTime } from "../lib/format"

export const cx = (...a: (string | false | undefined | null)[]) =>
  a.filter(Boolean).join(" ")

/* ---------- Buttons ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "yellow"
}
export function Button({ variant = "primary", className, ...p }: BtnProps) {
  const v = {
    primary: "bg-teal text-white hover:bg-teal-deep border-2 border-teal",
    secondary: "bg-white text-teal border-2 border-teal hover:bg-pale",
    danger: "bg-bad text-white border-2 border-bad hover:opacity-90",
    ghost: "bg-transparent text-navy border-2 border-transparent hover:bg-pale",
    yellow: "bg-sun text-navy border-2 border-sun hover:brightness-95",
  }[variant]
  return (
    <button
      {...p}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        v,
        className,
      )}
    />
  )
}
export const LinkButton = ({
  to,
  variant = "primary",
  className,
  children,
}: {
  to: string
  variant?: "primary" | "secondary"
  className?: string
  children: ReactNode
}) => (
  <Link
    to={to}
    className={cx(
      "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-bold transition border-2",
      variant === "primary"
        ? "bg-teal text-white border-teal hover:bg-teal-deep"
        : "bg-white text-teal border-teal hover:bg-pale",
      className,
    )}
  >
    {children}
  </Link>
)

/* ---------- Layout bits ---------- */
export const Container = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <div className={cx("mx-auto w-full max-w-[1200px] px-4 sm:px-6", className)}>
    {children}
  </div>
)
export const Card = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <div
    className={cx(
      "rounded-card border border-line bg-white p-5 shadow-soft sm:p-6",
      className,
    )}
  >
    {children}
  </div>
)
export const Section = ({
  children,
  pale,
  className,
}: {
  children: ReactNode
  pale?: boolean
  className?: string
}) => (
  <section className={cx("relative py-14 sm:py-16", pale && "bg-pale/60", className)}>
    <Container>{children}</Container>
  </section>
)
export const SectionHead = ({
  title,
  sub,
  action,
}: {
  title: string
  sub?: string
  action?: ReactNode
}) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h2 className="text-[28px] sm:text-[32px]">{title}</h2>
      {sub && <p className="mt-1 max-w-2xl">{sub}</p>}
    </div>
    {action}
  </div>
)
export const PageHeader = ({
  title,
  sub,
  children,
}: {
  title: string
  sub?: string
  children?: ReactNode
}) => (
  <div className="bg-gradient-to-b from-pale to-white pb-8 pt-10">
    <Container className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[32px] sm:text-[40px]">{title}</h1>
        {sub && <p className="mt-2 max-w-2xl">{sub}</p>}
      </div>
      {children}
    </Container>
  </div>
)
export const DataBadge = () => (
  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800 border border-green-200">
    Data Real — PERBUP No.223/2024
  </span>
)

export const IconCircle = ({
  icon: I,
  tone = "teal",
  size = 48,
}: {
  icon: LucideIcon
  tone?: "teal" | "yellow" | "blue" | "red" | "green"
  size?: number
}) => {
  const t = {
    teal: "bg-pale text-teal",
    yellow: "bg-sun/20 text-[#8a6410]",
    blue: "bg-info/10 text-info",
    red: "bg-bad/10 text-bad",
    green: "bg-ok/10 text-ok",
  }[tone]
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        t,
      )}
      style={{ width: size, height: size }}
    >
      <I size={size * 0.46} strokeWidth={2} />
    </span>
  )
}
export const StatCard = ({
  icon,
  value,
  label,
  tone,
  note,
}: {
  icon: LucideIcon
  value: ReactNode
  label: string
  tone?: "teal" | "yellow" | "blue" | "red" | "green"
  note?: string
}) => (
  <div className="flex items-center gap-4 rounded-card border border-line bg-white p-5 shadow-soft">
    <IconCircle icon={icon} tone={tone} />
    <div className="min-w-0">
      <div className="text-[28px] font-extrabold leading-tight text-navy">
        {value}
      </div>
      <div className="text-sm font-medium">{label}</div>
      {note && <div className="text-xs text-slate-500">{note}</div>}
    </div>
  </div>
)

/* ---------- Status ---------- */
const BADGES: Record<string, { icon: LucideIcon; cls: string }> = {
  Diterima: { icon: Inbox, cls: "bg-slate-100 text-slate-700" },
  Diverifikasi: { icon: BadgeCheck, cls: "bg-info/10 text-blue-700" },
  Diproses: { icon: Loader, cls: "bg-sun/25 text-[#7a5a0a]" },
  Selesai: { icon: CheckCircle2, cls: "bg-ok/15 text-[#1f7a43]" },
  Ditolak: { icon: XCircle, cls: "bg-bad/10 text-[#b02e2e]" },
  Terlambat: {
    icon: AlertTriangle,
    cls: "border border-bad bg-white text-[#b02e2e]",
  },
  Diajukan: { icon: Inbox, cls: "bg-slate-100 text-slate-700" },
  Diperiksa: { icon: BadgeCheck, cls: "bg-info/10 text-blue-700" },
  "Siap diambil": { icon: CheckCircle2, cls: "bg-ok/15 text-[#1f7a43]" },
  Direncanakan: { icon: Clock, cls: "bg-slate-100 text-slate-700" },
  Berjalan: { icon: Loader, cls: "bg-sun/25 text-[#7a5a0a]" },
  Tinggi: { icon: ShieldAlert, cls: "bg-bad/10 text-[#b02e2e]" },
  Normal: { icon: CircleDot, cls: "bg-slate-100 text-slate-700" },
}
export const StatusBadge = ({ status }: { status: string }) => {
  const b = BADGES[status] ?? BADGES.Diterima
  const I = b.icon
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold",
        b.cls,
      )}
    >
      <I size={14} strokeWidth={2.2} />
      {status}
    </span>
  )
}
export const ProgressBar = ({
  value,
  tone = "teal",
  label,
}: {
  value: number
  tone?: "teal" | "yellow" | "green" | "red"
  label?: boolean
}) => {
  const c = {
    teal: "bg-teal",
    yellow: "bg-sun",
    green: "bg-ok",
    red: "bg-bad",
  }[tone]
  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cx("h-full rounded-full transition-all", c)}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      {label !== false && (
        <span className="w-10 text-right text-xs font-bold text-navy">
          {value}%
        </span>
      )}
    </div>
  )
}
export const slaInfo = (r: Report) => {
  if (r.status === "Selesai")
    return { tone: "green" as const, text: "Laporan telah selesai", pct: 100 }
  if (r.status === "Ditolak")
    return { tone: "red" as const, text: "Laporan ditutup", pct: 100 }
  const left = slaDue(r) - Date.now()
  const total = r.slaDays * 86400000
  const h = Math.abs(Math.round(left / 3600000))
  const txt = h >= 24 ? `${Math.floor(h / 24)} hari ${h % 24} jam` : `${h} jam`
  if (left < 0)
    return { tone: "red" as const, text: `Terlambat ${txt}`, pct: 100 }
  return {
    tone: left / total > 0.4 ? "green" as const : "yellow" as const,
    text: `Sisa waktu ${txt}`,
    pct: Math.round(((total - left) / total) * 100),
  }
}
export function SLAIndicator({
  report,
  compact,
}: {
  report: Report
  compact?: boolean
}) {
  const s = slaInfo(report)
  const col = {
    green: "text-[#1f7a43]",
    yellow: "text-[#8a6410]",
    red: "text-[#b02e2e]",
  }[s.tone]
  if (compact)
    return (
      <span
        className={cx("inline-flex items-center gap-1 text-xs font-bold", col)}
      >
        <Clock size={14} />
        {s.text}
      </span>
    )
  return (
    <div>
      <div
        className={cx("mb-2 flex items-center gap-2 text-sm font-bold", col)}
      >
        <Clock size={18} />
        {s.text}
      </div>
      <ProgressBar value={s.pct} tone={s.tone} label={false} />
      <p className="mt-2 text-xs text-slate-500">
        Batas waktu tanggapan: {report.slaDays} hari sejak laporan masuk.
      </p>
    </div>
  )
}
export const LateBadge = ({ r }: { r: Report }) =>
  isLate(r) ? <StatusBadge status="Terlambat" /> : null

export interface TLItem {
  title: string
  note?: string
  at?: string
  done: boolean
  photo?: string
}
export function Timeline({ items }: { items: TLItem[] }) {
  return (
    <ol className="relative">
      {items.map((it, i) => (
        <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
          {i < items.length - 1 && (
            <span
              className={cx(
                "absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5",
                it.done && items[i + 1].done ? "bg-teal" : "bg-line",
              )}
            />
          )}
          <span
            className={cx(
              "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
              it.done
                ? "border-teal bg-teal text-white"
                : "border-line bg-white text-slate-400",
            )}
          >
            {it.done ? (
              <Check size={16} strokeWidth={3} />
            ) : (
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            )}
          </span>
          <div className="min-w-0 pt-0.5">
            <div
              className={cx(
                "font-bold",
                it.done ? "text-navy" : "text-slate-400",
              )}
            >
              {it.title}
            </div>
            {it.at && (
              <div className="text-xs text-slate-500">{fmtDateTime(it.at)}</div>
            )}
            {it.note && <p className="mt-1 text-sm">{it.note}</p>}
            {it.photo && (
              <div className="mt-2">
                <div className="mb-1 text-xs font-semibold text-navy">
                  Foto bukti penyelesaian
                </div>
                <img
                  src={it.photo}
                  alt="Foto bukti penyelesaian"
                  className="h-24 w-36 rounded-xl object-cover"
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
export function reportTimeline(r: Report): TLItem[] {
  const steps = ["Diterima", "Diverifikasi", "Diproses", "Selesai"]
  const items: TLItem[] = steps.map((s) => {
    const u = [...r.updates].reverse().find((x) => x.status === s)
    const doneIdx = steps.indexOf(r.status)
    const done = r.status === "Ditolak" ? !!u : steps.indexOf(s) <= doneIdx
    return { title: s, done, at: u?.at, note: u?.note, photo: u?.photo }
  })
  const rej = r.updates.find((x) => x.status === "Ditolak")
  if (rej)
    items.push({ title: "Ditolak", done: true, at: rej.at, note: rej.note })
  return items.filter((i) => !(r.status === "Ditolak" && i.title === "Selesai"))
}

export const Callout = ({
  children,
  title = "Dalam bahasa sederhana",
}: {
  children: ReactNode
  title?: string
}) => (
  <div className="flex gap-3 rounded-xl bg-pale p-4 text-sm">
    <IconCircle icon={Lightbulb} tone="yellow" size={36} />
    <div>
      <div className="font-bold text-navy">{title}</div>
      <div className="text-[#334155]">{children}</div>
    </div>
  </div>
)
export const EmptyState = ({
  icon = Search,
  title,
  text,
  action,
}: {
  icon?: LucideIcon
  title: string
  text?: string
  action?: ReactNode
}) => (
  <div className="flex flex-col items-center rounded-card border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
    <IconCircle icon={icon} size={64} />
    <h3 className="mt-4 text-xl">{title}</h3>
    {text && <p className="mt-1 max-w-md">{text}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
)
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cx("animate-pulse rounded-xl bg-slate-200/70", className)} />
)

export function ToastHost() {
  const { toasts } = useApp()
  return (
    <div
      className="fixed right-4 top-20 z-[100] flex w-[min(92vw,360px)] flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            "fade-up flex items-center gap-3 rounded-xl border bg-white p-3 pr-4 shadow-lg",
            t.kind === "ok" ? "border-ok/40" : "border-bad/40",
          )}
        >
          <IconCircle
            icon={t.kind === "ok" ? Check : X}
            tone={t.kind === "ok" ? "green" : "red"}
            size={32}
          />
          <span className="text-sm font-semibold text-navy">{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- Form pieces ---------- */
export const inputCls =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-[15px] text-navy placeholder:text-slate-400 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
export const Field = ({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-bold text-navy">{label}</span>
    {children}
    {hint && !error && (
      <span className="mt-1 block text-xs text-slate-500">{hint}</span>
    )}
    {error && (
      <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-bad">
        <AlertTriangle size={13} />
        {error}
      </span>
    )}
  </label>
)
export const Select = ({
  className,
  ...p
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select
      {...p}
      className={cx(inputCls, "appearance-none pr-9", className)}
    />
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
    />
  </div>
)
export const Chip = ({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: ReactNode
}) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={cx(
      "min-h-9 rounded-full border px-3.5 text-sm font-semibold transition",
      active
        ? "border-teal bg-teal text-white"
        : "border-slate-300 bg-white text-navy hover:border-teal",
    )}
  >
    {children}
  </button>
)
export const Tabs = ({
  tabs,
  value,
  onChange,
}: {
  tabs: string[]
  value: string
  onChange: (v: string) => void
}) => (
  <div
    role="tablist"
    className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line"
  >
    {tabs.map((t) => (
      <button
        key={t}
        role="tab"
        aria-selected={value === t}
        onClick={() => onChange(t)}
        className={cx(
          "min-h-11 whitespace-nowrap border-b-[3px] px-4 text-[15px] font-bold transition",
          value === t
            ? "border-teal text-teal"
            : "border-transparent text-slate-500 hover:text-navy",
        )}
      >
        {t}
      </button>
    ))}
  </div>
)
export const Stars = ({
  value,
  onChange,
}: {
  value: number
  onChange?: (n: number) => void
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={!onChange}
        onClick={() => onChange?.(n)}
        aria-label={`${n} bintang`}
      >
        <Star
          size={26}
          className={n <= value ? "fill-sun text-sun" : "text-slate-300"}
        />
      </button>
    ))}
  </div>
)

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-navy/50 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={cx(
          "fade-up max-h-[90vh] w-full overflow-y-auto rounded-card bg-white p-6 shadow-2xl",
          wide ? "max-w-2xl" : "max-w-md",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-xl">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1 hover:bg-pale"
          >
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
export function SlideOver({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] bg-navy/40" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className="slide-in absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <h3 className="text-xl">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1 hover:bg-pale"
          >
            <X />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex gap-3 border-t border-line bg-white p-4">
            {footer}
          </div>
        )}
      </aside>
    </div>
  )
}
export const ConfirmDelete = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Hapus"
    className="rounded-lg p-2 text-bad hover:bg-bad/10"
  >
    <Trash2 size={18} />
  </button>
)

/* ---------- Category icon + thumbnail ---------- */
const CAT_ICON: Record<CatId, LucideIcon> = {
  jalan: Construction,
  irigasi: Waves,
  sampah: Trash2,
  lampu: Lamp,
  air: Droplets,
  dugaan: ShieldAlert,
}
export const CatIcon = ({
  id,
  size = 48,
  tone,
}: {
  id: CatId
  size?: number
  tone?: "teal" | "yellow" | "blue" | "red" | "green"
}) => (
  <IconCircle
    icon={CAT_ICON[id]}
    size={size}
    tone={tone ?? (id === "dugaan" ? "red" : "teal")}
  />
)
const THUMB_BG: Record<CatId, string> = {
  jalan: "from-slate-300 to-slate-100",
  irigasi: "from-sky-200 to-teal-100",
  sampah: "from-amber-200 to-lime-100",
  lampu: "from-yellow-200 to-orange-100",
  air: "from-cyan-200 to-sky-100",
  dugaan: "from-rose-200 to-orange-50",
}
export function Thumb({
  category,
  src,
  className,
  label,
}: {
  category: CatId
  src?: string
  className?: string
  label?: string
}) {
  const I = CAT_ICON[category]
  if (src)
    return (
      <img
        src={src}
        alt={label ?? "Foto laporan"}
        className={cx("object-cover", className)}
      />
    )
  return (
    <div
      role="img"
      aria-label={label ?? `Foto contoh ${category}`}
      className={cx(
        "relative flex items-center justify-center bg-gradient-to-br",
        THUMB_BG[category],
        className,
      )}
    >
      <I className="text-navy/40" size={40} strokeWidth={1.6} />
      <span className="absolute bottom-1.5 left-2 rounded bg-white/70 px-1.5 text-[10px] font-bold text-navy/70">
        Foto contoh
      </span>
    </div>
  )
}



export interface Pin {
  id: string | number
  lat: number
  lng: number
  label: string
  color?: string
  onClick?: () => void
}

/* ---------- Leaflet real map ---------- */
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import MarkerClusterGroup from "react-leaflet-cluster"

// Fix ikon default leaflet
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"
L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function FitBounds({ pins }: { pins: Pin[] }) {
  const map = useMap()
  useEffect(() => {
    if (!pins.length) return
    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 15, { animate: true })
      return
    }
    const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [40, 40], animate: true, maxZoom: 16 })
  }, [pins, map])
  return null
}

function makePin(color: string, draggable: boolean) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z"
      fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="18" cy="17" r="7" fill="white" opacity="0.85"/>
  </svg>`
  return L.divIcon({
    html: svg,
    className: draggable ? "lm-pin lm-pin-drag" : "lm-pin",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  })
}

const DEFAULT_ICON = makePin("#0F8B8D", false)
const DRAG_ICON = makePin("#D64545", true)

export function LeafletMap({
  pins = [],
  height = 400,
  drag,
  className,
}: {
  pins?: Pin[]
  height?: number
  drag?: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }
  className?: string
}) {
  const center: [number, number] = [CENTER.lat, CENTER.lng]

  return (
    <div className={cx("relative overflow-hidden rounded-card border border-line", className)} style={{ height }}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup chunkedLoading>
          {pins.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={makePin(p.color ?? "#0F8B8D", false)}
              eventHandlers={{ click: () => p.onClick?.() }}
            >
              {p.label && <Popup>{p.label}</Popup>}
            </Marker>
          ))}
        </MarkerClusterGroup>
        {drag && (
          <Marker
            position={[drag.lat, drag.lng]}
            icon={DRAG_ICON}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng()
                drag.onChange(lat, lng)
              },
            }}
          >
            <Popup>Seret untuk memperbarui lokasi</Popup>
          </Marker>
        )}
        {pins.length > 0 && <FitBounds pins={pins} />}
      </MapContainer>
    </div>
  )
}

export { LeafletMap as MapView }

export const Notice = ({ children }: { children: ReactNode }) => (
  <div className="flex items-start gap-2 rounded-xl bg-info/10 p-3 text-sm text-blue-900">
    <ShieldCheck size={18} className="mt-0.5 shrink-0" />
    {children}
  </div>
)

export const BellIcon = Bell
export { FileText, HeartHandshake, IdCard, Store }
