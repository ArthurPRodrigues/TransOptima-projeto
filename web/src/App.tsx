import { Routes, Route, Navigate } from "react-router-dom";
import Nav from "./components/Nav";
import Dashboard from "./pages/Dashboard";
import Transportadoras from "./pages/Transportadoras";
import Documentos from "./pages/Documentos";

export default function App() {
  return (
    <div className="page">
      <Nav />
      <main className="page__main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transportadoras" element={<Transportadoras />} />
          <Route path="/documentos" element={<Documentos />} />
        </Routes>
      </main>
    </div>
  );
}
