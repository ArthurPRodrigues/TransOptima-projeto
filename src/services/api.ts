// Camada de acesso à API. Usa o proxy /api definido no vite.config.ts
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

export const api = {
  // Transportadoras
  listTransportadoras: (params: {
    page?: number; size?: number; q?: string; uf?: string;
  }) => {
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

  // Contagens para o dashboard
  counts: () => http<{
    transportadorasAtivas: number;
    documentosVencendo30d: number;
    indisponiveisParaFrete: number;
  }>(`/dashboard/counts`),

  // Documentos (lista simples por transportadora, V1)
  listDocumentosByTransportadora: (id: string) =>
    http<Documento[]>(`/transportadoras/${id}/documentos`),
};

// Tipos básicos (ajuste se sua API retornar campos diferentes)
export type Documento = {
  id: string;
  tipo: string;
  nomeArquivo: string;
  vencimento?: string; // ISO
  valido?: boolean;
};

export type Transportadora = {
  id: string;
  nome: string;
  cnpj: string;
  uf: string;
  disponivelParaFrete?: boolean;
};
