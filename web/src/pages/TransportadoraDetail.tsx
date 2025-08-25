import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import type { Documento, Transportadora } from "../types";

export default function TransportadoraDetail() {
  const { id } = useParams();
  const tid = Number(id);
  const [t, setT] = useState<Transportadora | null>(null);
  const [docs, setDocs] = useState<Documento[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [tipoDocumentoId, setTipoDocumentoId] = useState<string>("");

  async function load() {
    try {
      const [tt, dd] = await Promise.all([
        api.getTransportadora(tid),
        api.listDocsByTransportadora(tid),
      ]);
      setT(tt);
      setDocs(Array.isArray(dd) ? dd : []);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-unused-vars
    } catch (e) {null}
  }

  useEffect(() => { load(); }, [tid]);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Selecione um arquivo.");
    const form = new FormData();
    form.append("arquivo", file);
    if (tipoDocumentoId) form.append("tipoDocumentoId", tipoDocumentoId);
    try {
      await api.uploadDocumento(tid, form);
      setFile(null);
      setTipoDocumentoId("");
      await load();
      alert("Upload realizado.");
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    }
  }

  return (
    <section className="container">
      <div className="panel">
        <div className="panel__header">{t ? t.razaoSocial : "Transportadora"}</div>
        <div className="panel__body">

          <div className="form__row" style={{justifyContent: "space-between", alignItems: "center"}}>
            <div>
              <div className="muted">CNPJ: {t?.cnpj} • UF: {t?.uf} • Químicos: {t?.quimicosControlados ? "Sim" : "Não"}</div>
            </div>
            <Link className="btn btn--ghost" to="/transportadoras">← Voltar</Link>
          </div>

          <h3 style={{marginTop: 10}}>Documentos</h3>
          <form className="form" onSubmit={onUpload}>
            <div className="form__grid">
              <label className="form__field">
                <span className="form__label">Tipo de Documento (id)</span>
                <input className="input" placeholder="ex.: 1" value={tipoDocumentoId} onChange={e => setTipoDocumentoId(e.target.value)} />
              </label>
              <label className="form__field">
                <span className="form__label">Arquivo</span>
                <input className="input" type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div className="form__footer">
              <button className="btn" type="submit">Enviar</button>
            </div>
          </form>

          <div className="table__spacer"></div>

          <div className="table__wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Emissão</th>
                  <th>Vencimento</th>
                  <th>Arquivo</th>
                </tr>
              </thead>
              <tbody>
                {docs.length === 0 && <tr><td colSpan={5}>Nenhum documento.</td></tr>}
                {docs.map(d => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.tipo ?? d.tipoDocumentoId ?? "-"}</td>
                    <td>{d.emissao ?? "-"}</td>
                    <td>{d.vencimento ?? "-"}</td>
                    <td>{d.arquivo ?? "-"}</td>
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
