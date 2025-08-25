import { Routes, Route, Navigate } from "react-router-dom";
import Nav from "./components/Nav";
import Dashboard from "./pages/Dashboard";
import Transportadoras from "./pages/Transportadoras";
import TransportadoraDetail from "./pages/TransportadoraDetail";
import Documentos from "./pages/Documentos";
import Disponibilidade from "./pages/Disponibilidade";

export default function App() {
  return (
    <div className="page">
      <Nav />
      <main className="page__main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transportadoras" element={<Transportadoras />} />
          <Route path="/transportadoras/:id" element={<TransportadoraDetail />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/disponibilidade" element={<Disponibilidade />} />
        </Routes>
      </main>
    </div>
  );
}
