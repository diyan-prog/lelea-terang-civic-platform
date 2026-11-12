import { useState, type FormEvent, type ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import {
  AlertTriangle,
  Eye,
  EyeOff,
  MailCheck,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
} from "lucide-react"
import {
  Button,
  Card,
  Container,
  Field,
  IconCircle,
  Select,
  inputCls,
  cx,
} from "../components/ui"
import { toast } from "../lib/store"
import { supabase } from "../lib/supabase"
import { DUSUN } from "../lib/mock"

const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e)

function PasswordInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  id?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(inputCls, "pr-12")}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-slate-500"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

function Split({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-68px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-pale lg:block">
        <div className="absolute -left-24 -top-24 h-[620px] w-[620px] rounded-full bg-white/60" />
        <div className="relative flex h-full flex-col justify-center p-14">
          <h2 className="max-w-md text-[36px]">
            Selamat datang di Lelea Terang
          </h2>
          <p className="mt-3 max-w-md text-lg">
            Masuk untuk membuat laporan, mengajukan surat, dan memantau layanan
            desa Anda.
          </p>
          <div className="mt-8 w-full max-w-lg overflow-hidden [border-radius:48%_52%_46%_54%/50%_44%_56%_50%] bg-white shadow-soft">
            <img src="/logo home.jpeg" alt="Desa Lelea" className="w-full aspect-square object-cover" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-4 py-10 sm:p-10">
        {children}
      </div>
    </div>
  )
}

export function Login() {
  const nav = useNavigate()
  const loc = useLocation()
  const from = (loc.state as { from?: string } | null)?.from ?? "/"
  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [err, setErr] = useState("")

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr("")
    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) return setErr(error.message)
    toast("Selamat datang kembali!")
    // Arahkan admin/perangkat ke dashboard, warga ke halaman sebelumnya
    const role = loginData?.user?.user_metadata?.role
    const goTo = role && role !== "warga" ? "/admin" : from
    nav(goTo)
  }

  const handleGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    })
    if (error) setErr(error.message)
  }

  return (
    <Split>
      <Card className="w-full max-w-md">
        <h1 className="text-[28px]">Masuk</h1>
        <p className="mt-1">Gunakan akun Lelea Terang Anda.</p>
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          {err && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl bg-bad/10 p-3 text-sm font-semibold text-[#b02e2e]"
            >
              <AlertTriangle size={18} />
              {err}
            </div>
          )}
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              autoComplete="email"
            />
          </Field>
          <Field label="Password">
            <PasswordInput
              value={pw}
              onChange={setPw}
              placeholder="Masukkan password"
            />
          </Field>
          <div className="text-right">
            <Link
              to="/lupa-password"
              className="text-sm font-bold text-teal hover:underline"
            >
              Lupa password?
            </Link>
          </div>
          <Button type="submit" className="w-full">
            Masuk
          </Button>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">atau</span></div>
          </div>
          <Button type="button" variant="secondary" onClick={handleGoogle} className="w-full">
            Masuk dengan Google
          </Button>
        </form>
        <p className="mt-5 text-center text-sm">
          Belum punya akun?{" "}
          <Link to="/daftar" className="font-bold text-teal hover:underline">
            Daftar
          </Link>
        </p>
      </Card>
    </Split>
  )
}

function strength(p: string) {
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}

export function StrengthMeter({ value }: { value: string }) {
  const s = strength(value)
  const label = ["Terlalu pendek", "Lemah", "Cukup", "Kuat", "Sangat kuat"][
    value ? s : 0
  ]
  const col = ["bg-slate-200", "bg-bad", "bg-sun", "bg-ok", "bg-ok"][s]
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cx(
              "h-1.5 flex-1 rounded-full",
              value && i <= s ? col : "bg-slate-200",
            )}
          />
        ))}
      </div>
      <div className="mt-1 text-xs text-slate-500">
        Kekuatan: {value ? label : "-"}
      </div>
    </div>
  )
}

