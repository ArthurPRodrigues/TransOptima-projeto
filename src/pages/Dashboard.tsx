import { useEffect, useState } from "react";
import { api } from "../services/api";

function Card(props: { title: string; value?: number | string }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 border">
      <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
      <div className="text-3xl font-bold text-gray-900">{props.value ?? "—"}</div>
    </div>
  );
}

export default function Dashboard() {
  type DashboardData = {
    transportadorasAtivas: number;
    documentosVencendo30d: number;
    indisponiveisParaFrete: number;
  };
  const [data, setData] = useState<DashboardData | undefined>();

  useEffect(() => {
    api.counts().then(setData).catch(console.error);
  }, []);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card title="Transportadoras ativas" value={data?.transportadorasAtivas ?? 0} />
      <Card title="Documentos a vencer (30d)" value={data?.documentosVencendo30d ?? 0} />
      <Card title="Indisponíveis p/ frete" value={data?.indisponiveisParaFrete ?? 0} />
    </div>
  );
}
