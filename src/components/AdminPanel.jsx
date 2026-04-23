import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Navigate } from 'react-router-dom'
import { Shield, ShieldAlert, User, Loader2 } from 'lucide-react'

export default function AdminPanel() {
  const { rolUsuario, cargarUsuariosAdmin, cambiarRolAdmin } = useStore()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarLista = async () => {
      setCargando(true)
      const data = await cargarUsuariosAdmin()
      setUsuarios(data || [])
      setCargando(false)
    }

    if (rolUsuario === 'admin') {
      cargarLista()
    }
  }, [rolUsuario, cargarUsuariosAdmin])

  const handleCambiarRol = async (id, rolActual) => {
    const nuevoRol = rolActual === 'admin' ? 'usuario' : 'admin'
    const exito = await cambiarRolAdmin(id, nuevoRol)
    if (exito) {
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, rol: nuevoRol } : u))
    }
  }

  if (rolUsuario && rolUsuario !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-danger/10 rounded-xl text-danger border border-danger/20">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Panel de Control</h1>
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest mt-1">Gestión de Usuarios</p>
        </div>
      </div>

      <div className="bg-surface-solid border border-border-subtle rounded-2xl overflow-hidden shadow-xl">
        {cargando ? (
          <div className="flex justify-center p-12">
            <Loader2 size={32} className="animate-spin text-brand-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border-subtle">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Email</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Registro</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Nivel</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-border-subtle/50 hover:bg-surface/50 transition-colors">
                    <td className="p-4 font-bold text-text-main text-sm">{u.email}</td>
                    <td className="p-4 text-xs font-medium text-text-muted">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${u.rol === 'admin' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'bg-surface text-text-muted border border-border-subtle'}`}>
                        {u.rol === 'admin' ? <Shield size={12} /> : <User size={12} />}
                        {u.rol}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleCambiarRol(u.id, u.rol)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${u.rol === 'admin' ? 'bg-danger/10 text-danger border-danger/20 hover:bg-danger hover:text-white' : 'bg-surface border-border-subtle text-text-main hover:bg-brand-500 hover:text-white hover:border-brand-500'}`}
                      >
                        {u.rol === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}