import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import type { Transportadora } from "../types";
import Modal from "../components/Modal";
import { Link } from "react-router-dom";

const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

type FormState = {
  razaoSocial: string;
  cnpj: string;
  uf: string;
  quimicosControlados: boolean;
};

export default function Transportadoras() {
  const [data, setData] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [uf, setUf] = useState<string>("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({
    razaoSocial: "",
    cnpj: "",
    uf: "SC",
    quimicosControlados: false,
  });

  async function load() {
    setLoading(true);
    try {
      const list = await api.listTransportadoras();
      setData(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return data
      .filter(d => (uf ? d.uf === uf : true))
      .filter(d => (search ? d.razaoSocial.toLowerCase().includes(search.toLowerCase()) || d.cnpj.includes(search) : true));
  }, [data, uf, search]);

  function openCreate() {
    setEditId(null);
    setForm({ razaoSocial: "", cnpj: "", uf: "SC", quimicosControlados: false });
    setOpen(true);
  }

  function openEdit(t: Transportadora) {
    setEditId(t.id);
    setForm({
      razaoSocial: t.razaoSocial,
      cnpj: t.cnpj,
      uf: t.uf,
      quimicosControlados: !!t.quimicosControlados,
    });
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editId) await api.updateTransportadora(editId, form);
      else await api.createTransportadora(form);
      setOpen(false);
      await load();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    }
  }

  async function del(id: number) {
    if (!confirm("Remover transportadora?")) return;
    try {
      await api.deleteTransportadora(id);
      await load();
    } catch (err: any) {
      alert("Erro ao remover: " + err.message);
    }
  }

  return (
    <section className="container">
      <div className="panel">
        <div className="panel__header">Transportadoras</div>
        <div className="panel__body">

          <div className="form__row" style={{justifyContent: "space-between"}}>
            <div className="form__row">
              <label className="form__field" style={{maxWidth: 220}}>
                <span className="form__label">UF</span>
                <select value={uf} onChange={e => setUf(e.target.value)} className="input">
                  <option value="">Todas</option>
                  {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </label>
              <label className="form__field" style={{minWidth: 260}}>
                <span className="form__label">Buscar</span>
                <input className="input" placeholder="Razão social ou CNPJ" value={search} onChange={e => setSearch(e.target.value)} />
              </label>
            </div>

            <button className="btn" onClick={openCreate}>Nova Transportadora</button>
          </div>

          <div className="table__wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Razão Social</th>
                  <th>CNPJ</th>
                  <th>UF</th>
                  <th>Químicos</th>
                  <th>Disponível</th>
                  <th style={{width: 160}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6}>Carregando…</td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={6}>Nenhuma transportadora encontrada.</td></tr>}
                {!loading && filtered.map(t => (
                  <tr key={t.id}>
                    <td><Link to={`/transportadoras/${t.id}`}>{t.razaoSocial}</Link></td>
                    <td>{t.cnpj}</td>
                    <td>{t.uf}</td>
                    <td><span className={`badge ${t.quimicosControlados ? "badge--ok" : ""}`}>{t.quimicosControlados ? "Sim" : "Não"}</span></td>
                    <td><span className={`badge ${t.disponivelParaFrete === false ? "badge--warn" : "badge--ok"}`}>{t.disponivelParaFrete === false ? "Não" : "Sim"}</span></td>
                    <td>
                      <div className="table__actions">
                        <button className="btn btn--sm" onClick={() => openEdit(t)}>Editar</button>
                        <button className="btn btn--sm btn--danger" onClick={() => del(t.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Editar Transportadora" : "Nova Transportadora"}>
        <form className="form" onSubmit={submit}>
          <div className="form__grid">
            <label className="form__field">
              <span className="form__label">Razão Social</span>
              <input className="input" required value={form.razaoSocial} onChange={e => setForm(s => ({...s, razaoSocial: e.target.value}))} />
            </label>

            <label className="form__field">
              <span className="form__label">CNPJ</span>
              <input className="input" required value={form.cnpj} onChange={e => setForm(s => ({...s, cnpj: e.target.value}))} />
            </label>

            <label className="form__field">
              <span className="form__label">UF</span>
              <select className="input" value={form.uf} onChange={e => setForm(s => ({...s, uf: e.target.value}))}>
                {UFS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </label>

            <label className="form__field">
              <span className="form__label">Químicos controlados?</span>
              <select className="input" value={String(form.quimicosControlados)} onChange={e => setForm(s => ({...s, quimicosControlados: e.target.value === "true"}))}>
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </label>
          </div>

          <div className="form__footer">
            <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button type="submit" className="btn">{editId ? "Salvar" : "Cadastrar"}</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
