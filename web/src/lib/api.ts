// web/src/lib/api.ts
const API = (p: string) => (p.startsWith('/')) ? p : `/${p}`

async function fetchJson(url: string, init?: RequestInit) {
  const r = await fetch(API(url), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

/** Tipos */
export type Documento = {
  id: number
  nome: string
  diasAntecedenciaAviso: number
  obrigatorio: boolean
}

export type Registro = {
  id: number
  transportadoraId: number
  documentoId: number
  numero: string | null
  emissao: string | null
  validade: string
  arquivoUrl: string | null
  ativo: boolean
  createdAt?: string
  documento?: Documento
}

/** Documentos (CRUD já existente) */
export async function getDocumentos(): Promise<Documento[]> {
  return fetchJson('/admin/documentos')
}

/** Registros */
export async function getRegistrosByTransportadora(transportadoraId: number): Promise<Registro[]> {
  return fetchJson(`/registros?transportadoraId=${transportadoraId}`)
}

export async function postRegistro(body: {
  transportadoraId: number
  documentoId: number
  validade: string // 'YYYY-MM-DD'
  emissao?: string
  numero?: string
  arquivoUrl?: string
}): Promise<{ registro: Registro; disponivel: boolean }> {
  return fetchJson('/registros', { method: 'POST', body: JSON.stringify(body) })
}
