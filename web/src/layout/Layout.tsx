import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { Truck, FileText, AlarmClock, LogOut } from 'lucide-react'

export default function Layout(){
  const { logout } = useAuth()
  const nav = useNavigate()
  function handleLogout(){ logout(); nav('/login') }

  const item = (to:string, icon:JSX.Element, label:string)=>(
    <NavLink to={to} className={({isActive})=>
      `flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-teal-50 ${isActive?'bg-teal-100 text-teal-800':'text-slate-700'}`
    }>
      {icon}<span>{label}</span>
    </NavLink>
  )

  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr]">
      <aside className="bg-white border-r p-4 space-y-4">
        <div className="text-xl font-bold">TransOptima</div>
        <nav className="space-y-1">
          {item('/app/transportadoras', <Truck size={18}/>, 'Transportadoras')}
          {item('/app/documentos', <FileText size={18}/>, 'Documentos')}
          {item('/app/vencidos', <AlarmClock size={18}/>, 'Vencidos')}
        </nav>
        <button onClick={handleLogout} className="mt-8 flex items-center gap-2 text-slate-600 hover:text-red-600">
          <LogOut size={18}/> Sair
        </button>
      </aside>
      <main className="bg-slate-50 p-6">
        <Outlet/>
      </main>
    </div>
 
