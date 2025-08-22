// web/src/layout/Layout.tsx
import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Truck, FileText, TriangleAlert, LogOut } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const base =
    'flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100'
  const active = 'bg-slate-200 font-semibold'

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr] bg-slate-50">
      {/* Sidebar */}
      <aside className="border-r bg-white flex flex-col">
        <div className="p-4 text-xl font-bold">TransOptima</div>

        <nav className="px-2 space-y-1">
          <NavLink
            to="/transportadoras"
            className={({ isActive }) => `${base} ${isActive ? active : ''}`}
          >
            <Truck size={18} /> Transportadoras
          </NavLink>
          <NavLink
            to="/documentos"
            className={({ isActive }) => `${base} ${isActive ? active : ''}`}
          >
            <FileText size={18} /> Documentos
          </NavLink>
          <NavLink
            to="/vencidos"
            className={({ isActive }) => `${base} ${isActive ? active : ''}`}
          >
            <TriangleAlert size={18} /> Vencidos
          </NavLink>
        </nav>

        <div className="mt-auto p-4">
          <button
            onClick={logout}
            className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white hover:opacity-90"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
