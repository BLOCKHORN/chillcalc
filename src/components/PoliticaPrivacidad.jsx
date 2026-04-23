import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function PoliticaPrivacidad() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-app text-text-main p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Política de Privacidad</h1>
        </div>

        <div className="space-y-8 text-text-muted leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">1. Información que recopilamos</h2>
            <p>
              Para operar EasyPocket, recopilamos información básica de tu cuenta cuando te registras (correo electrónico y nombre de perfil proporcionado por tu proveedor de identidad, como Google). También almacenamos de forma segura los datos financieros que introduces manualmente (cuentas, transacciones, grupos de gastos compartidos).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">2. Uso de datos de Google Workspace APIs</h2>
            <p>
              El uso y la transferencia por parte de EasyPocket de la información recibida de las API de Google a cualquier otra aplicación se adherirá a la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">Política de datos de usuario de los servicios API de Google</a>, incluidos los requisitos de uso limitado. Solo utilizamos tu correo electrónico y nombre para crear e identificar tu cuenta en nuestro sistema.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">3. Almacenamiento y Seguridad</h2>
            <p>
              Tus datos están protegidos y aislados. Utilizamos Supabase como infraestructura de base de datos, implementando políticas de seguridad a nivel de fila (RLS) para garantizar que nadie, ni siquiera otros usuarios de la aplicación, pueda acceder a tus registros financieros privados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">4. Gastos Compartidos (Split)</h2>
            <p>
              Si utilizas la función de dividir gastos, los usuarios a los que envíes el enlace público temporal solo tendrán acceso en modo lectura al nombre del grupo, los participantes y las cantidades de ese grupo específico. En ningún caso se revelará información de tus cuentas o balances privados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-3">5. Tus derechos</h2>
            <p>
              Eres el único propietario de tus datos. Puedes modificar, exportar o eliminar permanentemente tu cuenta y toda la información asociada en cualquier momento desde los ajustes de la aplicación. No vendemos ni cedemos tus datos a terceros con fines comerciales.
            </p>
            <p className="mt-4 text-sm">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}