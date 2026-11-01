import { useState, type ReactNode } from "react"
import { NavLink } from "react-router"
import { ChevronDown } from "lucide-react"
import { Card, Container, PageHeader, cx } from "../components/ui"
import { ContactCard } from "../components/Layout"

const MENU = [
  ["/tentang", "Tentang"],
  ["/faq", "Tanya Jawab"],
  ["/privasi", "Privasi"],
]
function Shell({
  title,
  sub,
  children,
}: {
  title: string
  sub: string
  children: ReactNode
}) {
  return (
    <>
      <PageHeader title={title} sub={sub} />
      <Container className="grid gap-8 pb-16 pt-4 lg:grid-cols-[220px_1fr_300px]">
        <nav aria-label="Menu informasi" className="flex gap-2 lg:flex-col">
          {MENU.map(([to, l]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cx(
                  "rounded-xl px-4 py-2.5 text-sm font-bold",
                  isActive ? "bg-teal text-white" : "text-navy hover:bg-pale",
                )
              }
            >
              {l}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0 space-y-6">{children}</div>
        <ContactCard />
      </Container>
    </>
  )
}

export function About() {
  return (
    <Shell title="Tentang Lelea Terang" sub="Desa Terbuka, Warga Terlibat.">
      <Card>
        <h2 className="text-xl">Untuk apa aplikasi ini?</h2>
        <p className="mt-2">
          Lelea Terang membantu warga Desa Lelea melihat ke mana uang desa
          dipakai, memantau pembangunan, dan menyampaikan laporan langsung
          kepada pemerintah desa. Semua laporan bisa dilacak sampai selesai.
        </p>
      </Card>
      <Card>
        <h2 className="text-xl">Prinsip kami</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Terbuka: data anggaran dan kegiatan bisa dilihat siapa saja.</li>
          <li>Mudah: bahasa sederhana, bisa dipakai dari ponsel.</li>
          <li>
            Dapat dilacak: setiap laporan punya nomor tiket dan batas waktu
            tanggapan.
          </li>
          <li>Melindungi warga: laporan dapat dikirim tanpa nama.</li>
        </ul>
      </Card>
      <Card>
        <h2 className="text-xl">Catatan penting</h2>
        <p className="mt-2">
          Ini adalah prototipe. Seluruh angka, nama, dan laporan adalah data
          contoh. Aplikasi ini bukan situs resmi pemerintah dan tidak memakai
          logo instansi mana pun.
        </p>
      </Card>
    </Shell>
  )
}

const FAQ = [
  [
    "Bagaimana cara membuat laporan?",
    "Tekan tombol Lapor, pilih jenis masalah, tulis keterangan, tandai lokasi, lalu kirim. Anda akan mendapat nomor tiket.",
  ],
  [
    "Apakah saya harus masuk akun?",
    "Tidak wajib. Anda boleh melapor tanpa akun. Dengan akun, laporan tersimpan di halaman Akun Saya.",
  ],
  [
    "Apakah nama saya akan terlihat?",
    "Jika Anda memilih lapor anonim, nama Anda tidak ditampilkan kepada siapa pun, termasuk di halaman publik.",
  ],
  [
    "Berapa lama laporan ditanggapi?",
    "Batas waktu tanggapan bergantung pada jenis laporan, misalnya 2 hari untuk laporan mendesak. Jika lewat, laporan diberi tanda Terlambat.",
  ],
  [
    "Bagaimana melacak laporan saya?",
    "Buka halaman Lacak, lalu masukkan nomor tiket, misalnya LT-202610-0012.",
  ],
  [
    "Apakah data di sini data asli?",
    "Belum. Semua data pada prototipe ini adalah data contoh.",
  ],
]
export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <Shell
      title="Tanya Jawab"
      sub="Jawaban singkat untuk pertanyaan yang sering muncul."
    >
      <div className="space-y-3">
        {FAQ.map(([q, a], i) => (
          <Card key={q} className="!p-0">
            <h2 className="text-base">
              <button
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                className="flex min-h-14 w-full items-center justify-between gap-3 rounded-card px-5 py-3 text-left text-base font-bold text-navy"
              >
                <span>{q}</span>
                <ChevronDown
                  className={cx(
                    "shrink-0 text-teal transition",
                    open === i && "rotate-180",
                  )}
                />
              </button>
            </h2>
            {open === i && <p className="px-5 pb-5">{a}</p>}
          </Card>
        ))}
      </div>
    </Shell>
  )
}

const PRIV = [
  [
    "data-kami-simpan",
    "Data yang kami simpan",
    "Kami hanya menyimpan isi laporan, lokasi, foto yang Anda unggah, dan data akun (nama, email, dusun) bila Anda mendaftar.",
  ],
  [
    "lapor-anonim",
    "Lapor anonim",
    "Pada laporan anonim, nama dan kontak Anda tidak ditampilkan di halaman mana pun.",
  ],
  [
    "penggunaan",
    "Cara data dipakai",
    "Data dipakai untuk menindaklanjuti laporan dan menyusun ringkasan agregat untuk Musyawarah Desa.",
  ],
  [
    "hak-anda",
    "Hak Anda",
    "Anda dapat meminta perubahan atau penghapusan data akun dengan menghubungi kantor desa.",
  ],
]
export function Privacy() {
  return (
    <Shell
      title="Kebijakan Privasi"
      sub="Terakhir diperbarui: Oktober 2026 (contoh)."
    >
      <Card>
        <h2 className="text-lg">Daftar isi</h2>
        <ul className="mt-2 space-y-1">
          {PRIV.map(([id, t]) => (
            <li key={id}>
              <a className="font-semibold text-teal underline" href={`#${id}`}>
                {t}
              </a>
            </li>
          ))}
        </ul>
      </Card>
      {PRIV.map(([id, t, b]) => (
        <Card key={id}>
          <h2 id={id} className="scroll-mt-24 text-xl">
            {t}
          </h2>
          <p className="mt-2">{b}</p>
        </Card>
      ))}
    </Shell>
  )
}