export function Register() {
  const nav = useNavigate()
  const [f, setF] = useState({
    name: "",
    email: "",
    hp: "",
    dusun: "",
    pw: "",
    pw2: "",
    ok: false,
  })
  const [showModal, setShowModal] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)
  const set = (k: string, v: string | boolean) => setF({ ...f, [k]: v })

  const handlePolicyClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowModal(true)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 15) {
      setScrolled(true)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const x: Record<string, string> = {}
    if (f.name.trim().length < 3) x.name = "Isi nama lengkap Anda"
    if (!emailOk(f.email)) x.email = "Format email belum benar"
    if (f.hp && !/^0\d{9,12}$/.test(f.hp))
      x.hp = "Nomor HP tidak valid, contoh 0812xxxxxxx"
    if (!f.dusun) x.dusun = "Pilih dusun tempat tinggal"
    if (strength(f.pw) < 2)
      x.pw = "Password minimal 8 karakter dengan huruf dan angka"
    if (f.pw2 !== f.pw) x.pw2 = "Konfirmasi password tidak sama"
    if (!f.ok) x.ok = "Centang persetujuan kebijakan privasi"
    setErrs(x)
    if (Object.keys(x).length) return

    const { error } = await supabase.auth.signUp({
      email: f.email.trim(),
      password: f.pw,
      options: {
        data: {
          full_name: f.name.trim(),
          phone: f.hp,
          dusun_id: f.dusun,
        },
      },
    })

    if (error) {
      setErrs({ email: error.message })
      return
    }

    setDone(true)
    toast("Akun berhasil dibuat")
  }

  if (done)
    return (
      <Split>
        <Card className="w-full max-w-md text-center">
          <div className="flex justify-center">
            <IconCircle icon={CheckCircle2} tone="green" size={72} />
          </div>
          <h1 className="mt-4 text-[26px]">Akun berhasil dibuat</h1>
          <p className="mt-2">
            Selamat datang, {f.name.split(" ")[0]}! Silakan cek email Anda jika verifikasi diperlukan, atau Anda sudah bisa menggunakan sistem.
          </p>
          <Button className="mt-5 w-full" onClick={() => nav("/lapor")}>
            Buat Laporan Pertama
          </Button>
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => nav("/")}
          >
            Ke Beranda
          </Button>
        </Card>
      </Split>
    )

  return (
    <Split>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-navy">Kebijakan Privasi</h2>
            <div className="max-h-80 overflow-y-auto text-sm text-body">
              <p className="mb-3">
                <strong>1. Pengumpulan Data:</strong> Kami mengumpulkan informasi nama, email, nomor HP, dan wilayah dusun semata-mata untuk verifikasi identitas warga, pengolahan laporan infrastruktur, serta layanan administrasi kependudukan di Desa Lelea.
              </p>
              <p className="mb-3">
                <strong>2. Keamanan & Kerahasiaan:</strong> Data Anda disimpan dengan pengamanan ketat di infrastruktur database terenkripsi. Kami menjaga kerahasiaan identitas Anda dan tidak akan menyebarluaskan data pribadi kepada pihak ketiga di luar perangkat desa yang berwenang.
              </p>
              <p>
                <strong>3. Hak Warga:</strong> Anda berhak untuk memperbarui data profil atau meminta penghapusan akun Anda kapan saja melalui perangkat desa.
              </p>
            </div>
            <Button className="mt-6 w-full" onClick={() => setShowModal(false)}>
              Tutup
            </Button>
          </div>
        </div>
      )}
      <Card className="w-full max-w-md">
        <h1 className="text-[28px]">Daftar Akun</h1>
        <p className="mt-1">Gratis dan hanya butuh satu menit.</p>
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          <Field label="Nama lengkap" error={errs.name}>
            <input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Email" error={errs.email}>
            <input type="email" className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Nomor HP (opsional)" error={errs.hp}>
            <input inputMode="tel" className={inputCls} value={f.hp} onChange={(e) => set("hp", e.target.value)} placeholder="0812xxxxxxxx" />
          </Field>
          <Field label="Dusun" error={errs.dusun}>
            <Select value={f.dusun} onChange={(e) => set("dusun", e.target.value)}>
              <option value="">Pilih dusun</option>
              {DUSUN.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Password" error={errs.pw}>
            <PasswordInput value={f.pw} onChange={(v) => set("pw", v)} />
            <StrengthMeter value={f.pw} />
          </Field>
          <Field label="Konfirmasi password" error={errs.pw2}>
            <PasswordInput value={f.pw2} onChange={(v) => set("pw2", v)} />
          </Field>
          <div className="space-y-2">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={f.ok}
                onChange={(e) => set("ok", e.target.checked)}
                disabled={!scrolled}
                className="mt-1 h-5 w-5 accent-teal disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span>
                Saya menyetujui{" "}
                <a href="#" onClick={handlePolicyClick} className="font-bold text-teal underline">Kebijakan Privasi</a>
              </span>
            </label>
            <div onScroll={handleScroll} className="max-h-28 overflow-y-auto rounded-xl border border-line bg-pale/50 p-3 text-xs text-body">
              <p className="mb-1 font-semibold text-navy">Ketentuan Penggunaan & Privasi:</p>
              Dengan mendaftar, Anda setuju bahwa data identitas yang dimasukkan digunakan semata-mata untuk verifikasi warga, pengolahan laporan publik, dan layanan surat menyurat Desa Lelea secara transparan dan aman sesuai regulasi perlindungan data yang berlaku.
              {!scrolled && <p className="mt-2 text-[10px] font-bold text-teal">↓ Scroll teks ini sampai bawah untuk mengaktifkan centang persetujuan</p>}
            </div>
          </div>
          {errs.ok && (
            <p className="flex items-center gap-1 text-xs font-semibold text-bad">
              <AlertTriangle size={13} />{errs.ok}
            </p>
          )}
          <div className="flex items-start gap-2 rounded-xl bg-pale p-3 text-sm">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-teal" />
            Data pribadi Anda tidak ditampilkan ke publik.
          </div>
          <Button type="submit" className="w-full">Buat Akun</Button>
        </form>
        <p className="mt-5 text-center text-sm">
          Sudah punya akun? <Link to="/masuk" className="font-bold text-teal hover:underline">Masuk</Link>
        </p>
      </Card>
    </Split>
  )
}

