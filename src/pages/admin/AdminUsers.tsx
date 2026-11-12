import { useState } from "react"
import { Pencil, Plus, Search, Trash2 } from "lucide-react"
import { Button, Modal, Select, Field, cx, inputCls } from "../../components/ui"
import { actions, toast } from "../../lib/store"
import { DUSUN_SHORT, type Role } from "../../lib/mock"
import { supabase } from "../../lib/supabase"
import { AdminTitle, TableWrap, thCls } from "./AdminReports"
import { useProfiles, type Profile } from "../../lib/api/users"
import { useAuth } from "../../lib/auth"

const roleCls: Record<string, string> = {
  warga: "bg-slate-100 text-slate-700",
  admin: "bg-teal text-white",
}

export default function AdminUsers() {
  const { user: authUser } = useAuth()
  const { data: users = [], isLoading } = useProfiles()
  const [q, setQ] = useState("")
  const [rf, setRf] = useState("")

  // Add user
  const [addOpen, setAddOpen] = useState(false)
  const [addName, setAddName] = useState("")
  const [addEmail, setAddEmail] = useState("")
  const [addRole, setAddRole] = useState<Role>("warga")
  const [addDusun, setAddDusun] = useState(0)
  const [addPass, setAddPass] = useState("")
  const [addErr, setAddErr] = useState("")

  // Edit user
  const [editUser, setEditUser] = useState<Profile | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState<Role>("warga")
  const [editDusun, setEditDusun] = useState(0)
  const [editErr, setEditErr] = useState("")

  // Delete user
  const [delUser, setDelUser] = useState<Profile | null>(null)

  const list = users.filter(
    (u) =>
      (!q || ((u.full_name ?? "") + (u.email ?? "")).toLowerCase().includes(q.toLowerCase())) &&
      (!rf || u.role === rf),
  )

  const [editPass, setEditPass] = useState("")

  const openEdit = (u: Profile) => {
    setEditUser(u)
    setEditName(u.full_name ?? "")
    setEditEmail(u.email ?? "")
    setEditRole((u.role as Role) ?? "warga")
    setEditDusun(u.dusun_id ?? 0)
    setEditPass("") // Reset password input
    setEditErr("")
  }

  return (
    <>
      <AdminTitle
        title="Pengguna"
        sub="Atur akun warga dan petugas."
      >
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} />
          Tambah
        </Button>
      </AdminTitle>
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
          <option value="admin">Admin</option>
        </Select>
      </div>
      <TableWrap>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr>
              {["Nama", "Email", "Dusun", "Peran", "Aksi"].map((h) => (
                <th key={h} className={thCls}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-3 py-3 font-bold text-navy">{u.full_name}</td>
                <td className="px-3 py-3">{u.email}</td>
                <td className="px-3 py-3">{DUSUN_SHORT[u.dusun_id ?? 0] ?? "-"}</td>
                <td className="px-3 py-3">
                  <span
                    className={cx(
                      "rounded-full px-2.5 py-1 text-xs font-bold capitalize",
                      roleCls[u.role as Role] ?? "bg-slate-100",
                    )}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(u)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-pale hover:text-navy"
                      aria-label={`Edit ${u.full_name}`}
                    >
                      <Pencil size={16} />
                    </button>
                    {u.email !== authUser?.email && (
                      <button
                        onClick={() => setDelUser(u)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-bad/10 hover:text-bad"
                        aria-label={`Hapus ${u.full_name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>

      {/* Add User Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setAddErr("") }} title="Tambah Pengguna">
        <div className="space-y-4">
          <Field label="Nama Lengkap">
            <input className={inputCls} placeholder="Nama lengkap" value={addName} onChange={(e) => setAddName(e.target.value)} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} placeholder="email@contoh.com" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
          </Field>
          <Field label="Dusun">
            <Select value={addDusun} onChange={(e) => setAddDusun(Number(e.target.value))}>
              {DUSUN_SHORT.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Peran">
            <Select value={addRole} onChange={(e) => setAddRole(e.target.value as Role)}>
              <option value="warga">Warga</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <Field label="Password">
            <input
              type="password"
              className={inputCls}
              placeholder="Password"
              value={addPass}
              onChange={(e) => setAddPass(e.target.value)}
            />
          </Field>
          {addErr && <p className="text-sm text-bad font-semibold">{addErr}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => { setAddOpen(false); setAddErr("") }}>Batal</Button>
          <Button
            onClick={async () => {
              if (!addName.trim()) return setAddErr("Nama wajib diisi")
              if (!addEmail.trim() || !addEmail.includes("@")) return setAddErr("Email tidak valid")
              if (!addPass || addPass.length < 6) return setAddErr("Password minimal 6 karakter")
              try {
                const { error } = await supabase.auth.signUp({
                  email: addEmail.trim().toLowerCase(),
                  password: addPass,
                  options: {
                    data: {
                      full_name: addName.trim(),
                      role: addRole,
                      dusun: addDusun,
                    },
                  },
                })
                if (error) {
                  if (error.message.includes("already")) {
                    return setAddErr("Email sudah terdaftar")
                  }
                  return setAddErr(error.message)
                }
                toast("Pengguna berhasil ditambahkan")
              } catch {
                toast("Gagal menambahkan pengguna", "err")
              }
              setAddName(""); setAddEmail(""); setAddPass(""); setAddRole("warga"); setAddDusun(0); setAddOpen(false); setAddErr("")
            }}
          >
            Simpan
          </Button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit Pengguna">
        <div className="space-y-4">
          <Field label="Nama Lengkap">
            <input className={inputCls} placeholder="Nama lengkap" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} placeholder="email@contoh.com" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          </Field>
          <Field label="Dusun">
            <Select value={editDusun} onChange={(e) => setEditDusun(Number(e.target.value))}>
              {DUSUN_SHORT.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Peran">
            <Select value={editRole} onChange={(e) => setEditRole(e.target.value as Role)}>
              <option value="warga">Warga</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <Field label="Password Baru (kosongkan jika tidak ubah)">
            <input type="password" className={inputCls} placeholder="******" value={editPass} onChange={(e) => setEditPass(e.target.value)} />
          </Field>
          {editErr && <p className="text-sm text-bad font-semibold">{editErr}</p>}
        </div>
          <div className="mt-5 flex flex-col gap-3">
            <Button
              onClick={async () => {
                if (!editName.trim()) return setEditErr("Nama wajib diisi")
                try {
                  // 1. Update Profile
                  const { error: profileError } = await supabase.from('profiles').update({
                    full_name: editName.trim(),
                    role: editRole,
                    dusun_id: editDusun
                  }).eq('id', editUser!.id)
                  if (profileError) throw profileError

                  // 2. Update Password if provided
                  if (editPass) {
                    const { error: fnError } = await supabase.functions.invoke('admin-update-user', {
                      body: { userId: editUser!.id, password: editPass }
                    })
                    if (fnError) throw fnError
                  }
                  
                  toast("Data pengguna berhasil diperbarui")
                  setEditUser(null)
                } catch (e: any) {
                  setEditErr(e.message)
                }
              }}
            >
              Simpan Perubahan
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.resetPasswordForEmail(editEmail, {
                    redirectTo: window.location.origin + '/reset-password',
                  })
                  if (error) throw error
                  toast("Tautan reset password telah dikirim ke email pengguna")
                } catch (e: any) {
                  setEditErr("Gagal kirim reset password: " + e.message)
                }
              }}
            >
              Kirim Reset Password ke Email
            </Button>
            <Button variant="ghost" onClick={() => setEditUser(null)}>Batal</Button>
          </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal open={!!delUser} onClose={() => setDelUser(null)} title="Hapus Pengguna?">
        <p>
          Pengguna <b>{delUser?.full_name}</b> ({delUser?.email}) akan dihapus dari sistem.
          Data yang dihapus tidak dapat dikembalikan.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDelUser(null)}>Batal</Button>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                const { error } = await supabase.from('profiles').delete().eq('id', delUser!.id)
                if (error) throw error
                toast("Pengguna berhasil dihapus")
                setDelUser(null)
              } catch (e: any) {
                toast("Gagal menghapus pengguna: " + e.message, "err")
              }
            }}
          >
            Ya, Hapus
          </Button>
        </div>
      </Modal>
    </>
  )
}
