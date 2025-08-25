import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const UF_LIST = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

export default function TransportadoraCreate() {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [uf, setUf] = useState("SC");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api.createTransportadora({ nome, cnpj, uf });
      navigate("/transportadoras");
    } catch (error: any) {
      setErr(error?.message || "Erro ao criar transportadora");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nova Transportadora</h1>

      {err && (
        <div className="rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-2xl border shadow-sm p-6 max-w-lg">
        <div>
          <label className="block text-sm mb-1 font-medium">Nome</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">CNPJ</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">UF</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={uf}
            onChange={(e) => setUf(e.target.value)}
          >
            {UF_LIST.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
