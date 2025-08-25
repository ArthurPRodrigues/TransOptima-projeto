import { useEffect, useState } from "react";
import { api, Documento } from "../services/api";

// Menu de tipos de documento
const DOC_TYPES = [
  "ANVISA", 
  "ANTT", 
  "CRLV", 
  "CNH", 
  "Seguro", 
  "Alvará", 
  "Contrato"
];

export default function DocumentosPage() {
  const [docs, setDocs] = useState<Documento[]>([]);

  // Agora buscamos por CNPJ (não mais por ID direto)
  const [cnpj, setCnpj] = useState("");
  const [transportadoraId, setTransportadoraId] = useState<string | null>(null);

  // Campos do formulário
  const [tipo, setTipo] = useState(DOC_TYPES[0]);
  const [vencimento, setVencimento] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  // Resolve ID a partir do CNPJ e carrega documentos
  const carregarPorCnpj = async () => {
    if (!cnpj.trim()) return;
    const id = await api.resolveTransportadoraIdByCnpj(cnpj.trim());
    setTransportadoraId(id);
  };

  const recarregar = async () => {
    if (!transportadoraId) return;
    const list = await api.listDocumentosByTransportadora(transportadoraId);
    setDocs(list);
  };

  useEffect(() => {
    recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transportadoraId]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo || !tipo) return;

    // Garante ID mesmo que o usuário não clique no botão "Carregar"
    let id = transportadoraId;
    if (!id) {
      id = await api.resolveTransportadoraIdByCnpj(cnpj.trim());
      setTransportadoraId(id);
    }
    if (!id) return;

    await api.uploadDocumento(id, { tipo, vencimento, arquivo });
    setVencimento("");
    setArquivo(null);
    await recarregar();
  };

  return (
    <div className="bg-white rounded-2xl shadow border p-5">
      <h2 className="text-lg font-semibold mb-3">Documentos</h2>

      {/* Busca por CNPJ */}
      <div className="flex flex-col md:flex-row gap-3 items-end mb-4">
        <div className="flex-1 max-w-md">
          <label className="block text-sm mb-1">CNPJ da Transportadora</label>
          <input
            className="border rounded-lg px-3 py-2 w-full"
            placeholder="00.000.000/0001-00"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
          />
        </div>
        <button className="px-3 py-2 rounded-lg border" onClick={carregarPorCnpj}>
          Carregar
        </button>
        {transportadoraId && (
          <span className="text-sm text-gray-600">
            ID resolvido: <code>{transportadoraId}</code>
          </span>
        )}
      </div>

      {/* Formulário de upload */}
      <form onSubmit={enviar} className="grid md:grid-cols-4 gap-3 items-end mb-6">
        <div>
          <label className="block text-sm mb-1">Tipo</label>
          <select
            className="border rounded-lg px-3 py-2 w-full"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Vencimento</label>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 w-full"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Arquivo</label>
          <input
            type="file"
            className="block w-full"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            required
          />
        </div>
        <div>
          <button className="px-4 py-2 rounded-lg border">Enviar</button>
        </div>
      </form>

      {/* Tabela */}
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
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                  Sem documentos
                </td>
              </tr>
            ) : (
              docs.map((d) => (
                <tr key={d.id} className="text-sm hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">{d.tipo}</td>
                  <td className="px-3 py-2 border-b">{d.nomeArquivo}</td>
                  <td className="px-3 py-2 border-b">
                    {d.vencimento ? new Date(d.vencimento).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-2 border-b">
                    <span
                      className={`inline-block px-2 py-1 rounded-lg text-xs ${
                        d.valido ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {d.valido ? "Válido" : "Inválido"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
