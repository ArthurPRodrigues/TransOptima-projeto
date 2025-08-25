import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import type {Transportadora } from "../services/api";
import { Link } from "react-router-dom";

function formatISODate(d?: string | null) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  try {
    return dt.toLocaleDateString("pt-BR");
  } catch {
    return d.slice(0, 10);
  }
}

export default function DocumentosPage() {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [selectedId, setSelectedId] = useState<number | "all">("all");
  const [docs, setDocs] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // id -> nome para exibir na tabela
  const nomePorId = useMemo(() => {
    const m = new Map<number, string>();          // ✅ só uma vez
    transportadoras.forEach((t) => m.set(t.id, t.nome));
    return m;
  }, [transportadoras]);

  // Carrega transportadoras
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const t = await api.listTransportadoras();
        if (alive) setTransportadoras(t);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Falha ao carregar transportadoras");
      }
    })();
    return () => { alive = false; };              // ✅ arrow aqui
  }, []);

  // Carrega documentos conforme filtro
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const list = await api.listDocumentos(
          selectedId === "all" ? undefined : Number(selectedId) // ✅ sem apóstrofo
        );
        if (alive) setDocs(list);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Falha ao carregar documentos");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentos</h1>
        <Link
          to="/documentos/upload"
          className="px-3 py-2 rounded-xl border bg-blue-600 text-white hover:bg-blue-700"
        >
          Novo documento
        </Link>
      </div>

      <div className="flex gap-3 items-center">
        <label className="text-sm text-gray-600">Transportadora:</label>
        <select
          className="border rounded-lg px-3 py-2"
          value={selectedId}
          onChange={(e) =>
            setSelectedId(e.target.value === "all" ? "all" : Number(e.target.value))
          }
        >
          <option value="all">Todas</option>
          {transportadoras.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      {err && (
        <div className="rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">
          {err}
        </div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm">
        {loading ? (
          <div className="p-6 text-gray-500">Carregando…</div>
        ) : docs.length === 0 ? (
          <div className="p-6 text-gray-500">Nenhum documento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Transportadora</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Número</th>
                  <th className="px-4 py-3 font-semibold">Emissão</th>
                  <th className="px-4 py-3 font-semibold">Validade</th>
                  <th className="px-4 py-3 font-semibold">Situação</th>
                  <th className="px-4 py-3 font-semibold">Arquivo</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="px-4 py-3">{d.id}</td>
                    <td className="px-4 py-3">
                      {nomePorId.get(d.transportadoraId) || d.transportadoraId}
                    </td>
                    <td className="px-4 py-3">{d.tipo}</td>
                    <td className="px-4 py-3">{d.numero || "-"}</td>
                    <td className="px-4 py-3">{formatISODate(d.emissao)}</td>
                    <td className="px-4 py-3">{formatISODate(d.validade)}</td>
                    <td className="px-4 py-3">
                      {d.situacao === "VENCIDO" ? (
                        <span className="inline-block rounded-full bg-red-100 text-red-700 px-2 py-0.5">Vencido</span>
                      ) : d.situacao === "A_VENCER" ? (
                        <span className="inline-block rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5">A vencer</span>
                      ) : (
                        <span className="inline-block rounded-full bg-green-100 text-green-700 px-2 py-0.5">Válido</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {d.arquivoUrl ? (
                        <a
                          className="text-blue-600 hover:underline"
                          href={d.arquivoUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
