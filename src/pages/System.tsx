import { isRouteErrorResponse, useRouteError } from "react-router"
import { Compass, TriangleAlert } from "lucide-react"
import { Button, Container, LinkButton } from "../components/ui"

export function NotFound() {
  return (
    <Container className="grid place-items-center py-24 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-pale text-teal">
          <Compass size={40} />
        </div>
        <h1 className="text-[32px]">Halaman tidak ditemukan</h1>
        <p className="mt-2">
          Alamat yang Anda buka tidak ada atau sudah dipindahkan.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <LinkButton to="/">Kembali ke Beranda</LinkButton>
          <LinkButton to="/lapor" variant="secondary">
            Buat Laporan
          </LinkButton>
        </div>
      </div>
    </Container>
  )
}

export function ErrorPage() {
  const e = useRouteError()
  const nf = isRouteErrorResponse(e) && e.status === 404
  if (nf) return <NotFound />
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-bad/10 text-bad">
          <TriangleAlert size={40} />
        </div>
        <h1 className="text-[32px]">Terjadi kesalahan</h1>
        <p className="mt-2">Maaf, halaman gagal dimuat. Silakan coba lagi.</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </div>
    </div>
  )
}
