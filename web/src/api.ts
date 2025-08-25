const API = import.meta.env.VITE_API_URL as string;

async function http<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  // @ts-ignore
  return (await res.text()) as T;
}

export const api = {
  base: API,

  // Transportadoras
  listTransportadoras: () => http(`${API}/transportadoras`),
  getTransportadora: (id: number) => http(`${API}/transportadoras/${id}`),
  createTransportadora: (data: any) =>
    http(`${API}/transportadoras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateTransportadora: (id: number, data: any) =>
    http(`${API}/transportadoras/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteTransportadora: (id: number) =>
    http(`${API}/transportadoras/${id}`, { method: "DELETE" }),

  // Documentos
  listDocumentos: () => http(`${API}/documentos`),
  listDocsByTransportadora: (id: number) =>
    http(`${API}/transportadoras/${id}/documentos`),
  uploadDocumento: (id: number, form: FormData) =>
    http(`${API}/transportadoras/${id}/documentos`, { method: "POST", body: form }),

  // Disponibilidade
  disponibilidade: (params: { uf?: string; produto?: "quimico" | "nao_quimico" }) => {
    const q = new URLSearchParams();
    if (params.uf) q.set("uf", params.uf);
    if (params.produto) q.set("produto", params.produto);
    return http(`${API}/disponibilidade?${q.toString()}`);
  },

  // KPIs (com fallback)
  countTransportadoras: async (): Promise<number> => {
    try {
      const r: any = await http(`${API}/transportadoras/count`);
      return r?.count ?? 0;
    } catch {
      const list: any[] = await api.listTransportadoras();
      return list.length;
    }
  },
  countDocsAVencer30: async (): Promise<number> => {
    try {
      const r: any = await http(`${API}/documentos/avencer?dias=30&count=true`);
      return r?.count ?? 0;
    } catch {
      try {
        const arr: any[] = await http(`${API}/documentos/avencer?dias=30`);
        return Array.isArray(arr) ? arr.length : 0;
      } catch {
        return 0;
      }
    }
  },
  countIndisponiveis: async (): Promise<number> => {
    try {
      const arr: any[] = await api.disponibilidade({});
      // se endpoint retornar array com flag disponivelParaFrete
      const list = Array.isArray(arr) ? arr : [];
      const indis = list.filter((t: any) => t.disponivelParaFrete === false).length;
      return indis || 0;
    } catch {
      return 0;
    }
  },
};
