import {
  BIDANG,
  CATEGORIES,
  DUSUN_SHORT,
  catLabel,
  isClosed,
  isLate,
  type CatId,
  type Project,
  type Report,
  type BudgetItem,
} from "./mock"

const BIDANG_OF: Record<CatId, string> = {
  jalan: BIDANG[1],
  irigasi: BIDANG[1],
  air: BIDANG[1],
  lampu: BIDANG[1],
  sampah: BIDANG[4],
  dugaan: BIDANG[0],
}

export function computeInsight(
  reports: Report[],
  projects: Project[],
  budget: BudgetItem[],
  year = 2026,
) {
  const n = reports.length || 1
  const fastLive = reports.filter((r) =>
    r.updates.length < 2
      ? Date.now() - +new Date(r.createdAt) < 48 * 3600e3
      : +new Date(r.updates[1].at) - +new Date(r.createdAt) <= 48 * 3600e3,
  ).length
  const resp = Math.round((fastLive / n) * 100)
  const selesaiLive = reports.filter((r) => r.status === "Selesai").length
  const done = Math.round((selesaiLive / n) * 100)
  const late = reports.filter(isLate).length
  const sla = Math.round(
    ((n - late) / n) * 100,
  )
  const rated = reports.filter((r) => r.rating)
  const ratingAvg = rated.length > 0
    ? rated.reduce((a, r) => a + (r.rating ?? 0), 0) / rated.length
    : 0
  const rating = Math.round((ratingAvg / 5) * 100)
  const score = Math.round(resp * 0.3 + done * 0.3 + sla * 0.25 + rating * 0.15)

  const monthly = [
    { m: "Okt", masuk: reports.length, selesai: selesaiLive },
  ]
  const heat = DUSUN_SHORT.map((_, d) =>
    CATEGORIES.map(
      (c) => reports.filter((r) => r.dusun === d && r.category === c.id).length,
    ),
  )
  const since = Date.now() - 90 * 86400e3
  const recurring: { dusun: number; category: CatId; count: number }[] = []
  DUSUN_SHORT.forEach((_, d) =>
    CATEGORIES.forEach((c) => {
      const count = reports.filter(
        (r) =>
          r.dusun === d &&
          r.category === c.id &&
          +new Date(r.createdAt) >= since,
      ).length
      if (count >= 3) recurring.push({ dusun: d, category: c.id, count })
    }),
  )
  recurring.sort((a, b) => b.count - a.count)

  const perBidang = BIDANG.map((b) => {
    const items = budget.filter(
      (x) => x.year === year && x.type === "belanja" && x.bidang === b,
    )
    const a = items.reduce((s, x) => s + x.anggaran, 0)
    const rl = items.reduce((s, x) => s + x.realisasi, 0)
    const complaints = reports.filter((r) => BIDANG_OF[r.category] === b).length
    return {
      bidang: b,
      anggaran: a,
      realisasi: rl,
      pct: a ? Math.round((rl / a) * 100) : 0,
      complaints,
    }
  })

  const recs: string[] = []
  recurring
    .slice(0, 2)
    .forEach((r) =>
      recs.push(
        `Masalah "${catLabel(r.category)}" di ${DUSUN_SHORT[r.dusun]} dilaporkan ${r.count} kali dalam 90 hari. Usulkan perbaikan permanen, bukan tambal sulam, dalam Musdes.`,
      ),
    )
  if (late > 0)
    recs.push(
      `${late} laporan melewati batas waktu tanggapan. Tetapkan petugas piket dan tinjau antrean setiap pagi.`,
    )
  const mism = reports.filter((r) => r.mismatch && !isClosed(r))
  if (mism.length)
    recs.push(
      `${mism.length} laporan menyebut kondisi lapangan tidak sesuai data proyek. Lakukan pengecekan fisik bersama BPD sebelum proyek dinyatakan selesai.`,
    )
  const worst = [...perBidang]
    .filter((b) => b.complaints > 0)
    .sort((a, b) => a.pct - b.pct)[0]
  if (worst && worst.pct < 80)
    recs.push(
      `Bidang ${worst.bidang} baru terealisasi ${worst.pct}% tetapi memiliki ${worst.complaints} laporan warga. Percepat pelaksanaan kegiatan bidang ini.`,
    )
  const dTot = DUSUN_SHORT.map(
    (_, d) => reports.filter((r) => r.dusun === d).length,
  )
  const top = dTot.indexOf(Math.max(...dTot))
  recs.push(
    `${DUSUN_SHORT[top]} paling banyak menyampaikan laporan (${dTot[top]}). Jadwalkan kunjungan perangkat desa dan pertemuan warga di sana.`,
  )
  const dugaan = reports.filter(
    (r) => r.category === "dugaan" && !isClosed(r),
  ).length
  if (dugaan)
    recs.push(
      `Ada ${dugaan} laporan dugaan penyimpangan yang masih terbuka. Bahas secara terbuka dengan BPD dan umumkan hasil tindak lanjutnya.`,
    )
  const stalled = projects.filter(
    (p) => p.status === "Berjalan" && p.progress < 40,
  ).length
  if (stalled)
    recs.push(
      `${stalled} kegiatan pembangunan masih di bawah 40% progres. Minta jadwal kerja terbaru dari pelaksana.`,
    )
  if (rating < 90)
    recs.push(
      "Rating kepuasan warga belum maksimal. Minta masukan warga tentang kualitas penyelesaian laporan.",
    )

  return {
    score,
    resp,
    done,
    sla,
    rating,
    ratingAvg,
    monthly,
    heat,
    recurring,
    perBidang,
    recs,
    late,
    selesaiTotal: selesaiLive,
  }
}
