import { NavLink, Route, Routes } from "react-router-dom";

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg ${isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`
      }
      end
    >
      {label}
    </NavLink>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <span className="text-2xl font-bold">TransOptima</span>
          <nav className="ml-auto flex gap-2">
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/transportadoras" label="Transportadoras" />
            <NavItem to="/documentos" label="Documentos" />
            <NavItem to="/disponibilidade" label="Disponibilidade" />
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transportadoras" element={<Transportadoras />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/disponibilidade" element={<Disponibilidade />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

/* --- Páginas simples para já “aparecer” --- */
function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 border">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Dashboard() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card title="Transportadoras ativas">0</Card>
      <Card title="Documentos a vencer (30d)">0</Card>
      <Card title="Indisponíveis p/ frete">0</Card>
    </div>
  );
}

function Transportadoras() {
  return (
    <Card title="Lista de Transportadoras">
      <p>Em breve: tabela com busca, UF e tipo de produto.</p>
    </Card>
  );
}

function Documentos() {
  return (
    <Card title="Documentos">
      <p>Upload, listagem por transportadora e status de validade.</p>
    </Card>
  );
}

function Disponibilidade() {
  return (
    <Card title="Disponibilidade para Frete">
      <p>Página que mostra disponíveis/indisponíveis com filtros por UF e tipo.</p>
    </Card>
  );
}

function NotFound() {
  return <p>Página não encontrada.</p>;
}
