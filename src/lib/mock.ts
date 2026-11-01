// Semua data di berkas ini adalah DATA CONTOH.
export type Role = "warga" | "perangkat" | "admin"
export type RStatus = "Diterima" | "Diverifikasi" | "Diproses" | "Selesai" | "Ditolak"
export type CatId = "jalan" | "irigasi" | "sampah" | "lampu" | "air" | "dugaan"

export const DUSUN = [
  "Blok Ilir",
  "Blok Weluntas",
]
export const DUSUN_SHORT = ["Ilir", "Weluntas"]
export const CENTER = { lat: -6.3846, lng: 108.2022 }

export const CATEGORIES: { id: CatId; label: string; hint: string }[] = [
  { id: "jalan", label: "Jalan Rusak", hint: "Jalan berlubang, retak, atau amblas" },
  { id: "irigasi", label: "Irigasi/Saluran", hint: "Saluran air sawah tersumbat atau jebol" },
  { id: "sampah", label: "Sampah & Lingkungan", hint: "Tumpukan sampah, selokan kotor" },
  { id: "lampu", label: "Lampu Jalan", hint: "Lampu jalan mati atau rusak" },
  { id: "air", label: "Air Bersih", hint: "Air macet, keruh, atau pipa bocor" },
  { id: "dugaan", label: "Dugaan Penyimpangan", hint: "Dugaan penyalahgunaan dana atau wewenang" },
]
export const catLabel = (id: CatId) => CATEGORIES.find((c) => c.id === id)!.label

export interface Update { status: RStatus; note: string; at: string; photo?: string }
export interface Report {
  ticket: string
  title: string
  desc: string
  category: CatId
  dusun: number
  rw: string
  status: RStatus
  createdAt: string
  confirmations: number
  confirmed?: boolean
  anonymous: boolean
  reporter: string
  lat: number
  lng: number
  photos: string[]
  updates: Update[]
  projectId?: number
  mismatch?: boolean
  rating?: number
  slaDays: number
}

const ago = (h: number) => new Date(Date.now() - h * 3600000).toISOString()
const pos = (d: number, i: number) => ({
  lat: CENTER.lat + (d < 1 ? 0.006 : -0.006) * (1 + (i % 3) * 0.4) + (i % 2) * 0.002,
  lng: CENTER.lng + (d % 2 === 0 ? -0.008 : 0.008) * (1 + (i % 4) * 0.3),
})

export const priorityOf = (r: Report) =>
  r.category === "dugaan" || r.mismatch || r.confirmations >= 3
    ? "Tinggi"
    : "Normal"
export const slaDue = (r: Report) =>
  new Date(r.createdAt).getTime() + r.slaDays * 86400000
export const isClosed = (r: Report) =>
  r.status === "Selesai" || r.status === "Ditolak"
export const isLate = (r: Report) => !isClosed(r) && Date.now() > slaDue(r)

export const REPORTS: Report[] = []

export type PStatus = "Direncanakan" | "Berjalan" | "Selesai"
export const BIDANG = [
  "Penyelenggaraan Pemerintahan",
  "Pembangunan",
  "Pembinaan Kemasyarakatan",
  "Pemberdayaan Masyarakat",
  "Penanggulangan Bencana",
]
export interface Project {
  id: number
  name: string
  desc: string
  bidang: string
  category: CatId
  dusun: number
  anggaran: number
  realisasi: number
  progress: number
  status: PStatus
  date: string
  lat: number
  lng: number
}

export const PROJECTS: Project[] = []

export interface BudgetItem {
  id: number
  year: number
  type: "pendapatan" | "belanja" | "pembiayaan"
  bidang?: string
  name: string
  anggaran: number
  realisasi: number
}

let bid = 1
const B = (y: number, t: "pendapatan" | "belanja" | "pembiayaan", n: string, a: number, r: number, b?: string): BudgetItem => ({
  id: bid++, year: y, type: t, name: n, anggaran: a, realisasi: Math.round(a * r), bidang: b
})

