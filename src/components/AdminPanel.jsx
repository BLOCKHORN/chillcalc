import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Navigate } from 'react-router-dom'
import { Shield, ShieldAlert, User, Loader2, Users, Wallet, ArrowRightLeft } from 'lucide-react'

export default function AdminPanel() {
  const { rolUsuario, cargarUsuariosAdmin, cambiarRolAdmin, cargarEstadisticasAdmin } = useStore()
  const [usuarios, setUsuarios] = useState([])
  const [stats, setStats] = useState({ total_usuarios: 0, total_cuentas: 0, total_transacciones: 0 })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (rolUsuario === 'admin') {
      inicializarPanel()
    }
  }, [rolUsuario])

  const inicializarPanel = async () => {
    setCargando(true)
    const [lista, metricas] = await Promise.all([
      cargarUsuariosAdmin(),
      cargarEstadisticasAdmin()
    ])
    setUsuarios(lista || [])
    setStats(metricas)
    setCargando(false)
  }

  const handleCambiarRol = async (id, email, rolActual) => {
    const nuevoRol = rolActual === 'admin' ? 'usuario' : 'admin'
    const mensaje = `¿Estás completamente seguro de cambiar el rango de ${email} a ${nuevoRol.toUpperCase()}?`
    
    if (window.confirm(mensaje)) {
      const exito = await cambiarRolAdmin(id, nuevoRol)
      if (exito) {
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, rol: nuevoRol } : u))
      }
    }
  }

  if (rolUsuario && rolUsuario !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24">
      {/* Cabecera */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400 border border-brand-500/20">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Terminal de Control</h1>
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest mt-1">Métricas de crecimiento y acceso</p>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Usuarios Totales', val: stats.total_usuarios, icon: Users, color: 'text-blue-400' },
          { label: 'Cuentas Creadas', val: stats.total_cuentas, icon: Wallet, color: 'text-emerald-400' },
          { label: 'Movimientos', val: stats.total_transacciones, icon: ArrowRightLeft, color: 'text-amber-400' },
        ].map((item, i) => (
          <div key={i} className="bg-surface-solid border border-border-subtle p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <item.icon className={`absolute -right-2 -bottom-2 size-24 opacity-5 transition-transform group-hover:scale-110 ${item.color}`} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">{item.label}</p>
            <p className="text-4xl font-black text-text-main">{item.val}</p>
          </div>
        ))}
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-surface-solid border border-border-subtle rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-border-subtle bg-surface/30">
          <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Listado de Terminales Activos</h3>
        </div>
        
        {cargando ? (
          <div className="flex justify-center p-20">
            <Loader2 size={32} className="animate-spin text-brand-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border-subtle text-text-muted">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Identificador / Email</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Fecha Registro</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Nivel de Acceso</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-border-subtle/50 hover:bg-surface/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-text-main text-sm">{u.email}</span>
                        <span className="text-[10px] text-text-muted font-mono opacity-50 uppercase">{u.id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-text-muted">
                      {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(u.created_at))}
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.rol === 'admin' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'bg-surface-solid text-text-muted border border-border-subtle'}`}>
                        {u.rol === 'admin' ? <Shield size={12} /> : <User size={12} />}
                        {u.rol}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleCambiarRol(u.id, u.email, u.rol)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${u.rol === 'admin' ? 'bg-danger/10 text-danger border-danger/20 hover:bg-danger hover:text-white' : 'bg-surface border-border-subtle text-text-main hover:bg-brand-500 hover:text-white hover:border-brand-500'}`}
                      >
                        {u.rol === 'admin' ? 'Degradar' : 'Promocionar'}
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