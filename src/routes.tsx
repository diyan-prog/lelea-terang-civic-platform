import { createBrowserRouter } from "react-router"
import { useEffect } from "react"
import { AdminLayout, RequireRole, Root } from "./components/Layout"
import Home from "./pages/Home"
import { Forgot, Login, Register, Reset } from "./pages/Auth"
import Account from "./pages/Account"
import Budget from "./pages/Budget"
import { ProjectDetail, Projects } from "./pages/Projects"
import Stats from "./pages/Stats"
import Lapor from "./pages/Lapor"
import { ReportDetail, ReportList, Track } from "./pages/Reports"
import Services from "./pages/Services"
import Insight from "./pages/Insight"
import { About, Faq, Privacy } from "./pages/Info"
import { ErrorPage, NotFound } from "./pages/System"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminReports from "./pages/admin/AdminReports"
import AdminServices from "./pages/admin/AdminServices"
import AdminProjects from "./pages/admin/AdminProjects"
import AdminBudget from "./pages/admin/AdminBudget"
import AdminStats from "./pages/admin/AdminStats"
import AdminUsers from "./pages/admin/AdminUsers"
import { supabase } from "./lib/supabase"

function AuthCallback() {
  useEffect(() => {
    // Dengan detectSessionInUrl: true, Supabase otomatis memproses code di URL.
    // Kita tunggu sebentar lalu arahkan ke home.
    const t = setTimeout(() => {
      window.location.replace('/');
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="h-12 w-12 mx-auto mb-4 rounded-full border-4 border-teal border-t-transparent animate-spin" />
        <p className="text-navy font-bold text-lg">Menyelesaikan login...</p>
        <p className="text-xs text-slate-400 mt-1">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary: ErrorPage,
    children: [
      { index: true, Component: Home },
      { path: "anggaran", Component: Budget },
      { path: "pembangunan", Component: Projects },
      { path: "pembangunan/:id", Component: ProjectDetail },
      { path: "statistik", Component: Stats },
      { path: "lapor", Component: Lapor },
      { path: "laporan", Component: ReportList },
      { path: "laporan/:ticket", Component: ReportDetail },
      { path: "lacak", Component: Track },
      { path: "insight", Component: Insight },
      { path: "tentang", Component: About },
      { path: "faq", Component: Faq },
      { path: "privasi", Component: Privacy },
      { path: "masuk", Component: Login },
      {
        path: "auth/callback",
        element: <AuthCallback />,
      },
      { path: "daftar", Component: Register },
      { path: "lupa-password", Component: Forgot },
      { path: "reset-password", Component: Reset },
      {
        path: "akun",
        element: (
          <RequireRole>
            <Account />
          </RequireRole>
        ),
      },
      { path: "layanan", Component: Services },
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "laporan", Component: AdminReports },
          { path: "layanan", Component: AdminServices },
          { path: "kegiatan", Component: AdminProjects },
          { path: "anggaran", Component: AdminBudget },
          { path: "statistik", Component: AdminStats },
          {
            path: "pengguna",
            element: (
              <RequireRole roles={["admin"]}>
                <AdminUsers />
              </RequireRole>
            ),
          },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
])
