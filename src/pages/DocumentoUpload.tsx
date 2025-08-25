import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Transportadora } from "../services/api";
import { useNavigate } from "react-router-dom";

const TIPOS = ["ANVISA", "ANTT", "Seguro", "CRLV", "Licença Ambiental"]; // ajuste conforme backend

export default function DocumentoUpload() {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [transportadoraId, setTransportadoraId] = useState<number | "">("");
  const [tipo, setTipo] = useState<string>(TIPOS[0]);
  const [numero, setNumero] = useState("");
  const [emissao, setEmissao] = useState("");
  const [validade, setValidade] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const t = await api.listTransportadoras();
        setTransportadoras(t);
      } catch (e: any) {
        setErr(e?.message || "Falha ao carregar transportadoras");
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    if (!transportadoraId) {
      setErr("Selecione a transportadora");
      return;
    }
    setLoading(true);
    try {
      await api.uploadDocumento({
        transportadoraId: Number(transportadoraId),
        tipo,
        numero: numero || undefined,
        emissao: emissao || undefined,
        validade: validade || undefined,
        file,
      });
      navigate("/documentos");
    } catch (e: any) {
      setErr(e?.message || "Falha no upload");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Novo Documento</h1>

      {err && <div className="rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">{err}</div>}

      <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-2xl border shadow-sm p-6 max-w-xl">
        <div>
          <label className="block text-sm mb-1 font-medium">Transportadora</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={transportadoraId}
            onChange={(e) => setTransportadoraId(Number(e.target.value))}
            required
          >
            <option value="">Selecione</option>
            {transportadoras.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Tipo</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            {TIPOS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1 font-medium">Número (opcional)</label>
            <input className="w-full border rounded-lg px-3 py-2" value={numero} onChange={(e)=>setNumero(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">Emissão (opcional)</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" value={emissao} onChange={(e)=>setEmissao(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">Validade (opcional)</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" value={validade} onChange={(e)=>setValidade(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Arquivo (PDF, JPG, PNG, etc.)</label>
          <input type="file" className="w-full border rounded-lg px-3 py-2"
                 onChange={(e)=>setFile(e.target.files?.[0] || null)} />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Enviando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
