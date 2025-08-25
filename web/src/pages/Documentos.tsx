import { useEffect, useState } from "react";
import { api } from "../api";
import type { Documento } from "../types";

export default function Documentos() {
  const [docs, setDocs] = useState<Documento[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [transportadoraId, setTransportadoraId] = useState<string>("");

  async function load() {
    try {
      const arr = await api.listDocumentos();
      setDocs(Array.isArray(arr) ? arr : []);
    } catch { /* empty */ }
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !transportadoraId) return;
    const form = new FormData();
    form.append("arquivo", file);
    try {
      await api.uploadDocumento(Number(transportadoraId), form);
      setFile(null);
      setTransportadoraId("");
      await load();
      alert("Upload realizado.");
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    }
  }

  return (
    <section className="container">
      <div className="panel">
        <div className="panel__header">Documentos</div>
        <div className="panel__body">

          <form className="form" onSubmit={handleUpload}>
            <div className="form__grid">
              <label className="form__field">
                <span className="form__label">Transportadora ID</span>
                <input className="input" value={transportadoraId} onChange={e => setTransportadoraId(e.target.value)} placeholder="ex.: 1" />
              </label>
              <label className="form__field">
                <span className="form__label">Arquivo</span>
                <input className="input" type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div className="form__footer">
              <button type="submit" className="btn">Enviar</button>
            </div>
          </form>

          <div className="table__spacer" />

          <div className="table__wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Emissão</th>
                  <th>Vencimento</th>
                  <th>Transportadora</th>
                </tr>
              </thead>
              <tbody>
                {docs.length === 0 && <tr><td colSpan={5}>Sem documentos cadastrados.</td></tr>}
                {docs.map(d => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.tipo ?? d.tipoDocumentoId ?? "-"}</td>
                    <td>{d.emissao ?? "-"}</td>
                    <td>{d.vencimento ?? "-"}</td>
                    <td>{d.transportadoraId}</td>
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
