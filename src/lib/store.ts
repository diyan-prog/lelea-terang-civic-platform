import { useSyncExternalStore } from "react"
import {
  ALL_USERS,
  BANSOS,
  BUDGET,
  POP,
  PROJECTS,
  REPORTS,
  SERVICE_REQS,
  type BansosStat,
  type BudgetItem,
  type DusunStat,
  type Project,
  type Report,
  type Role,
  type RStatus,
  type ServiceReq,
  type SStatus,
  type Update,
  type User,
  type CatId,
} from "./mock"

export interface Toast {
  id: number
  msg: string
  kind: "ok" | "err"
}
interface State {
  user: User | null
  reports: Report[]
  projects: Project[]
  budget: BudgetItem[]
  pop: DusunStat[]
  bansos: BansosStat[]
  services: ServiceReq[]
  users: User[]
  toasts: Toast[]
}
let state: State = {
  user: null,
  reports: REPORTS,
  projects: PROJECTS,
  budget: BUDGET,
  pop: POP,
  bansos: BANSOS,
  services: SERVICE_REQS,
  users: ALL_USERS,
  toasts: [],
}
const subs = new Set<() => void>()
const set = (p: Partial<State>) => {
  state = { ...state, ...p }
  subs.forEach((f) => f())
}
export const useApp = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => state,
  )
export const getState = () => state

let tid = 1
export const toast = (msg: string, kind: Toast["kind"] = "ok") => {
  const id = tid++
  set({ toasts: [...state.toasts, { id, msg, kind }] })
  setTimeout(
    () => set({ toasts: state.toasts.filter((t) => t.id !== id) }),
    3500,
  )
}
const mapReport = (ticket: string, fn: (r: Report) => Report) =>
  set({ reports: state.reports.map((r) => (r.ticket === ticket ? fn(r) : r)) })

export const actions = {
  login(u: User) {
    set({ user: u })
  },
  logout() {
    set({ user: null })
  },
  updateProfile(p: Partial<User>) {
    if (!state.user) return
    const u = { ...state.user, ...p }
    set({
      user: u,
      users: state.users.map((x) => (x.email === u.email ? u : x)),
    })
  },
  addReport(d: {
    title: string
    desc: string
    category: CatId
    dusun: number
    rw: string
    lat: number
    lng: number
    photos: string[]
    anonymous: boolean
    projectId?: number
    mismatch?: boolean
  }) {
    const now = new Date()
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`
    const n =
      state.reports.filter((r) => r.ticket.startsWith(`LT-${ym}`)).length + 40
    const r: Report = {
      ...d,
      ticket: `LT-${ym}-${String(n).padStart(4, "0")}`,
      status: "Diterima",
      createdAt: now.toISOString(),
      confirmations: 0,
      reporter: state.user?.name ?? "Warga",
      slaDays: 3,
      updates: [
        {
          status: "Diterima",
          note: "Laporan diterima dan masuk antrean petugas.",
          at: now.toISOString(),
        },
      ],
    }
    set({ reports: [r, ...state.reports] })
    return r
  },
  confirmReport(ticket: string) {
    mapReport(ticket, (r) =>
      r.confirmed
        ? r
        : { ...r, confirmed: true, confirmations: r.confirmations + 1 },
    )
  },
  rateReport(ticket: string, rating: number) {
    mapReport(ticket, (r) => ({ ...r, rating }))
  },
  updateReport(ticket: string, status: RStatus, note: string, photo?: string) {
    const u: Update = { status, note, at: new Date().toISOString(), photo }
    mapReport(ticket, (r) => ({ ...r, status, updates: [...r.updates, u] }))
  },
  saveProject(p: Project) {
    const exists = state.projects.some((x) => x.id === p.id)
    set({
      projects: exists
        ? state.projects.map((x) => (x.id === p.id ? p : x))
        : [...state.projects, p],
    })
  },
  deleteProject(id: number) {
    set({ projects: state.projects.filter((p) => p.id !== id) })
  },
  setBudget(items: BudgetItem[]) {
    set({ budget: items })
  },
  setPop(pop: DusunStat[], bansos: BansosStat[]) {
    set({ pop, bansos })
  },
  addService(d: { type: string; purpose: string; note: string }) {
    const u = state.user!
    const n = state.services.length + 1
    const at = new Date().toISOString()
    const s: ServiceReq = {
      ...d,
      ticket: `LS-202610-${String(n).padStart(4, "0")}`,
      email: u.email,
      name: u.name,
      createdAt: at,
      status: "Diajukan",
      updates: [{ status: "Diajukan", note: "Pengajuan diterima.", at }],
    }
    set({ services: [s, ...state.services] })
    return s
  },
  updateService(ticket: string, status: SStatus, note: string) {
    set({
      services: state.services.map((s) =>
        s.ticket === ticket
          ? {
              ...s,
              status,
              updates: [
                ...s.updates,
                { status, note, at: new Date().toISOString() },
              ],
            }
          : s,
      ),
    })
  },
  setRole(email: string, role: Role) {
    set({
      users: state.users.map((u) => (u.email === email ? { ...u, role } : u)),
    })
  },
  addUser(u: User) {
    set({ users: [...state.users, { ...u, email: u.email.toLowerCase() }] })
  },
  updateUser(email: string, d: User) {
    set({
      users: state.users.map((u) => (u.email === email ? { ...u, ...d, email: d.email.toLowerCase() } : u)),
    })
  },
  deleteUser(email: string) {
    set({
      users: state.users.filter((u) => u.email !== email),
    })
  },
}
