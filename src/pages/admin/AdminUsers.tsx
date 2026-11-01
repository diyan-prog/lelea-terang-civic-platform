import { useState } from "react"
import { Search } from "lucide-react"
import { Button, Modal, Select, cx, inputCls } from "../../components/ui"
import { actions, toast, useApp } from "../../lib/store"
import { DUSUN_SHORT, type Role } from "../../lib/mock"
import { AdminTitle, TableWrap, thCls } from "./AdminReports"

const roleCls: Record<Role, string> = {
  warga: "bg-slate-100 text-slate-700",
  perangkat: "bg-info/10 text-blue-700",
  admin: "bg-teal text-white",
}

export default function AdminUsers() {
  const { users, user } = useApp()
  const [q, setQ] = useState("")
  const [rf, setRf] = useState("")
  const [pending, setPending] = useState<{
    email: string
    name: string
    role: Role
  } | null>(null)
  const list = users.filter(
    (u) =>
      (!q || (u.name + u.email).toLowerCase().includes(q.toLowerCase())) &&
      (!rf || u.role === rf),
  )
  return (
    <>
      <AdminTitle
        title="Pengguna"
        sub="Atur peran akun. Hanya admin yang dapat mengubah peran."
      />
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            aria-label="Cari pengguna"
            className={cx(inputCls, "pl-10")}
            placeholder="Cari nama atau email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select
          aria-label="Peran"
          value={rf}
          onChange={(e) => setRf(e.target.value)}
        >
          <option value="">Semua peran</option>
          <option value="warga">Warga</option>
          <option value="perangkat">Perangkat</option>
          <option value="admin">Admin</option>
        </Select>
      </div>
      <TableWrap>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr>
              {["Nama", "Email", "Dusun", "Peran", "Ubah peran"].map((h) => (
                <th key={h} className={thCls}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.email} className="border-t border-line">
                <td className="px-3 py-3 font-bold text-navy">{u.name}</td>
                <td className="px-3 py-3">{u.email}</td>
                <td className="px-3 py-3">{DUSUN_SHORT[u.dusun]}</td>
                <td className="px-3 py-3">
                  <span
                    className={cx(
                      "rounded-full px-2.5 py-1 text-xs font-bold capitalize",
                      roleCls[u.role],
                    )}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="w-44 px-3 py-2">
                  <Select
                    aria-label={`Peran ${u.name}`}
                    value={u.role}
                    disabled={u.email === user?.email}
                    onChange={(e) =>
                      setPending({
                        email: u.email,
                        name: u.name,
                        role: e.target.value as Role,
                      })
                    }
                  >
                    <option value="warga">Warga</option>
                    <option value="perangkat">Perangkat</option>
                    <option value="admin">Admin</option>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="Ubah peran pengguna?"
      >
        <p>
          Peran <b>{pending?.name}</b> akan diubah menjadi{" "}
          <b className="capitalize">{pending?.role}</b>.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setPending(null)}>
            Batal
          </Button>
          <Button
            onClick={() => {
              actions.setRole(pending!.email, pending!.role)
              toast("Peran diperbarui")
              setPending(null)
            }}
          >
            Ya, Ubah
          </Button>
        </div>
      </Modal>
    </>
  )
}
