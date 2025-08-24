const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export type ListResp<T> = {
  data: T
  total?: number
}

export async function getTransportadoras<T = any[]>(): Promise<ListResp<T>> {
  const r = await fetch(`${API_URL}/transportadoras`, { headers: { 'Accept': 'application/json' } })
  if (!r.ok) throw new Error(`GET /transportadoras -> ${r.status}`)
  const data = await r.json()
  return { data }
}

export async function postRegistro(body: any): Promise<void> {
  const r = await fetch(`${API_URL}/registros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`POST /registros -> ${r.status}`)
}

export async function notifyNow(): Promise<void> {
  // ajuste a rota conforme seu backend; isto aqui evita quebrar o build
  const r = await fetch(`${API_URL}/notifications/run-now`, { method: 'POST' })
  if (!r.ok) throw new Error(`POST /notifications/run-now -> ${r.status}`)
}

export async function downloadVencidosCsv(): Promise<Blob> {
  // ajuste a rota conforme seu backend; isto aqui evita quebrar o build
  const r = await fetch(`${API_URL}/documentos/vencidos.csv`)
  if (!r.ok) throw new Error(`GET /documentos/vencidos.csv -> ${r.status}`)
  return await r.blob()
}
