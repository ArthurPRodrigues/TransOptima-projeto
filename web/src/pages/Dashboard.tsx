import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { api } from "../api";

export default function Dashboard() {
  const [ativas, setAtivas] = useState(0);
  const [vencer, setVencer] = useState(0);
  const [indisp, setIndisp] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, v, i] = await Promise.all([
          api.countTransportadoras(),
          api.countDocsAVencer30(),
          api.countIndisponiveis(),
        ]);
        setAtivas(a);
        setVencer(v);
        setIndisp(i);
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
            <StatCard title="Transportadoras ativas" value={ativas} loading={loading} />
            <StatCard title="Documentos a vencer (30d)" value={vencer} loading={loading} />
            <StatCard title="Indisponíveis p/ frete" value={indisp} loading={loading} />
          </div>
        </div>
      </div>
    </section>
  );
}
