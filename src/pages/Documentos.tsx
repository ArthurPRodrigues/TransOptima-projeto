import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Documento } from "../services/api";

export default function DocumentosPage() {
  const [docs, setDocs] = useState<Documento[]>([]);
  const [transportadoraId, setTransportadoraId] = useState("");

  useEffect(() => {
    if (!transportadoraId) return;
    api.listDocumentosByTransportadora(transportadoraId)
      .then(setDocs)
      .catch(console.error);
  }, [transportadoraId]);

  return (
    <div className="bg-white rounded-2xl shadow border p-5">
      <h2 className="text-lg font-semibold mb-3">Documentos por Transportadora</h2>

      <div className="flex gap-3 mb-4">
        <input
          className="border rounded-lg px-3 py-2 w-72"
          placeholder="ID da transportadora"
          value={transportadoraId}
          onChange={e => setTransportadoraId(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded-lg border"
          onClick={() => transportadoraId && setTransportadoraId(transportadoraId)}
        >
          Buscar
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border rounded-xl overflow-hidden">
          <thead className="bg-gray-50 text-left text-sm">
            <tr>
              <th className="px-3 py-2 border-b">Tipo</th>
              <th className="px-3 py-2 border-b">Arquivo</th>
              <th className="px-3 py-2 border-b">Vencimento</th>
              <th className="px-3 py-2 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500">Sem documentos</td></tr>
            ) : docs.map(d => (
              <tr key={d.id} className="text-sm hover:bg-gray-50">
                <td className="px-3 py-2 border-b">{d.tipo}</td>
                <td className="px-3 py-2 border-b">{d.nomeArquivo}</td>
                <td className="px-3 py-2 border-b">{d.vencimento ? new Date(d.vencimento).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2 border-b">
                  <span className={`inline-block px-2 py-1 rounded-lg text-xs ${
                    d.valido ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {d.valido ? "Válido" : "Inválido"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
