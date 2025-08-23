const BASE_URL = "http://localhost:8080"   // ajuste se mudar a porta do backend

const API = (p: string) => (p.startsWith('/') ? BASE_URL + p : `${BASE_URL}/${p}`)

async function fetchJson(url: string, init?: RequestInit) {
  const r = await fetch(url, {
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

/** Documentos */
export async function getDocumentos(): Promise<Documento[]> {
  return fetchJson(API('/admin/documentos'))
}

/** Registros */
export async function getRegistrosByTransportadora(transportadoraId: number): Promise<Registro[]> {
  return fetchJson(API(`/registros?transportadoraId=${transportadoraId}`))
}

export async function postRegistro(body: {
  transportadoraId: number
  documentoId: number
  validade: string
  emissao?: string
  numero?: string
  arquivoUrl?: string
}): Promise<{ registro: Registro; disponivel: boolean }> {
  return fetchJson(API('/registros'), { method: 'POST', body: JSON.stringify(body) })
}

/** Autenticação */
export async function apiLogin(email: string, password: string): Promise<{ token: string }> {
  // Se não tiver /auth/login no back, descomente mock:
  // localStorage.setItem('token', 'fake-token'); return { token: 'fake-token' }

  const res = await fetchJson(API('/auth/login'), {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  localStorage.setItem('token', res.token)
  return res
}

export async function apiLogout(): Promise<void> {
  localStorage.removeItem('token')
}

export function isAuthed(): boolean {
  return !!localStorage.getItem('token')
}
