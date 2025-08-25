import React, { useEffect, useMemo, useState } from "react";
import { api, type DocumentoApi, type TipoDocumento, utils } from "../services/api";

function formatDateISO(d?: string | null) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toISOString().slice(0, 10); // YYYY-MM-DD
  } catch {
    return "-";
  }
}

function isValido(validade?: string | null) {
  if (!validade) return true;
  const now = new Date();
  return new Date(validade) >= new Date(now.toISOString().slice(0, 10));
}

export default function DocumentosPage() {
  // Formulário
  const [cnpj, setCnpj] = useState("");
  const [tipoSlug, setTipoSlug] = useState<string>("");
  const [validade, setValidade] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  // Estado
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [docs, setDocs] = useState<DocumentoApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [filtroVencendoDias, setFiltroVencendoDias] = useState<number | "">("");
  const [filtroVencidos, setFiltroVencidos] = useState<boolean>(false);

  const cnpjLimpo = useMemo(() => utils.onlyDigits(cnpj), [cnpj]);

  // Carregar tipos ao montar
  useEffect(() => {
    (async () => {
      try {
        const ts = await api.listTipos();
        setTipos(ts);
        if (ts.length && !tipoSlug) setTipoSlug(ts[0].slug);
      } catch (e: unknown) {
        console.error(e);
      }
    })();
  }, []);

  async function carregarLista() {
    if (!cnpjLimpo) return;
    setLoading(true);
    setErr(null);
    try {
      const list = await api.listDocumentosByCnpj(cnpjLimpo, {
        tipoSlug: filtroTipo || undefined,
        vencendoEmDias: filtroVencendoDias === "" ? undefined : Number(filtroVencendoDias),
        vencidos: filtroVencidos || undefined,
      });
      setDocs(list);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao buscar documentos");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!cnpjLimpo) return setErr("Informe um CNPJ válido.");
    if (!file) return setErr("Selecione um arquivo.");
    try {
      setErr(null);
      await api.uploadDocumento(cnpjLimpo, {
        file,
        tipoSlug,
        validade: validade || undefined,
        observacoes: observacoes || undefined,
      });
      setFile(null);
      // limpa campos opcionais
      setObservacoes("");
      await carregarLista();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Falha no upload");
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este documento?")) return;
    try {
      await api.deleteDocumento(id);
      await carregarLista();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <h1>Documentos</h1>

      {/* Formulário de busca e upload */}
      <form onSubmit={handleUpload} style={{ display: "grid", gap: 12, maxWidth: 720 }}>
        <label>
          CNPJ da Transportadora
          <input
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="12.345.678/0001-90"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={carregarLista}
            disabled={!cnpjLimpo || loading}
            style={{ padding: "8px 12px" }}
          >
            Carregar documentos
          </button>
          {cnpjLimpo && (
            <span style={{ alignSelf: "center", opacity: 0.7 }}>
              CNPJ limpo: <code>{cnpjLimpo}</code>
            </span>
          )}
        </div>

        <fieldset style={{ border: "1px solid #eee", padding: 12 }}>
          <legend>Enviar novo documento</legend>

          <div style={{ display: "grid", gap: 12 }}>
            <label>
              Tipo
              <select
                value={tipoSlug}
                onChange={(e) => setTipoSlug(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              >
                {tipos.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Validade (opcional)
              <input
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                style={{ padding: 8, width: "100%", marginTop: 4 }}
              />
            </label>

            <label>
              Observações (opcional)
              <input
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex.: renovado, apólice nova…"
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>

            <label>
              Arquivo
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ marginTop: 4 }}
                accept="application/pdf,image/*"
              />
            </label>

            <button type="submit" disabled={!file || !cnpjLimpo} style={{ padding: "8px 12px" }}>
              Enviar
            </button>
          </div>
        </fieldset>
      </form>

      {err && (
        <div style={{ color: "crimson", marginTop: 16 }}>
          <strong>Erro:</strong> {err}
        </div>
      )}

      <hr style={{ margin: "24px 0" }} />

      {/* Filtros da lista */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label>
          Tipo:
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            style={{ marginLeft: 8, padding: 6 }}
          >
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>

        <label>
          Vencendo em (dias):
          <input
            type="number"
            value={filtroVencendoDias}
            onChange={(e) => setFiltroVencendoDias(e.target.value === "" ? "" : Number(e.target.value))}
            style={{ width: 100, marginLeft: 8, padding: 6 }}
            min={0}
          />
        </label>

        <label style={{ display: "flex", gap: 6 }}>
          <input
            type="checkbox"
            checked={filtroVencidos}
            onChange={(e) => setFiltroVencidos(e.target.checked)}
          />
          Vencidos
        </label>

        <button onClick={carregarLista} disabled={!cnpjLimpo || loading} style={{ padding: "6px 10px" }}>
          Aplicar filtros
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div>Carregando…</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Tipo</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Arquivo</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Validade</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Status</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => {
              const valido = isValido(d.validade);
              return (
                <tr key={d.id}>
                  <td style={{ padding: 8 }}>{d.tipo?.nome ?? "-"}</td>
                  <td style={{ padding: 8 }}>{d.nomeOriginal}</td>
                  <td style={{ padding: 8 }}>{formatDateISO(d.validade)}</td>
                  <td style={{ padding: 8 }}>{valido ? "✅ Válido" : "❌ Vencido"}</td>
                  <td style={{ padding: 8, display: "flex", gap: 8 }}>
                    <button onClick={() => api.downloadDocumento(d.id)}>Baixar</button>
                    <button onClick={() => excluir(d.id)} style={{ color: "crimson" }}>
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
            {!docs.length && (
              <tr>
                <td colSpan={5} style={{ padding: 12, opacity: 0.6 }}>
                  Nenhum documento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
