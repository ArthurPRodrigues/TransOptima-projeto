export type Transportadora = {
  id: number
  razaoSocial?: string
  uf?: string
}

export type ListResp = {
  disponiveis: Transportadora[]
  indisponiveis: Transportadora[]
}

const API = '/api';

export async function getTransportadoras(params: { uf?: string; produto?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.uf) qs.set('uf', params.uf);
  if (params.produto) qs.set('produto', params.produto);
  const res = await fetch(`${API}/transportadoras?` + qs.toString());
  if (!res.ok) throw new Error('Falha ao listar transportadoras');
  return (await res.json()) as ListResp;
}

export async function postRegistro(body: {
  transportadoraId: number
  documentoId: number
  validade: string
  numero?: string
  arquivoUrl?: string
}) {
  const res = await fetch(`${API}/registros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Falha ao criar registro');
  return data;
}

export async function notifyNow() {
  const res = await fetch(`${API}/admin/notify-now`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Falha ao disparar notificações');
  return data;
}
