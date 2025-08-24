import { useEffect, useMemo, useState } from "react";
import { api, Transportadora } from "../services/api";
import { useDebounce } from "../hooks/useDeBounce";

const UF_LIST = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

export default function TransportadorasPage() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
  const [uf, setUf] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [rows, setRows] = useState([] as Transportadora[]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  useEffect(() => {
    setLoading(true);
    api
      .listTransportadoras({ page, size, q: dq.trim(), uf })
      .then((res) => {
        setRows(res.content);
        setTotal(res.totalElements);
        setTotalPages(res.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, size, dq, uf]);

  const info = useMemo(
    () => `Página ${page + 1} de ${Math.max(totalPages, 1)} — ${total} registro(s)`,
    [page, totalPages, total]
  );

  return (
    <div className="bg-white rounded-2xl shadow border p-5">
      <div className="flex flex-col md:flex-row gap-3 md:items-end mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Buscar por nome/CNPJ</label>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            placeholder="Ex.: Trans XYZ ou 00.000.000/0000-00"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">UF</label>
          <select
            value={uf}
            onChange={(e) => { setUf(e.target.value); setPage(0); }}
            className="rounded-lg border px-3 py-2"
          >
            <option value="">Todas</option>
            {UF_LIST.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tamanho</label>
          <select value={size} onChange={(e)=>{ setSize(Number(e.target.value)); setPage(0); }} className="rounded-lg border px-3 py-2">
            {[5,10,20,50].map(s=><option key={s} value={s}>{s}/página</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border rounded-xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm">
              <th className="px-3 py-2 border-b">Nome</th>
              <th className="px-3 py-2 border-b">CNPJ</th>
              <th className="px-3 py-2 border-b">UF</th>
              <th className="px-3 py-2 border-b">Disponível p/ frete</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500">Carregando…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500">Nenhum registro</td></tr>
            ) : (
              rows.map(r => (
                <tr key={r.id} className="text-sm hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">{r.nome}</td>
                  <td className="px-3 py-2 border-b">{r.cnpj}</td>
                  <td className="px-3 py-2 border-b">{r.uf}</td>
                  <td className="px-3 py-2 border-b">
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs ${
                      r.disponivelParaFrete ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {r.disponivelParaFrete ? "Disponível" : "Indisponível"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-600">{info}</span>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-lg border disabled:opacity-50"
            disabled={!canPrev}
            onClick={()=> setPage(p => Math.max(p-1,0))}
          >
            ◀ Anterior
          </button>
          <button
            className="px-3 py-2 rounded-lg border disabled:opacity-50"
            disabled={!canNext}
            onClick={()=> setPage(p => p+1)}
          >
            Próxima ▶
          </button>
        </div>
      </div>
    </div>
  );
}
