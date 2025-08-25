import React, { useEffect, useState } from "react";

type Counts = {
  transportadorasAtivas: number;
  documentosVencendo30d: number;
  indisponiveisParaFrete: number;
};

export default function Dashboard() {
  const [data, setData] = useState<Counts | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function fetchCounts(): Promise<Counts> {
    const res = await fetch("/api/dashboard/counts");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    return {
      transportadorasAtivas: Number(j.transportadorasAtivas ?? 0),
      documentosVencendo30d: Number(j.documentosVencendo30d ?? 0),
      indisponiveisParaFrete: Number(j.indisponiveisParaFrete ?? 0),
    };
  }

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const data = await fetchCounts();
        setData(data);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Erro ao carregar");
      }
    })();
  }, []);

  if (err) return <div style={{ color: "crimson" }}>Erro: {err}</div>;
  if (!data) return <div>Carregando…</div>;

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <h2>Transportadoras ativas</h2>
      <div>{data.transportadorasAtivas}</div>

      <h2 style={{ marginTop: 24 }}>Documentos a vencer (30d)</h2>
      <div>{data.documentosVencendo30d}</div>

      <h2 style={{ marginTop: 24 }}>Indisponíveis p/ frete</h2>
      <div>{data.indisponiveisParaFrete}</div>
    </div>
  );
}
