import { useEffect, useState } from "react";
import { api } from "../api";
import type { Transportadora } from "../types";

const UFS = ["","AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

export default function Disponibilidade() {
  const [uf, setUf] = useState<string>("");
  const [produto, setProduto] = useState<"quimico"|"nao_quimico"|"">("");
  const [data, setData] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const arr = await api.disponibilidade({ uf: uf || undefined, produto: (produto || undefined) as any });
      setData(Array.isArray(arr) ? arr : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // inicial

  return (
    <section className="container">
      <div className="panel">
        <div className="panel__header">Disponibilidade para Frete</div>
        <div className="panel__body">

          <div className="form__row" style={{gap: 16}}>
            <label className="form__field">
              <span className="form__label">UF</span>
              <select className="input" value={uf} onChange={e => setUf(e.target.value)}>
                {UFS.map(u => <option key={u || "t"} value={u}>{u || "Todas"}</option>)}
              </select>
            </label>

            <label className="form__field">
              <span className="form__label">Produto</span>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <select className="input" value={produto} onChange={e => setProduto(e.target.value as any)}>
                <option value="">Todos</option>
                <option value="quimico">Químico</option>
                <option value="nao_quimico">Não químico</option>
              </select>
            </label>

            <button className="btn" onClick={load}>Aplicar</button>
          </div>

          <div className="table__spacer" />

          <div className="table__wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Razão Social</th>
                  <th>UF</th>
                  <th>Químicos</th>
                  <th>Disponível</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={4}>Carregando…</td></tr>}
                {!loading && data.length === 0 && <tr><td colSpan={4}>Nenhuma transportadora encontrada.</td></tr>}
                {!loading && data.map(t => (
                  <tr key={t.id}>
                    <td>{t.razaoSocial}</td>
                    <td>{t.uf}</td>
                    <td><span className={`badge ${t.quimicosControlados ? "badge--ok" : ""}`}>{t.quimicosControlados ? "Sim" : "Não"}</span></td>
                    <td><span className={`badge ${t.disponivelParaFrete === false ? "badge--warn" : "badge--ok"}`}>{t.disponivelParaFrete === false ? "Não" : "Sim"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </section>
  );
}
