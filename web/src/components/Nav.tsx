import { NavLink } from "react-router-dom";

export default function Nav() {
  return (
    <header className="topbar">
      <div className="topbar__brand">TransOptima</div>
      <nav className="topbar__nav">
        <NavLink to="/dashboard" className="topbar__link">Dashboard</NavLink>
        <NavLink to="/transportadoras" className="topbar__link">Transportadoras</NavLink>
        <NavLink to="/documentos" className="topbar__link">Documentos</NavLink>
      </nav>
    </header>
  );
}
