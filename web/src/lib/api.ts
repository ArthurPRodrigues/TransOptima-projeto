const API = '/api';

export type Transportadora = { id:number; razaoSocial:string; cnpj:string; uf?:string; tiposProduto?: string[] }
export type Documento = { id:number; nome:string; diasAntecedenciaAviso:number; obrigatorio:boolean }

export async function login(email:string, password:string){
  // fake login: aceita qualquer email + 'admin' como senha
  if(!email || password !== 'admin') throw new Error('Credenciais inválidas');
  localStorage.setItem('token','ok');
  return { ok:true };
}
export function logout(){ localStorage.removeItem('token'); }
export function isAuthed(){ return !!localStorage.getItem('token'); }

// TRANSPORTADORAS
export async function listTransportadoras(){ const r=await fetch(`${API}/admin/transportadoras`); if(!r.ok) throw new Error('Falha ao listar'); return await r.json() as Transportadora[] }
export async function createTransportadora(b:Partial<Transportadora>){ const r=await fetch(`${API}/admin/transportadoras`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}); if(!r.ok) throw new Error((await r.json()).error||'Falha ao criar'); return await r.json() }
export async function updateTransportadora(id:number,b:Partial<Transportadora>){ const r=await fetch(`${API}/admin/transportadoras/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}); if(!r.ok) throw new Error((await r.json()).error||'Falha ao atualizar'); return await r.json() }
export async function deleteTransportadora(id:number){ const r=await fetch(`${API}/admin/transportadoras/${id}`,{method:'DELETE'}); if(!r.ok) throw new Error('Falha ao deletar'); return await r.json() }

// DOCUMENTOS
export async function listDocumentos(){ const r=await fetch(`${API}/admin/documentos`); if(!r.ok) throw new Error('Falha ao listar'); return await r.json() as Documento[] }
export async function createDocumento(b:Partial<Documento>){ const r=await fetch(`${API}/admin/documentos`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}); if(!r.ok) throw new Error((await r.json()).error||'Falha ao criar'); return await r.json() }
export async function updateDocumento(id:number,b:Partial<Documento>){ const r=await fetch(`${API}/admin/documentos/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}); if(!r.ok) throw new Error((await r.json()).error||'Falha ao atualizar'); return await r.json() }
export async function deleteDocumento(id:number){ const r=await fetch(`${API}/admin/documentos/${id}`,{method:'DELETE'}); if(!r.ok) throw new Error('Falha ao deletar'); return await r.json() }

// RELATÓRIO
export type VencidoRow = { transportadora:{razaoSocial?:string; uf?:string}; documento:{nome:string}; validade:string; transportadoraId:number; documentoId:number }
export async function listVencidos(){ const r=await fetch(`${API}/relatorios/vencidos`); if(!r.ok) throw new Error('Falha ao carregar vencidos'); const j=await r.json(); return j.itens as VencidoRow[] }
export async function downloadVencidosCsv(){
  const r = await fetch(`${API}/relatorios/vencidos?formato=csv`);
  if (!r.ok) throw new Error('Falha ao gerar CSV');
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='vencidos.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
