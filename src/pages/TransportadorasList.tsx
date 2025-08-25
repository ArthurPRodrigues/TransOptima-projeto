import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { Transportadora } from "../services/api";

export default function TransportadorasList() {
  const [data, setData] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await api.listTransportadoras();
        if (alive) setData(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Falha ao carregar transportadoras");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transportadoras</h1>
        <Link
          to="/transportadoras/create"
          className="px-3 py-2 rounded-xl border bg-blue-600 text-white hover:bg-blue-700"
        >
          Nova
        </Link>
      </div>

      {err && (
        <div className="rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">
          {err}
        </div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm">
        {loading ? (
          <div className="p-6 text-gray-500">Carregando…</div>
        ) : data.length === 0 ? (
          <div className="p-6 text-gray-500">Nenhuma transportadora cadastrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">CNPJ</th>
                  <th className="px-4 py-3 font-semibold">UF</th>
                  <th className="px-4 py-3 font-semibold">Disponível p/ frete</th>
                </tr>
              </thead>
              <tbody>
                {data.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-3">{t.id}</td>
                    <td className="px-4 py-3">{t.nome}</td>
                    <td className="px-4 py-3">{t.cnpj}</td>
                    <td className="px-4 py-3">{t.uf}</td>
                    <td className="px-4 py-3">
                      {t.disponivelParaFrete ? (
                        <span className="inline-block rounded-full bg-green-100 text-green-700 px-2 py-0.5">
                          Sim
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-red-100 text-red-700 px-2 py-0.5">
                          Não
                        </span>
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
