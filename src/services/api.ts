// src/services/api.ts
export type TransportadoraPayload = {
  nome: string;
  cnpj: string;
  uf: string;
};

export type Transportadora = {
  id: number;
  nome: string;
  cnpj: string;
  uf: string;
  disponivelParaFrete?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// MESMO BASE_URL já usado no create:
const BASE_URL = "http://localhost:3000";

async function createTransportadora(body: TransportadoraPayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/transportadoras`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const data = await res.json(); msg = data?.message || data?.error || msg; }
    catch { try { msg = (await res.text()) || msg; } catch {} }
    throw new Error(msg);
  }
}

async function listTransportadoras(): Promise<Transportadora[]> {
  const res = await fetch(`${BASE_URL}/transportadoras`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const data = await res.json(); msg = data?.message || data?.error || msg; }
    catch { try { msg = (await res.text()) || msg; } catch {} }
    throw new Error(msg);
  }
  return res.json();
}

async function listDocumentos(transportadoraId?: number): Promise<Document[]> {
  const res = await fetch(`${BASE_URL}/documentos?transportadoraId=${transportadoraId}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const data = await res.json(); msg = data?.message || data?.error || msg; }
    catch { try { msg = (await res.text()) || msg; } catch {} }
    throw new Error(msg);
  }
  return res.json();
}

async function uploadDocumento(data: {
  transportadoraId: number;
  tipo: string;
  numero: string;
  emissao: string;
  validade: string;
  arquivo: File;
}): Promise<void> {
  const formData = new FormData();
  formData.append("transportadoraId", String(data.transportadoraId));
  formData.append("tipo", data.tipo);
  formData.append("numero", data.numero);
  formData.append("emissao", data.emissao);
  formData.append("validade", data.validade);
  formData.append("arquivo", data.arquivo);

  const res = await fetch(`${BASE_URL}/documentos`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const data = await res.json(); msg = data?.message || data?.error || msg; }
    catch { try { msg = (await res.text()) || msg; } catch {} }
    throw new Error(msg);
  }
}

export const api = { createTransportadora, listTransportadoras, listDocumentos, uploadDocumento };
