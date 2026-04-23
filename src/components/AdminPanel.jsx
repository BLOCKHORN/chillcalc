import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Navigate } from 'react-router-dom'
import { Shield, ShieldAlert, User, Loader2, Users, Wallet, ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react'

export default function AdminPanel() {
  const { rolUsuario, cargarUsuariosAdmin, cambiarRolAdmin, cargarEstadisticasAdmin, cargarStatsUsuarioAdmin } = useStore()
  const [usuarios, setUsuarios] = useState([])
  const [statsGlobales, setStatsGlobales] = useState({ total_usuarios: 0, total_cuentas: 0, total_transacciones: 0 })
  const [cargando, setCargando] = useState(true)
  
  const [usuarioExpandido, setUsuarioExpandido] = useState(null)
  const [statsUsuarios, setStatsUsuarios] = useState({})
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

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
    setStatsGlobales(metricas)
    setCargando(false)
  }

  const toggleUsuario = async (userId) => {
    if (usuarioExpandido === userId) {
      setUsuarioExpandido(null)
      return
    }

    setUsuarioExpandido(userId)
    
    if (!statsUsuarios[userId]) {
      setCargandoDetalle(true)
      const data = await cargarStatsUsuarioAdmin(userId)
      setStatsUsuarios(prev => ({ ...prev, [userId]: data }))
      setCargandoDetalle(false)
    }
  }

  const handleCambiarRol = async (e, id, email, rolActual) => {
    e.stopPropagation()
    const nuevoRol = rolActual === 'admin' ? 'usuario' : 'admin'
    if (window.confirm(`¿Confirmas cambiar a ${email} a nivel ${nuevoRol.toUpperCase()}?`)) {
      const exito = await cambiarRolAdmin(id, nuevoRol)
      if (exito) {
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, rol: nuevoRol } : u))
      }
    }
  }

  if (rolUsuario && rolUsuario !== 'admin') return <Navigate to="/dashboard" replace />

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400 border border-brand-500/20">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Terminal de Control</h1>
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest mt-1">Gestión de infraestructura</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Usuarios', val: statsGlobales.total_usuarios, icon: Users, color: 'text-blue-400' },
          { label: 'Cuentas', val: statsGlobales.total_cuentas, icon: Wallet, color: 'text-emerald-400' },
          { label: 'Operaciones', val: statsGlobales.total_transacciones, icon: ArrowRightLeft, color: 'text-amber-400' },
        ].map((item, i) => (
          <div key={i} className="bg-surface-solid border border-border-subtle p-6 rounded-2xl relative overflow-hidden group">
            <item.icon className={`absolute -right-2 -bottom-2 size-24 opacity-5 ${item.color}`} />
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">{item.label}</p>
            <p className="text-4xl font-black text-text-main">{item.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-solid border border-border-subtle rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border-subtle bg-surface/30">
          <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Base de datos de terminales</h3>
        </div>
        
        {cargando ? (
          <div className="flex justify-center p-20"><Loader2 size={32} className="animate-spin text-brand-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface border-b border-border-subtle text-text-muted">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Usuario</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest hidden md:table-cell">Registro</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Rango</th>
                  <th className="p-4 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const expandido = usuarioExpandido === u.id
                  const uStats = statsUsuarios[u.id]

                  return (
                    <optgroup key={u.id} label={u.email} style={{all: 'unset'}}>
                      <tr 
                        onClick={() => toggleUsuario(u.id)}
                        className={`border-b border-border-subtle/30 cursor-pointer transition-colors ${expandido ? 'bg-brand-500/5' : 'hover:bg-surface/50'}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${expandido ? 'bg-brand-500 text-white' : 'bg-surface text-text-muted'}`}>
                              {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-text-main text-sm">{u.email}</span>
                              <span className="text-[10px] text-text-muted font-mono uppercase opacity-50">{u.id.substring(0, 8)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-bold text-text-muted hidden md:table-cell">
                          {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(u.created_at))}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${u.rol === 'admin' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-surface text-text-muted border border-border-subtle'}`}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={(e) => handleCambiarRol(e, u.id, u.email, u.rol)}
                            className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                          >
                            <Shield size={18} />
                          </button>
                        </td>
                      </tr>
                      
                      {expandido && (
                        <tr className="bg-brand-500/[0.02] border-b border-border-subtle/30">
                          <td colSpan="4" className="p-6 pt-2">
                            <div className="flex gap-10">
                              {cargandoDetalle && !uStats ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                                  <Loader2 size={14} className="animate-spin" /> Consultando base de datos...
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Cuentas Activas</span>
                                    <div className="flex items-center gap-2">
                                      <Wallet size={16} className="text-emerald-400" />
                                      <span className="text-xl font-black text-text-main">{uStats?.num_cuentas || 0}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Actividad Total</span>
                                    <div className="flex items-center gap-2">
                                      <ArrowRightLeft size={16} className="text-amber-400" />
                                      <span className="text-xl font-black text-text-main">{uStats?.num_transacciones || 0}</span>
                                    </div>
                                  </div>
                                  <div className="ml-auto self-end text-[9px] font-mono text-text-muted bg-surface px-2 py-1 rounded">
                                    UID: {u.id}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </optgroup>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}