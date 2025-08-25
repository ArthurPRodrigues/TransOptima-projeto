import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

type Transportadora = {
  id: number;
  razaoSocial: string;
  cnpj: string;
  uf: string;
  quimicosControlados: boolean;
  disponivelParaFrete?: boolean;
};

export default function Transportadoras() {
  const [data, setData] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [uf, setUf] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/transportadoras`);
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = uf ? data.filter(d => d.uf === uf) : data;

  return (
    <section className="container">
      <div className="panel">
        <div className="panel__header">Transportadoras</div>
        <div className="panel__body">
          <div className="form__row">
            <label className="form__field" style={{maxWidth: 220}}>
              <span className="form__label">Filtrar por UF</span>
              <select value={uf} onChange={e => setUf(e.target.value)} className="input">
                <option value="">Todas</option>
                {["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="table__wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Razão Social</th>
                  <th>CNPJ</th>
                  <th>UF</th>
                  <th>Controla Químicos?</th>
                  <th>Disponível p/ Frete</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5}>Carregando…</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={5}>Nenhuma transportadora encontrada.</td></tr>
                )}
                {!loading && filtered.map(t => (
                  <tr key={t.id}>
                    <td>{t.razaoSocial}</td>
                    <td>{t.cnpj}</td>
                    <td>{t.uf}</td>
                    <td>{t.quimicosControlados ? "Sim" : "Não"}</td>
                    <td>{t.disponivelParaFrete === false ? "Não" : "Sim"}</td>
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
