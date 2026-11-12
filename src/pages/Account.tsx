import { useState, useMemo } from "react"
import { useNavigate } from "react-router"
import { LogOut, PenSquare } from "lucide-react"
import {
  Button,
  Card,
  Container,
  EmptyState,
  Field,
  LinkButton,
  PageHeader,
  Select,
  Tabs,
  inputCls,
} from "../components/ui"
import { ReportCard } from "../components/ReportCard"
import { ServiceList } from "../components/ServiceList"
import { StrengthMeter } from "./Auth"
import { toast, useApp } from "../lib/store"
import { useServiceRequests } from "../lib/api/layanan"
import { useMyReports, mapDbReport } from "../lib/api/laporan"
import { useAuth } from "../lib/auth"
import { supabase } from "../lib/supabase"
import { DUSUN } from "../lib/mock"

export default function Account() {
  const { user: authUser, logout } = useAuth()
  const { user: appUser, reports, services } = useApp()
  const user = authUser ? {
    name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Warga",
    email: authUser.email || "",
    role: authUser.user_metadata?.role || "warga",
    hp: authUser.user_metadata?.phone || "",
    dusun: authUser.user_metadata?.dusun_id || "0",
  } : appUser
  const nav = useNavigate()
  const [tab, setTab] = useState("Laporan Saya")
  const [p, setP] = useState({
    name: user?.name ?? "",
    hp: user?.hp ?? "",
    dusun: String(user?.dusun ?? "0"),
  })
  const [pw, setPw] = useState("")
  const { data: dbReports = [] } = useMyReports(authUser?.id, authUser?.email)
  const mine = useMemo(() => (dbReports || []).map(mapDbReport), [dbReports])
  const { data: mySvc = [] } = useServiceRequests(authUser?.id, authUser?.email)
  return (
    <>
      <PageHeader title="Akun Saya" sub={`${user!.name} • ${user!.email}`} />
      <Container className="py-8">
        <Tabs
          tabs={["Laporan Saya", "Layanan Saya", "Profil"]}
          value={tab}
          onChange={setTab}
        />
        <div className="mt-6">
          {tab === "Laporan Saya" &&
            (mine.length ? (
              <div className="grid gap-5 md:grid-cols-2">
                {mine.map((r) => (
                  <ReportCard key={r.ticket} r={r} row />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PenSquare}
                title="Belum ada laporan"
                text="Laporan yang Anda kirim akan muncul di sini, termasuk yang dikirim secara anonim."
                action={<LinkButton to="/lapor">Buat Laporan</LinkButton>}
              />
            ))}
          {tab === "Layanan Saya" && <ServiceList list={mySvc as any} />}
          {tab === "Profil" && (
            <div className="grid max-w-3xl gap-6 md:grid-cols-2">
              <Card>
                <h3 className="mb-4 text-lg">Data Diri</h3>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (p.name.trim().length < 3)
                      return toast("Nama terlalu pendek", "err")
                    try {
                      const { error: authErr } = await supabase.auth.updateUser({
                        data: {
                          full_name: p.name.trim(),
                          phone: p.hp,
                          dusun_id: String(p.dusun),
                        },
                      })
                      if (authErr) throw authErr

                      const { error: profileErr } = await supabase
                        .from("profiles")
                        .upsert({
                          id: authUser!.id,
                          full_name: p.name.trim(),
                          phone: p.hp,
                          dusun_id: String(p.dusun),
                        })
                      if (profileErr) console.warn("profiles sync failed:", profileErr.message)

                      toast("Profil disimpan")
                    } catch (e: any) {
                      toast("Gagal menyimpan: " + (e.message || "Unknown error"), "err")
                    }
                  }}
                >
                  <Field label="Nama lengkap">
                    <input
                      className={inputCls}
                      value={p.name}
                      onChange={(e) => setP({ ...p, name: e.target.value })}
                    />
                  </Field>
                  <Field label="Nomor HP">
                    <input
                      className={inputCls}
                      value={p.hp}
                      onChange={(e) => setP({ ...p, hp: e.target.value })}
                    />
                  </Field>
                  <Field label="Dusun">
                    <Select
                      value={p.dusun}
                      onChange={(e) => setP({ ...p, dusun: e.target.value })}
                    >
                      {DUSUN.map((d, i) => (
                        <option key={d} value={i}>
                          {d}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Button type="submit" className="w-full">
                    Simpan Profil
                  </Button>
                </form>
              </Card>
              <div className="space-y-6">
                <Card>
                  <h3 className="mb-4 text-lg">Ubah Password</h3>
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (pw.length < 8)
                        return toast("Password minimal 8 karakter", "err")
                      setPw("")
                      toast("Password diubah")
                    }}
                  >
                    <Field label="Password baru">
                      <input
                        type="password"
                        className={inputCls}
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                      />
                    </Field>
                    <StrengthMeter value={pw} />
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full"
                    >
                      Ubah Password
                    </Button>
                  </form>
                </Card>
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={async () => {
                    await logout()
                    nav("/")
                  }}
                >
                  <LogOut size={18} />
                  Keluar
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  )
}
