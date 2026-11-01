import { useState } from "react"
import { Download, FileUp, Plus, Trash2, Upload } from "lucide-react"
import { Button, Modal, Select, Tabs, cx, inputCls } from "../../components/ui"
import { actions, toast, useApp } from "../../lib/store"
import { BIDANG, type BudgetItem } from "../../lib/mock"
import { downloadCSV, pct, rp } from "../../lib/format"
import { AdminTitle, TableWrap, thCls } from "./AdminReports"

const TABS = ["Pendapatan", "Belanja", "Pembiayaan"]
interface Row {
  cells: string[]
  errors: string[]
}

function parse(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  const body = /uraian/i.test(lines[0] ?? "") ? lines.slice(1) : lines
  return body.map((l) => {
    const cells = l.split(/[,;]/).map((c) => c.replace(/^"|"$/g, "").trim())
    const errors: string[] = []
    if (!cells[0]) errors.push("Uraian kosong")
    if (!/^\d+$/.test(cells[2] ?? "")) errors.push("Anggaran harus angka")
    if (!/^\d+$/.test(cells[3] ?? "")) errors.push("Realisasi harus angka")
    else if (+cells[3] > +(cells[2] ?? 0))
      errors.push("Realisasi melebihi anggaran")
    return { cells, errors }
  })
}

