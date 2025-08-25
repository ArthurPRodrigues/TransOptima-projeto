import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";

const API = import.meta.env.VITE_API_URL;

type KPIs = {
  ativas: number;
  aVencer30: number;
  indisponiveis: number;
};

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs>({ ativas: 0, aVencer30: 0, indisponiveis: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Ajuste conforme seus endpoints reais:
        const [tRes, vRes, iRes] = await Promise.all([
          fetch(`${API}/transportadoras/count`),
          fetch(`${API}/documentos/avencer?dias=30&count=true`),
          fetch(`${API}/disponibilidade?count=true`)
        ]);
        const [ativ, venc, indisp] = await Promise.all([tRes.json(), vRes.json(), iRes.json()]);
        setKpis({
          ativas: ativ?.count ?? 0,
          aVencer30: venc?.count ?? 0,
          indisponiveis: indisp?.count ?? 0
        });
      } catch {
        // fallback caso a API ainda não tenha esses endpoints de count
        // você pode manter assim para demo sem quebrar
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="container">
      <div className="panel">
        <div className="panel__header">Dashboard</div>
        <div className="panel__body">
          <div className="grid">
            <StatCard title="Transportadoras ativas" value={kpis.ativas} loading={loading} />
            <StatCard title="Documentos a vencer (30d)" value={kpis.aVencer30} loading={loading} />
            <StatCard title="Indisponíveis p/ frete" value={kpis.indisponiveis} loading={loading} />
          </div>
        </div>
      </div>
    </section>
  );
}
