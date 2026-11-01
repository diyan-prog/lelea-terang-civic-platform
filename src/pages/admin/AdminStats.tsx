import { useState } from "react"
import { CircleDot, Save, ShieldAlert } from "lucide-react"
import { Button, Tabs, inputCls } from "../../components/ui"
import { actions, toast, useApp } from "../../lib/store"
import { DUSUN_SHORT, USIA_LABEL } from "../../lib/mock"
import { AdminTitle, TableWrap, thCls } from "./AdminReports"

export default function AdminStats() {
  const { pop, bansos } = useApp()
  const [tab, setTab] = useState("Penduduk")
  const [p, setP] = useState(pop)
  const [b, setB] = useState(bansos)
  const dirty =
    JSON.stringify(p) !== JSON.stringify(pop) ||
    JSON.stringify(b) !== JSON.stringify(bansos)
  const num = (v: string) => Math.max(0, Number(v) || 0)
  return (
    <>
      <AdminTitle title="Statistik Desa" sub="Edit angka agregat per dusun.">
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-[#8a6410]">
              <CircleDot size={16} />
              Ada perubahan belum disimpan
            </span>
          )}
          <Button
            disabled={!dirty}
            onClick={() => {
              actions.setPop(p, b)
              toast("Statistik disimpan")
            }}
          >
            <Save size={18} />
            Simpan Perubahan
          </Button>
        </div>
      </AdminTitle>
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-bad/10 p-3 text-sm font-semibold text-[#b02e2e]">
        <ShieldAlert size={18} />
        Jangan masukkan nama atau NIK. Hanya angka agregat.
      </div>
      <Tabs
        tabs={["Penduduk", "Bantuan Sosial"]}
        value={tab}
        onChange={setTab}
      />
      <div className="mt-5">
        <TableWrap>
          {tab === "Penduduk" ? (
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr>
                  <th className={thCls}>Dusun</th>
                  <th className={thCls}>Penduduk</th>
                  <th className={thCls}>KK</th>
                  <th className={thCls}>Sawah (ha)</th>
                  {USIA_LABEL.map((l) => (
                    <th key={l} className={thCls}>
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.map((d, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-3 py-2 font-bold text-navy">
                      {DUSUN_SHORT[i]}
                    </td>
                    {(["penduduk", "kk", "sawah"] as const).map((k) => (
                      <td key={k} className="px-2 py-2">
                        <input
                          aria-label={`${k} ${DUSUN_SHORT[i]}`}
                          type="number"
                          className={inputCls}
                          value={d[k]}
                          onChange={(e) =>
                            setP(
                              p.map((x, j) =>
                                j === i
                                  ? { ...x, [k]: num(e.target.value) }
                                  : x,
                              ),
                            )
                          }
                        />
                      </td>
                    ))}
                    {d.usia.map((u, k) => (
                      <td key={k} className="px-2 py-2">
                        <input
                          aria-label={`${USIA_LABEL[k]} ${DUSUN_SHORT[i]}`}
                          type="number"
                          className={inputCls}
                          value={u}
                          onChange={(e) =>
                            setP(
                              p.map((x, j) =>
                                j === i
                                  ? {
                                      ...x,
                                      usia: x.usia.map((y, m) =>
                                        m === k ? num(e.target.value) : y,
                                      ) as typeof x.usia,
                                    }
                                  : x,
                              ),
                            )
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr>
                  <th className={thCls}>Dusun</th>
                  <th className={thCls}>PKH</th>
                  <th className={thCls}>BPNT</th>
                  <th className={thCls}>BLT</th>
                </tr>
              </thead>
              <tbody>
                {b.map((d, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-3 py-2 font-bold text-navy">
                      {DUSUN_SHORT[i]}
                    </td>
                    {(["pkh", "bpnt", "blt"] as const).map((k) => (
                      <td key={k} className="px-2 py-2">
                        <input
                          aria-label={`${k} ${DUSUN_SHORT[i]}`}
                          type="number"
                          className={inputCls}
                          value={d[k]}
                          onChange={(e) =>
                            setB(
                              b.map((x, j) =>
                                j === i
                                  ? { ...x, [k]: num(e.target.value) }
                                  : x,
                              ),
                            )
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableWrap>
      </div>
    </>
  )
}
