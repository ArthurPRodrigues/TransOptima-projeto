import { NavLink, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Transportadoras from "./pages/Transportadoras";
import Documentos from "./pages/Documentos";
import Disponibilidade from "./pages/Disponibilidade";

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-medium ${
          isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-6">
          <span className="text-2xl font-bold">TransOptima</span>
          <nav className="ml-auto flex gap-2">
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/transportadoras" label="Transportadoras" />
            <NavItem to="/documentos" label="Documentos" />
            <NavItem to="/disponibilidade" label="Disponibilidade" />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transportadoras" element={<Transportadoras />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/disponibilidade" element={<Disponibilidade />} />
          <Route path="*" element={<p>Página não encontrada.</p>} />
        </Routes>
      </main>
    </div>
  );
}
