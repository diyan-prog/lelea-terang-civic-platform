import { Link } from "react-router"
import { Users } from "lucide-react"
import { CatIcon, LateBadge, SLAIndicator, StatusBadge, Thumb } from "./ui"
import { DUSUN_SHORT, catLabel, type Report } from "../lib/mock"
import { timeAgo } from "../lib/format"

export function ReportCard({ r, row }: { r: Report; row?: boolean }) {
  return (
    <Link
      to={`/laporan/${r.ticket}`}
      className={`group flex overflow-hidden rounded-card border border-line bg-white shadow-soft transition hover:-translate-y-0.5 ${
        row ? "flex-col sm:flex-row" : "flex-col"
      }`}
    >
      <Thumb
        category={r.category}
        src={r.photos?.[0]}
        className={
          row ? "h-36 w-full shrink-0 sm:h-auto sm:w-44" : "h-40 w-full"
        }
      />
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={r.status} />
          <LateBadge r={r} />
          <span className="ml-auto text-xs font-bold text-slate-500">
            {r.ticket}
          </span>
        </div>
        <h3 className="text-lg group-hover:text-teal">{r.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <CatIcon id={r.category} size={22} />
            {catLabel(r.category)}
          </span>
          <span>
            {DUSUN_SHORT[r.dusun]} • RW {r.rw}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {r.confirmations} warga mengonfirmasi
          </span>
          <SLAIndicator report={r} compact />
          <span>{timeAgo(r.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}
