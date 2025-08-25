import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Transportadoras from "./pages/Transportadoras";
import Dashboard from "./pages/Dashboard";
import Documentos from "./pages/Documentos";

function Nav() {
  const Link = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "px-3 py-2 rounded " + (isActive ? "bg-black text-white" : "hover:bg-gray-100")
      }
    >
      {children}
    </NavLink>
  );
  return (
    <nav style={{ display: "flex", gap: 8, padding: 12, borderBottom: "1px solid #eee" }}>
      <Link to="/">Dashboard</Link>
      <Link to="/transportadoras">Transportadoras</Link>
      <Link to="/documentos">Documentos</Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <div style={{ padding: 16, fontFamily: "system-ui" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transportadoras" element={<Transportadoras />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="*" element={<div>Rota não encontrada</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
