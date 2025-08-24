export const API_BASE = "/api";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export type Documento = {
  id: string;
  tipo: string;
  nomeArquivo: string;
  vencimento?: string;
  valido?: boolean;
};

export type Transportadora = {
  id: string;
  nome: string;
  cnpj: string;
  uf: string;
  disponivelParaFrete?: boolean;
};

export const api = {
  listTransportadoras: (params: { page?: number; size?: number; q?: string; uf?: string }) => {
    const p = new URLSearchParams();
    if (params.page != null) p.set("page", String(params.page));
    if (params.size != null) p.set("size", String(params.size));
    if (params.q) p.set("q", params.q);
    if (params.uf) p.set("uf", params.uf);
    return http<{
      content: Transportadora[];
      totalElements: number;
      totalPages: number;
      page: number;
      size: number;
    }>(`/transportadoras?${p.toString()}`);
  },

  counts: () => http<{
    transportadorasAtivas: number;
    documentosVencendo30d: number;
    indisponiveisParaFrete: number;
  }>(`/dashboard/counts`),

  listDocumentosByTransportadora: (id: string) =>
    http<Documento[]>(`/transportadoras/${id}/documentos`),

  createTransportadora: (payload: { nome: string; cnpj: string; uf: string }) =>
    fetch(API_BASE + "/transportadoras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }),

  uploadDocumento: (transportadoraId: string, data: { tipo: string; vencimento?: string; arquivo: File }) => {
    const form = new FormData();
    form.append("tipo", data.tipo);
    if (data.vencimento) form.append("vencimento", data.vencimento);
    form.append("arquivo", data.arquivo);
    return fetch(`${API_BASE}/transportadoras/${transportadoraId}/documentos`, {
      method: "POST",
      body: form,
    }).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    })
  },
};
