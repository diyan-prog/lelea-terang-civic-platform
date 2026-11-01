import { useState } from "react"
import { ChevronDown, CheckCircle2, FileText } from "lucide-react"
import { EmptyState, StatusBadge, Timeline, cx, type TLItem } from "./ui"
import { SERVICES, type ServiceReq, type SStatus } from "../lib/mock"
import { fmtDate } from "../lib/format"

export const SERVICE_FLOW: SStatus[] = [
  "Diajukan",
  "Diperiksa",
  "Siap diambil",
  "Selesai",
]
export const svcName = (id: string) =>
  SERVICES.find((s) => s.id === id)?.name ?? id
export function svcTimeline(s: ServiceReq): TLItem[] {
  const items: TLItem[] = SERVICE_FLOW.map((st) => {
    const u = [...s.updates].reverse().find((x) => x.status === st)
    const idx = SERVICE_FLOW.indexOf(s.status)
    return {
      title: st,
      done: s.status === "Ditolak" ? !!u : SERVICE_FLOW.indexOf(st) <= idx,
      at: u?.at,
      note: u?.note,
    }
  })
  const rej = s.updates.find((u) => u.status === "Ditolak")
  const base = rej ? items.filter((i) => i.done) : items
  return rej
    ? [...base, { title: "Ditolak", done: true, at: rej.at, note: rej.note }]
    : base
}

export function ServiceList({ list }: { list: ServiceReq[] }) {
  const [open, setOpen] = useState<string | null>(null)
  if (!list.length)
    return (
      <EmptyState
        icon={FileText}
        title="Belum ada pengajuan"
        text="Pengajuan surat Anda akan muncul di sini."
      />
    )
  return (
    <div className="space-y-3">
      {list.map((s) => (
        <div
          key={s.ticket}
          className="overflow-hidden rounded-card border border-line bg-white"
        >
          {s.status === "Siap diambil" && (
            <div className="flex items-center gap-2 bg-ok px-4 py-2.5 text-sm font-bold text-white">
              <CheckCircle2 size={18} />
              Surat Anda sudah siap diambil di kantor desa pada jam kerja.
            </div>
          )}
          <button
            onClick={() => setOpen(open === s.ticket ? null : s.ticket)}
            aria-expanded={open === s.ticket}
            className="flex w-full flex-wrap items-center gap-3 p-4 text-left"
          >
            <div className="min-w-0 flex-1">
              <div className="font-bold text-navy">{svcName(s.type)}</div>
              <div className="text-xs text-slate-500">
                {s.ticket} • {fmtDate(s.createdAt)}
              </div>
            </div>
            <StatusBadge status={s.status} />
            <ChevronDown
              className={cx("transition", open === s.ticket && "rotate-180")}
            />
          </button>
          {open === s.ticket && (
            <div className="border-t border-line bg-slate-50 p-5">
              <p className="mb-4 text-sm">
                <b className="text-navy">Keperluan:</b> {s.purpose}
              </p>
              <Timeline items={svcTimeline(s)} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
