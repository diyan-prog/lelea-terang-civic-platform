export const rp = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID")
export const rpShort = (n: number) =>
  n >= 1e9
    ? (n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " M"
    : (n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 0 }) + " jt"
export const NOW = () => Date.now()
export const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} menit lalu`
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} hari lalu`
  return `${Math.floor(s / 86400 / 30)} bulan lalu`
}
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)
export const downloadCSV = (name: string, rows: (string | number)[][]) => {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
  a.download = name
  a.click()
}