export default function AdminBudget() {
  const { budget } = useApp()
  const [year, setYear] = useState(2026)
  const [tab, setTab] = useState("Pendapatan")
  const [imp, setImp] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [drag, setDrag] = useState(false)
  const type = tab.toLowerCase() as BudgetItem["type"]
  const items = budget.filter((b) => b.year === year && b.type === type)
  const patch = (id: number, p: Partial<BudgetItem>) =>
    actions.setBudget(budget.map((b) => (b.id === id ? { ...b, ...p } : b)))
  const tA = items.reduce((a, b) => a + b.anggaran, 0)
  const tR = items.reduce((a, b) => a + b.realisasi, 0)
  const add = () => {
    actions.setBudget([
      ...budget,
      {
        id: Math.max(0, ...budget.map((b) => b.id)) + 1,
        year,
        type,
        name: "Item baru",
        anggaran: 0,
        realisasi: 0,
        bidang: type === "belanja" ? BIDANG[0] : undefined,
      },
    ])
    toast("Item ditambahkan, silakan isi datanya")
  }
  const readFile = (f?: File) => {
    if (f) f.text().then((t) => setRows(parse(t)))
  }
  const valid = rows.filter((r) => !r.errors.length)
  const doImport = () => {
    let id = Math.max(0, ...budget.map((b) => b.id))
    actions.setBudget([
      ...budget,
      ...valid.map((r) => ({
        id: ++id,
        year,
        type,
        name: r.cells[0],
        bidang:
          type === "belanja"
            ? BIDANG.includes(r.cells[1])
              ? r.cells[1]
              : BIDANG[0]
            : undefined,
        anggaran: +r.cells[2],
        realisasi: +r.cells[3],
      })),
    ])
    toast(`${valid.length} baris berhasil diimpor`)
    setImp(false)
    setRows([])
  }
  return (
    <>
      <AdminTitle
        title="Anggaran Desa (APBDes)"
        sub="Perubahan langsung tampil di halaman Uang Desa Kita."
      >
        <div className="flex flex-wrap gap-3">
          <div className="w-36">
            <Select
              aria-label="Tahun"
              value={year}
              onChange={(e) => setYear(+e.target.value)}
            >
              <option value={2026}>Tahun 2026</option>
              <option value={2025}>Tahun 2025</option>
            </Select>
          </div>
          <Button variant="secondary" onClick={() => setImp(true)}>
            <FileUp size={18} />
            Impor CSV
          </Button>
          <Button onClick={add}>
            <Plus size={18} />
            Tambah Item
          </Button>
        </div>
      </AdminTitle>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      <div className="mt-5">
        <TableWrap>
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr>
                <th className={thCls}>Uraian</th>
                {type === "belanja" && <th className={thCls}>Bidang</th>}
                <th className={thCls}>Anggaran (Rp)</th>
                <th className={thCls}>Realisasi (Rp)</th>
                <th className={thCls}>%</th>
                <th className={thCls} />
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="px-2 py-2">
                    <input
                      aria-label="Uraian"
                      className={inputCls}
                      value={b.name}
                      onChange={(e) => patch(b.id, { name: e.target.value })}
                    />
                  </td>
                  {type === "belanja" && (
                    <td className="px-2 py-2">
                      <Select
                        aria-label="Bidang"
                        value={b.bidang}
                        onChange={(e) =>
                          patch(b.id, { bidang: e.target.value })
                        }
                      >
                        {BIDANG.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </Select>
                    </td>
                  )}
                  <td className="px-2 py-2">
                    <input
                      aria-label="Anggaran"
                      type="number"
                      min={0}
                      className={inputCls}
                      value={b.anggaran}
                      onChange={(e) =>
                        patch(b.id, { anggaran: +e.target.value })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      aria-label="Realisasi"
                      type="number"
                      min={0}
                      className={cx(
                        inputCls,
                        b.realisasi > b.anggaran && "border-bad bg-bad/5",
                      )}
                      value={b.realisasi}
                      onChange={(e) =>
                        patch(b.id, { realisasi: +e.target.value })
                      }
                    />
                  </td>
                  <td className="px-2 py-2 font-bold text-navy">
                    {pct(b.realisasi, b.anggaran)}%
                  </td>
                  <td className="px-2 py-2">
                    <button
                      aria-label="Hapus"
                      className="rounded-lg p-2 text-bad hover:bg-bad/10"
                      onClick={() => {
                        actions.setBudget(budget.filter((x) => x.id !== b.id))
                        toast("Item dihapus")
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-teal bg-pale/60 font-extrabold text-navy">
                <td className="px-3 py-3" colSpan={type === "belanja" ? 2 : 1}>
                  Total {tab}
                </td>
                <td className="px-3 py-3">{rp(tA)}</td>
                <td className="px-3 py-3">{rp(tR)}</td>
                <td className="px-3 py-3">{pct(tR, tA)}%</td>
                <td />
              </tr>
            </tbody>
          </table>
        </TableWrap>
      </div>
      <Modal
        open={imp}
        onClose={() => {
          setImp(false)
          setRows([])
        }}
        title={`Impor CSV ke ${tab} ${year}`}
        wide
      >
        <div className="space-y-4">
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDrag(true)
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDrag(false)
              readFile(e.dataTransfer.files[0])
            }}
            className={cx(
              "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center",
              drag ? "border-teal bg-pale" : "border-slate-300",
            )}
          >
            <Upload className="text-teal" />
            <b className="text-navy">Seret berkas CSV ke sini</b>
            <span className="text-sm">atau klik untuk memilih berkas</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => readFile(e.target.files?.[0])}
            />
          </label>
          <button
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal underline"
            onClick={() =>
              downloadCSV("template-apbdes.csv", [
                ["Uraian", "Bidang", "Anggaran", "Realisasi"],
                ["Contoh kegiatan", BIDANG[1], 1000000, 500000],
              ])
            }
          >
            <Download size={15} />
            Unduh template CSV
          </button>
          {rows.length > 0 && (
            <>
              <p className="text-sm">
                <b className="text-ok">{valid.length} baris valid</b>,{" "}
                <b className="text-bad">
                  {rows.length - valid.length} baris bermasalah
                </b>
                . Pratinjau 5 baris pertama:
              </p>
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {[
                        "Uraian",
                        "Bidang",
                        "Anggaran",
                        "Realisasi",
                        "Validasi",
                      ].map((h) => (
                        <th key={h} className={thCls}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((r, i) => (
                      <tr
                        key={i}
                        className={cx(
                          "border-t border-line",
                          r.errors.length > 0 && "bg-bad/10",
                        )}
                      >
                        {[0, 1, 2, 3].map((c) => (
                          <td
                            key={c}
                            className={cx(
                              "px-3 py-2",
                              r.errors.length > 0 &&
                                c >= 2 &&
                                !/^\d+$/.test(r.cells[c] ?? "") &&
                                "font-bold text-bad",
                            )}
                          >
                            {r.cells[c]}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-xs font-bold">
                          {r.errors.length ? (
                            <span className="text-bad">
                              {r.errors.join(", ")}
                            </span>
                          ) : (
                            <span className="text-ok">OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setImp(false)
                setRows([])
              }}
            >
              Batal
            </Button>
            <Button disabled={!valid.length} onClick={doImport}>
              Impor {valid.length} baris
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
