import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Transportadora } from "../services/api";

type KPIs = {
  ativas: number;
  indisponiveis: number;
  vencendoEm30d: number;
};

function parseISO(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function isWithinNextNDays(date: Date, n: number): boolean {
  const today = new Date();
  today.setHours(0,0,0,0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + n);
  return date >= today && date <= limit;
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs>({ ativas: 0, indisponiveis: 0, vencendoEm30d: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [transportadoras, documentos] = await Promise.all([
          api.listTransportadoras(),
          api.listDocumentos(), // todos
        ]);

        const ativas = transportadoras.filter(t => t.disponivelParaFrete).length;
        const indisponiveis = transportadoras.length - ativas;

        const vencendoEm30d = documentos.reduce((acc, d) => {
          const v = parseISO(d.validade);
          if (!v) return acc;
          return acc + (isWithinNextNDays(v, 30) ? 1 : 0);
        }, 0);

        if (alive) setKpis({ ativas, indisponiveis, vencendoEm30d });
      } catch (e: any) {
        if (alive) setErr(e?.message || "Falha ao carregar KPIs");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const cards = [
    { title: "Transportadoras ativas", value: kpis.ativas },
    { title: "Documentos a vencer (30 dias)", value: kpis.vencendoEm30d },
    { title: "Indisponíveis p/ frete", value: kpis.indisponiveis },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {err && (
        <div className="rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">
          {err}
        </div>
      )}

      <div className="bg-transparent">
        {loading ? (
          <div className="text-gray-500">Carregando…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div key={c.title} className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="text-sm text-gray-500">{c.title}</div>
                <div className="mt-2 text-3xl font-bold">{c.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
