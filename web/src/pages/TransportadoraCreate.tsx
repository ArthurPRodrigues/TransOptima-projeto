import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

const UF_LIST = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

export default function TransportadoraCreate() {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [uf, setUf] = useState("SC");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      await api.createTransportadora({ nome, cnpj, uf });
      navigate("/transportadoras");
    } catch (e: any) {
      setErr(e.message || "Erro ao criar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow border p-5 max-w-xl">
      <h2 className="text-lg font-semibold mb-4">Nova Transportadora</h2>
      {err && <div className="mb-3 text-sm text-red-700">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Nome</label>
          <input className="w-full border rounded-lg px-3 py-2" value={nome} onChange={e=>setNome(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">CNPJ</label>
          <input className="w-full border rounded-lg px-3 py-2" value={cnpj} onChange={e=>setCnpj(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">UF</label>
          <select className="border rounded-lg px-3 py-2" value={uf} onChange={e=>setUf(e.target.value)}>
            {UF_LIST.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="pt-2">
          <button disabled={loading} className="px-4 py-2 rounded-lg border">
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
