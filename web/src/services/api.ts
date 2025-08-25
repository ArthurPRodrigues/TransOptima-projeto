// Camada de acesso à API. Usa o proxy /api do Vite (vite.config.ts).
export const API_BASE = "/api";

function onlyDigits(s: string) {
  return (s || "").replace(/\D+/g, "");
}

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

/** --------- Tipos que batem com o backend --------- */
export type TipoDocumento = {
  id: string;
  nome: string;
  slug: string;
  diasAviso: number;
  obrigatorio: boolean;
};

export type DocumentoApi = {
  id: string;
  nomeOriginal: string;
  caminhoArquivo: string;
  mimeType: string;
  tamanhoBytes: number;
  validade: string | null;
  observacoes?: string | null;
  tipo: { id: string; nome: string; slug: string };
  createdAt: string;
  updatedAt: string;
};

export type Transportadora = {
  id: string;
  nome: string;
  cnpj: string;
  uf: string | null;
  disponivelParaFrete: boolean;
};

/** --------- Endpoints --------- */
export const api = {

  // Transportadoras
  createTransportadora: (data: Omit<Transportadora, "id">) => http<Transportadora>(`/transportadoras`, {
    method: "POST",
    body: JSON.stringify(data),
  }),

  // Tipos de documento
  listTipos: () => http<TipoDocumento[]>(`/tipos-documento`),

  // Transportadoras
  listTransportadoras: () => http<Transportadora[]>(`/transportadoras`),

  // Documentos por CNPJ (CNPJ LIMPO)
  listDocumentosByCnpj: (cnpjLimpo: string, params?: {
    tipoSlug?: string;
    vencendoEmDias?: number;
    vencidos?: boolean;
  }) => {
    const p = new URLSearchParams();
    if (params?.tipoSlug) p.set("tipoSlug", params.tipoSlug);
    if (params?.vencendoEmDias != null) p.set("vencendoEmDias", String(params.vencendoEmDias));
    if (params?.vencidos != null) p.set("vencidos", String(params.vencidos));
    return http<DocumentoApi[]>(`/transportadoras/${onlyDigits(cnpjLimpo)}/documentos?${p.toString()}`);
  },

  // Upload: multipart/form-data (NÃO definir Content-Type manualmente)
  uploadDocumento: async (cnpj: string, data: {
    file: File;
    tipoSlug: string;         // ou tipoDocumentoId
    validade?: string;        // "YYYY-MM-DD"
    observacoes?: string;
  }) => {
    const fd = new FormData();
    fd.set("file", data.file);
    fd.set("tipoSlug", data.tipoSlug);
    if (data.validade) fd.set("validade", data.validade);
    if (data.observacoes) fd.set("observacoes", data.observacoes);

    const res = await fetch(`${API_BASE}/transportadoras/${onlyDigits(cnpj)}/documentos`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} - ${text || res.statusText}`);
    }
    return (await res.json()) as DocumentoApi;
  },

  // Download: abre em nova aba/força download
  downloadDocumento: (id: string) => {
    window.open(`${API_BASE}/documentos/${id}/download`, "_blank");
  },

  // Excluir
  deleteDocumento: async (id: string) => {
    const res = await fetch(`${API_BASE}/documentos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} - ${text || res.statusText}`);
    }
    return true;
  },
};

export const utils = { onlyDigits };