export const BUDGET: BudgetItem[] = [
  // DATA 2026 REAL PERBUP 223/2024
  B(2026, "pendapatan", "Alokasi Dana Desa (ADD)", 941750000, 0.75),
  B(2026, "pendapatan", "Bantuan Keuangan Kabupaten", 517384000, 0.75),
  B(2026, "pendapatan", "Bagi Hasil Pajak dan Retribusi", 225214940, 0.75),
  B(2026, "pendapatan", "Insentif DBH CHT", 88810000, 0.75),
  B(2026, "belanja", "Penyelenggaraan Pemerintahan Desa", 706312500, 0.75, BIDANG[0]),
  B(2026, "belanja", "Pelaksanaan Pembangunan Desa", 388038000, 0.75, BIDANG[1]),
  B(2026, "belanja", "Pembinaan Kemasyarakatan", 133216500, 0.75, BIDANG[2]),
  B(2026, "belanja", "Pemberdayaan Masyarakat", 177315900, 0.75, BIDANG[3]),
  B(2026, "belanja", "Penanggulangan Bencana & Darurat", 266465940, 0.75, BIDANG[4]),
  B(2026, "pembiayaan", "SILPA", 88810000, 1),
  // DATA 2024 REAL PERBUP 223/2024
  B(2024, "pendapatan", "Bantuan Keuangan (Hal 1277)", 941750000, 0),
  B(2024, "pendapatan", "Bantuan Keuangan (Hal 1290)", 517384000, 0),
  B(2024, "pendapatan", "Bagi Hasil Pajak (Hal 1325)", 88810000, 0),
]

export interface DusunStat { penduduk: number; kk: number; sawah: number; usia: [number, number, number, number] }

export const POP: (DusunStat & { name: string })[] = [
  { name: "Blok Ilir", penduduk: 2253, kk: 564, sawah: 0, usia: [180, 383, 1352, 338] },
  { name: "Blok Weluntas", penduduk: 2252, kk: 563, sawah: 0, usia: [180, 383, 1351, 338] },
]

export const USIA_LABEL = ["0–14 th", "15–24 th", "25–59 th", "60+ th"]

export const PEKERJAAN = [
  { name: "Petani", n: 1577 },
  { name: "Lainnya", n: 1441 },
  { name: "Buruh", n: 901 },
  { name: "Pedagang", n: 451 },
  { name: "Perangkat/PNS", n: 135 },
  { name: "Nelayan", n: 0 },
]

export const PENDIDIKAN = [
  { name: "Tidak sekolah", n: 360 },
  { name: "SD", n: 1577 },
  { name: "SMP", n: 991 },
  { name: "SMA/SMK", n: 1126 },
  { name: "Diploma/Sarjana", n: 451 },
]

export interface BansosStat { pkh: number; bpnt: number; blt: number }
export const BANSOS: (BansosStat & { name: string })[] = [
  { name: "Blok Ilir", pkh: 59, bpnt: 71, blt: 29 },
  { name: "Blok Weluntas", pkh: 58, bpnt: 65, blt: 27 },
]

export interface ServiceType { id: string; name: string; desc: string; eta: string; icon: string }
export const SERVICES: ServiceType[] = [
  { id: "sk", name: "Surat Keterangan", desc: "Surat umum.", eta: "1-2 hari", icon: "FileText" },
  { id: "ktp", name: "KTP/KK", desc: "Pengantar.", eta: "1 hari", icon: "IdCard" },
]

export type SStatus = "Diajukan" | "Diperiksa" | "Siap diambil" | "Selesai" | "Ditolak"
export interface ServiceReq {
  ticket: string
  type: string
  email: string
  name: string
  purpose: string
  note: string
  createdAt: string
  status: SStatus
  updates: { status: SStatus; note: string; at: string }[]
}
export const SERVICE_REQS: ServiceReq[] = []

export interface User { name: string; email: string; role: Role; dusun: number; hp: string }
export const DEMO_USERS: Record<Role, User> = {
  warga: { name: "Siti Aminah", email: "warga@lelea.id", role: "warga", dusun: 0, hp: "081234567890" },
  perangkat: { name: "Hendra Gunawan", email: "perangkat@lelea.id", role: "perangkat", dusun: 0, hp: "081200001111" },
  admin: { name: "Nurul Hidayah", email: "admin@lelea.id", role: "admin", dusun: 0, hp: "081200002222" },
}
export const ALL_USERS: User[] = [DEMO_USERS.warga, DEMO_USERS.perangkat, DEMO_USERS.admin]