export function Forgot() {
  const [email, setEmail] = useState("")
  const [err, setErr] = useState("")
  const [sent, setSent] = useState(false)

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault()
    if (!emailOk(email)) return setErr("Format email belum benar")
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      if (
        error.message.includes("48") ||
        error.message.includes("security") ||
        error.message.includes("after")
      ) {
        setErr("Untuk alasan keamanan, silakan tunggu sebelum mencoba lagi. Cek juga folder spam email Anda.")
      } else {
        setErr(error.message)
      }
      return
    }

    setSent(true)
    toast("Tautan atur ulang dikirim")
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        {sent ? (
          <>
            <div className="flex justify-center">
              <IconCircle icon={MailCheck} tone="green" size={72} />
            </div>
            <h1 className="mt-4 text-[26px]">Cek email Anda</h1>
            <p className="mt-2">
              Jika {email} terdaftar, tautan untuk mengatur ulang password sudah
              kami kirim ke email Anda. Cukup klik tautan tersebut untuk membuat password baru.
            </p>
          </>
        ) : (
          <form
            onSubmit={handleForgot}
            className="text-left"
            noValidate
          >
            <div className="flex justify-center">
              <IconCircle icon={KeyRound} size={64} />
            </div>
            <h1 className="mt-4 text-center text-[26px]">Lupa password?</h1>
            <p className="mb-5 mt-2 text-center">
              Masukkan email Anda. Kami kirim tautan untuk membuat password
              baru.
            </p>
            <Field label="Email" error={err}>
              <input
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button type="submit" className="mt-4 w-full">
              Kirim Tautan
            </Button>
            <Link
              to="/masuk"
              className="mt-3 block text-center text-sm font-bold text-teal"
            >
              Kembali ke Masuk
            </Link>
          </form>
        )}
      </Card>
    </Container>
  )
}

export function Reset() {
  const nav = useNavigate()
  const [pw, setPw] = useState("")
  const [pw2, setPw2] = useState("")
  const [err, setErr] = useState("")
  const [done, setDone] = useState(false)

  const handleReset = async (e: FormEvent) => {
    e.preventDefault()
    if (strength(pw) < 2)
      return setErr(
        "Password minimal 8 karakter dengan huruf dan angka",
      )
    if (pw !== pw2) return setErr("Konfirmasi password tidak sama")

    const { error } = await supabase.auth.updateUser({ password: pw })

    if (error) {
      setErr(error.message)
      return
    }

    setDone(true)
    toast("Password diperbarui")
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        {done ? (
          <div className="text-center">
            <div className="flex justify-center">
              <IconCircle icon={CheckCircle2} tone="green" size={72} />
            </div>
            <h1 className="mt-4 text-[26px]">Password berhasil diubah</h1>
            <p className="mt-2">Silakan masuk dengan password baru Anda.</p>
            <Link to="/masuk">
              <Button className="mt-5 w-full">Masuk</Button>
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleReset}
            className="space-y-4"
            noValidate
          >
            <h1 className="text-[26px]">Buat password baru</h1>
            <Field label="Password baru">
              <PasswordInput value={pw} onChange={setPw} />
              <StrengthMeter value={pw} />
            </Field>
            <Field label="Konfirmasi password" error={err}>
              <PasswordInput value={pw2} onChange={setPw2} />
            </Field>
            <Button type="submit" className="w-full">
              Simpan Password
            </Button>
          </form>
        )}
      </Card>
    </Container>
  )
}
