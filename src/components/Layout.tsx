import { useEffect, useState, type ReactNode } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router"
import {
  Building2,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  Home,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  PenSquare,
  Search,
  BarChart3,
  Lightbulb,
  User as UserIcon,
  Users,
  X,
  HardHat,
  PieChart,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  MessageSquareWarning,
  Wallet,
  HelpCircle,
  Bell,
  ArrowUpRight,
  CheckCircle2,
  Plus,
} from "lucide-react"
import { Logo } from "./Brand"
import { Button, Card, Container, IconCircle, SlideOver, ToastHost, cx } from "./ui"
import { actions, useApp } from "../lib/store"
import { useAuth } from "../lib/auth"
import type { Role } from "../lib/mock"

const navCls = ({ isActive }: { isActive: boolean }) =>
  cx(
    "relative flex min-h-11 items-center px-1 text-[15px] font-semibold transition hover:text-teal",
    isActive
      ? "text-teal after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-full after:bg-teal"
      : "text-navy",
  )

function Navbar() {
  const { user: authUser, logout } = useAuth()
  const app = useApp()
  const user = authUser ? {
    name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Warga",
    email: authUser.email || "",
    role: authUser.user_metadata?.role || "warga",
  } : app.user
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [data, setData] = useState(false)
  const loc = useLocation()
  const nav = useNavigate()
  useEffect(() => {
    setOpen(false)
    setMenu(false)
    setData(false)
  }, [loc.pathname])
  const dataActive = ["/anggaran", "/pembangunan", "/statistik"].some((p) =>
    loc.pathname.startsWith(p),
  )
  const staff = user && user.role === "admin"
  return (
    <nav
      className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur"
      aria-label="Navigasi utama"
    >
      <Container className="flex h-[68px] items-center justify-between gap-6">
        <Logo />
        <div className="hidden items-center gap-7 lg:flex">
          <NavLink to="/" end className={navCls}>
            Beranda
          </NavLink>
          <div className="relative">
            <button
              onClick={() => setData(!data)}
              aria-expanded={data}
              className={cx(
                "relative flex min-h-11 items-center gap-1 px-1 text-[15px] font-semibold hover:text-teal",
                dataActive
                  ? "text-teal after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-full after:bg-teal"
                  : "text-navy",
              )}
            >
              Data Desa <ChevronDown size={16} />
            </button>
            {data && (
              <div className="fade-up absolute left-0 top-12 w-56 rounded-xl border border-line bg-white p-2 shadow-soft">
                {[
                  ["/anggaran", "Uang Desa Kita"],
                  ["/pembangunan", "Pembangunan"],
                  ["/statistik", "Statistik Desa"],
                ].map(([to, l]) => (
                  <Link
                    key={to}
                    to={to}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-navy hover:bg-pale"
                  >
                    {l}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/layanan" className={navCls}>
            Layanan
          </NavLink>
          <NavLink to="/laporan" className={navCls}>
            Laporan
          </NavLink>
          <NavLink to="/insight" className={navCls}>
            Insight
          </NavLink>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenu(!menu)}
                aria-expanded={menu}
                className="flex min-h-11 items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 hover:bg-pale"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal font-bold text-white">
                  {(user?.name ?? "W").charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-bold text-navy">
                  {user?.name?.split(" ")[0] ?? "Warga"}
                </span>
                <ChevronDown size={16} />
              </button>
              {menu && (
                <div className="fade-up absolute right-0 top-14 w-60 rounded-xl border border-line bg-white p-2 shadow-soft">
                  <div className="px-3 py-2 text-xs text-slate-500">
                    {user.email} • <b className="capitalize">{user.role}</b>
                  </div>
                  <Link
                    to="/akun"
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy hover:bg-pale"
                  >
                    <UserIcon size={16} />
                    Akun Saya
                  </Link>
                  {staff && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy hover:bg-pale"
                    >
                      <LayoutDashboard size={16} />
                      Dasbor Petugas
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await logout()
                      nav("/")
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-bad hover:bg-bad/10"
                  >
                    <LogOut size={16} />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/masuk"
                className="inline-flex min-h-11 items-center rounded-xl border-2 border-teal px-5 text-[15px] font-bold text-teal hover:bg-pale"
              >
                Masuk
              </Link>
              <Link
                to="/daftar"
                className="inline-flex min-h-11 items-center rounded-xl border-2 border-teal bg-teal px-5 text-[15px] font-bold text-white hover:bg-teal-deep"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
        <button
          className="rounded-lg p-2 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </Container>
      {open && (
        <div className="fade-up border-t border-line bg-white p-4 lg:hidden">
          <div className="flex flex-col">
            {[
              ["/", "Beranda"],
              ["/anggaran", "Uang Desa Kita"],
              ["/pembangunan", "Pembangunan"],
              ["/statistik", "Statistik Desa"],
              ["/layanan", "Layanan"],
              ["/laporan", "Laporan"],
              ["/insight", "Insight"],
              ["/tentang", "Tentang"],
              ["/faq", "Bantuan (FAQ)"],
            ].map(([to, l]) => (
              <Link
                key={to}
                to={to}
                className="rounded-lg px-3 py-3 font-semibold text-navy hover:bg-pale"
              >
                {l}
              </Link>
            ))}
            {staff && (
              <Link
                to="/admin"
                className="rounded-lg px-3 py-3 font-semibold text-navy hover:bg-pale"
              >
                Dasbor Petugas
              </Link>
            )}
          </div>
          <div className="mt-3 flex gap-3">
            {user ? (
              <>
                <Link to="/akun" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Akun Saya
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={async () => {
                    await logout()
                    nav("/")
                  }}
                >
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Link to="/masuk" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Masuk
                  </Button>
                </Link>
                <Link to="/daftar" className="flex-1">
                  <Button className="w-full">Daftar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

function Footer() {
  const col = (title: string, links: [string, string][]) => (
    <div>
      <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-sun">
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map(([to, l]) => (
          <li key={l}>
            <Link
              to={to}
              className="text-sm text-white/80 hover:text-white hover:underline"
            >
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <footer className="bg-teal-deep text-white">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-white/80">
            Desa Terbuka, Warga Terlibat. Platform transparansi dan partisipasi
            warga Desa Lelea, Kabupaten Indramayu, Jawa Barat.
          </p>
        </div>
        {col("Produk", [
          ["/anggaran", "Uang Desa Kita"],
          ["/pembangunan", "Pembangunan"],
          ["/lapor", "Buat Laporan"],
          ["/lacak", "Lacak Tiket"],
          ["/insight", "Insight"],
        ])}
        {col("Tentang", [
          ["/tentang", "Tentang Lelea Terang"],
          ["/statistik", "Statistik Desa"],
          ["/privasi", "Kebijakan Privasi"],
        ])}
        {col("Bantuan", [
          ["/faq", "Pertanyaan Umum"],
          ["/tentang#kontak", "Hubungi Kami"],
          ["/masuk", "Masuk / Daftar"],
        ])}
      </Container>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/70">
        © 2026 Lelea Terang — Desa Lelea, Indramayu. 
      </div>
    </footer>
  )
}

function BottomNav() {
  const { logout } = useAuth()
  const items = [
    { to: "/", icon: Home, label: "Beranda", end: true },
    { to: "/lapor", icon: PenSquare, label: "Lapor", center: true },
    { to: "/lacak", icon: Search, label: "Lacak" },
    { to: "/insight", icon: Lightbulb, label: "Insight" },
  ]
  return (
    <div
      className="bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white lg:hidden"
      aria-label="Navigasi bawah"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 items-end px-2 pb-1">
        {items.map(({ to, icon: I, label, center, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cx(
                "flex flex-col items-center gap-0.5 py-2 text-xs font-bold",
                isActive ? "text-teal" : "text-slate-500",
              )
            }
          >
            {center ? (
              <span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-teal text-white shadow-lg">
                <I size={24} />
              </span>
            ) : (
              <I size={22} />
            )}
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export function Root() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  const admin = pathname.startsWith("/admin")
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:bg-sun focus:p-3"
      >
        Lewati ke konten
      </a>
      {!admin && <Navbar />}
      <main id="main" className={cx("flex-1", !admin && "pb-20 lg:pb-0")}>
        <Outlet />
      </main>
      {!admin && <Footer />}
      {!admin && <BottomNav />}
      <ToastHost />
    </div>
  )
}

export function RequireRole({
  roles,
  children,
}: {
  roles?: Role[]
  children: ReactNode
}) {
  const { user: authUser } = useAuth()
  const app = useApp()
  const user = authUser ? {
    name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Warga",
    email: authUser.email || "",
    role: authUser.user_metadata?.role || "warga",
  } : app.user
  const nav = useNavigate()
  const loc = useLocation()
  useEffect(() => {
    if (user) return
    const t = setTimeout(
      () => nav("/masuk", { state: { from: loc.pathname } }),
      3000,
    )
    return () => clearTimeout(t)
  }, [user, nav, loc.pathname])
  if (!user)
    return (
      <Container className="py-20">
        <Card className="mx-auto max-w-md text-center">
          <div className="flex justify-center">
            <IconCircle icon={Lock} size={64} />
          </div>
          <h1 className="mt-4 text-2xl">Silakan masuk dulu</h1>
          <p className="mt-2">
            Halaman ini hanya untuk pengguna yang sudah masuk. Kami akan
            mengarahkan Anda ke halaman masuk sebentar lagi.
          </p>
          <Button
            className="mt-5 w-full"
            onClick={() => nav("/masuk", { state: { from: loc.pathname } })}
          >
            Masuk Sekarang
          </Button>
        </Card>
      </Container>
    )
  if (roles && !roles.includes(user.role))
    return (
      <Container className="py-20">
        <Card className="mx-auto max-w-md text-center">
          <div className="flex justify-center">
            <IconCircle icon={ShieldAlert} tone="yellow" size={64} />
          </div>
          <h1 className="mt-4 text-2xl">Halaman ini khusus petugas</h1>
          <p className="mt-2">
            Akun Anda ({user.role}) belum memiliki izin untuk membuka halaman
            ini.
          </p>
          <Link to="/">
            <Button variant="secondary" className="mt-5 w-full">
              Kembali ke Beranda
            </Button>
          </Link>
        </Card>
      </Container>
    )
  return <>{children}</>
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
      {children}
    </div>
  )
}

const thCls = "px-4 py-3 text-left font-bold text-navy bg-pale/50"

export function AdminLayout() {
  const { user: authUser, logout } = useAuth()
  const app = useApp()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const user = authUser ? {
    name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Warga",
    email: authUser.email || "",
    role: authUser.user_metadata?.role || "warga",
  } : app.user

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const sidebarItems = [
    { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/laporan", icon: MessageSquareWarning, label: "Laporan" },
    { to: "/admin/layanan", icon: FileText, label: "Layanan" },
    { to: "/admin/kegiatan", icon: HardHat, label: "Kegiatan" },
    { to: "/admin/anggaran", icon: Wallet, label: "Anggaran" },
    { to: "/admin/statistik", icon: BarChart3, label: "Statistik" },
    { to: "/admin/pengguna", icon: Users, label: "Pengguna" },
  ]

  return (
    <RequireRole roles={["admin"]}>
      <div className="flex min-h-screen">
        <div className="flex w-full flex-col lg:flex-row">
          <aside className="no-print hidden w-[260px] shrink-0 flex-col bg-[#0B6B6D] lg:flex">
            <div className="flex h-full flex-col p-5">
              <div className="mb-6 px-2">
                <Logo light />
              </div>
              <div className="relative mb-6">
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-[14px] font-bold text-teal transition hover:bg-white/90"
                  onClick={() => setAddMenuOpen(!addMenuOpen)}
                >
                  <Plus size={16} />
                  Tambah Data
                </button>
                {addMenuOpen && (
                  <div className="fade-up absolute left-0 right-0 top-full z-50 mt-2 rounded-xl bg-white p-2 shadow-lg">
                    {[
                      { label: "Kegiatan Baru", to: "/admin/kegiatan" },
                      { label: "Anggaran Baru", to: "/admin/anggaran" },
                    ].map((m) => (
                      <button
                        key={m.to}
                        onClick={() => { navigate(m.to); setAddMenuOpen(false) }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#17364A] hover:bg-[#EEF3F6]"
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <nav className="flex-1 space-y-1">
                {sidebarItems.map(({ to, icon: I, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cx(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-white transition hover:bg-white/10",
                        isActive && "bg-white/15 font-bold"
                      )
                    }
                  >
                    <I size={18} />
                    {label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto pt-6">
                <div className="mb-4 space-y-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    RINGKASAN ANGGARAN
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[12px] text-white/80">
                        <span>Realisasi</span>
                        <span>60%</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/20">
                        <div className="h-full w-[60%] rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[12px] text-white/80">
                        <span>Laporan</span>
                        <span>85%</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/20">
                        <div className="h-full w-[85%] rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                </div>
                <a
                  href="/"
                  className="flex items-center gap-2 text-[14px] font-medium text-white/90 hover:text-white"
                >
                  Lihat Situs Publik
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </aside>

          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#E1EAED] bg-white px-6">
              <button
                onClick={() => setDrawerOpen(true)}
                className="mr-4 rounded-lg p-2 hover:bg-[#EEF3F6] lg:hidden"
              >
                <Menu size={24} className="text-[#17364A]" />
              </button>

              <div className="ml-auto flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-3 transition hover:bg-[#EEF3F6]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal font-bold text-white">
                      {(user?.name || "W")[0].toUpperCase()}
                    </div>
                    <span className="hidden text-[14px] font-bold text-[#17364A] lg:block">
                      {user?.name?.split(" ")[0] || "Warga"}
                    </span>
                  </button>
                  {profileOpen && (
                    <div className="fade-up absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[#E1EAED] bg-white py-2 shadow-lg">
                      <div className="px-4 py-2">
                        <p className="text-[14px] font-bold text-[#17364A]">{user?.name}</p>
                        <p className="text-[12px] text-[#6B7F89]">{user?.email}</p>
                      </div>
                      <div className="my-1 border-t border-[#E1EAED]" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] font-medium text-[#D64545] hover:bg-[#FBE0DD]"
                      >
                        <LogOut size={16} />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 bg-white">
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-[#17364A]/60" onClick={() => setDrawerOpen(false)} />
          <aside className="slide-in absolute bottom-0 left-0 top-0 w-[280px] bg-[#0B6B6D] p-5 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <Logo light />
              <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 text-white/80">
                <X size={24} />
              </button>
            </div>
            <nav className="space-y-1">
              {sidebarItems.map(({ to, icon: I, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    cx(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-white transition",
                      isActive && "bg-white/15 font-bold"
                    )
                  }
                >
                  <I size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto pt-8">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-white/80"
              >
                <LogOut size={18} />
                Keluar
              </button>
            </div>
          </aside>
        </div>
      )}
    </RequireRole>
  )
}

export const ContactCard = () => (
  <div id="kontak">
    <Card>
      <h3 className="text-lg">Hubungi Kantor Desa</h3>
      <ul className="mt-3 space-y-3 text-sm">
        <li className="flex gap-3">
          <Building2 size={18} className="mt-0.5 text-teal" />
          Jl. Raya Lelea, Kec. Lelea, Kab. Indramayu, Jawa Barat 45261
        </li>
        <li className="flex gap-3">
          <Clock size={18} className="mt-0.5 text-teal" />
          Senin–Jumat, 08.00–15.00 WIB
        </li>
        <li className="flex gap-3">
          <Mail size={18} className="mt-0.5 text-teal" />
          pemdeslelea@gmail.com
        </li>
      </ul>
      <a
        href="https://wa.me/620000000000"
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-ok px-5 font-bold text-white hover:opacity-90"
      >
        <Phone size={18} />
        Chat WhatsApp
      </a>
    </Card>
  </div>
)
