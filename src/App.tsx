import { Link, Outlet, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TransportadorasList from "./pages/TransportadorasList.tsx";
import TransportadoraCreate from "./pages/TransportadoraCreate.tsx";
import DocumentosPage from "./pages/Documentos";
import DocumentoUpload from "./pages/DocumentoUpload";

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex gap-6">
          <Link to="/" className="font-semibold hover:underline">Dashboard</Link>
          <Link to="/transportadoras" className="hover:underline">Transportadoras</Link>
          <Link to="/documentos" className="hover:underline">Documentos</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transportadoras" element={<TransportadorasList />} />
          <Route path="/transportadoras/create" element={<TransportadoraCreate />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route path="/documentos/upload" element={<DocumentoUpload />} />
          <Route path="*" element={<div>404</div>} />
        </Routes>
        <Outlet />
      </main>
    </div>
  );
}
