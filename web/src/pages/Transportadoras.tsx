// web/src/pages/Transportadoras.tsx
import React, { useEffect, useState } from 'react'
import {
  listTransportadoras,
  createTransportadora,
  updateTransportadora,
  deleteTransportadora,
  type Transportadora,
  getDocumentos,
  getRegistrosByTransportadora,
  postRegistro,
  type Documento,
  type Registro,
} from '../lib/api'
import { X } from 'lucide-react'

function fmtDate(d?: string | null) {
  if (!d) return '-'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return '-'
  return dt.toLocaleDateString('pt-BR')
}
function fmtDateTime(d?: string | null) {
  if (!d) return '-'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return '-'
  return dt.toLocaleString('pt-BR')
}

export default function TransportadorasPage() {
  // lista + form CRUD
  const [rows, setRows] = useState<Transportadora[]>([])
  const [f, setF] = useState<Partial<Transportadora>>({ razaoSocial: '', cnpj: '', uf: '' })
  const [editId, setEditId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // registros por transportadora
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [registrosMap, setRegistrosMap] = useState<Record<number, Registro[]>>({})
  const [loadingRegs, setLoadingRegs] = useState<Record<number, boolean>>({})

  // modal "registrar documento"
  const [openReg, setOpenReg] = useState<null | { id: number; nome: string }>(null)
  const [docs, setDocs] = useState<Documento[]>([])
  const [docId, setDocId] = useState<string>('')
  const [emissao, setEmissao] = useState<string>('')
  const [validadeReg, setValidadeReg] = useState<string>('')
  const [numeroReg, setNumeroReg] = useState<string>('')
  const [urlReg, setUrlReg] = useState<string>('')
  const [savingReg, setSavingReg] = useState(false)

  async function load() {
    setLoading(true)
    try {
      setRows(await listTransportadoras())
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function save() {
    setMsg('')
    try {
      const body = { ...f, uf: (f.uf || '').toUpperCase() }
      if (editId) {
        await updateTransportadora(editId, body)
        setMsg('Atualizado!')
      } else {
        await createTransportadora(body)
        setMsg('Criado!')
      }
      setF({ razaoSocial: '', cnpj: '', uf: '' })
      setEditId(null)
      await load()
    } catch (e: any) {
      setMsg(e?.message || 'Erro ao salvar')
    }
  }

  async function del(id: number) {
    if (!confirm('Remover esta transportadora?')) return
    await deleteTransportadora(id)
    await load()
  }

  function startEdit(t: Transportadora) {
    setEditId(t.id)
    setF({ razaoSocial: t.razaoSocial, cnpj: t.cnpj, uf: t.uf })
  }

  async function toggleRegistros(tid: number) {
    const willExpand = !expanded[tid]
    setExpanded(prev => ({ ...prev, [tid]: willExpand }))
    if (willExpand && !registrosMap[tid]) {
      setLoadingRegs(prev => ({ ...prev, [tid]: true }))
      try {
        const rows = await getRegistrosByTransportadora(tid)
        setRegistrosMap(prev => ({ ...prev, [tid]: rows }))
      } finally {
        setLoadingRegs(prev => ({ ...prev, [tid]: false }))
      }
    }
  }

  async function abrirRegistro(t: Transportadora) {
    setOpenReg({ id: t.id, nome: t.razaoSocial })
    setDocId('')
    setEmissao('')
    setValidadeReg('')
    setNumeroReg('')
    setUrlReg('')
    if (docs.length === 0) {
      const d = await getDocumentos()
      setDocs(d)
    }
  }

  async function salvarRegistro() {
    if (!openReg) return
    if (!docId || !validadeReg) {
      alert('Escolha o documento e a validade.')
      return
    }
    setSavingReg(true)
    try {
      await postRegistro({
        transportadoraId: openReg.id,
        documentoId: Number(docId),
        validade: validadeReg,
        emissao: emissao || undefined,
        numero: numeroReg || undefined,
        arquivoUrl: urlReg || undefined,
      })
      // recarrega registros dessa transportadora
      const rows = await getRegistrosByTransportadora(openReg.id)
      setRegistrosMap(prev => ({ ...prev, [openReg.id]: rows }))
      setExpanded(prev => ({ ...prev, [openReg.id]: true }))
      setOpenReg(null)
    } catch (e: any) {
      alert(e?.message || 'Erro ao salvar registro')
    } finally {
      setSavingReg(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Transportadoras</h1>

      {/* Form CRUD */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <Field label="Razão Social">
            <Input value={f.razaoSocial || ''} onChange={e => setF({ ...f, razaoSocial: e.target.value })} />
          </Field>
          <Field label="CNPJ">
            <Input value={f.cnpj || ''} onChange={e => setF({ ...f, cnpj: e.target.value })} />
          </Field>
          <Field label="UF">
            <Input
              value={f.uf || ''}
              onChange={e => setF({ ...f, uf: e.target.value.toUpperCase() })}
              placeholder="SP"
              maxLength={2}
            />
          </Field>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} className="px-4 py-2 bg-teal-600 text-white rounded-lg">
            {editId ? 'Salvar' : 'Criar'}
          </button>
          {editId && (
            <button
              onClick={() => {
                setEditId(null)
                setF({ razaoSocial: '', cnpj: '', uf: '' })
              }}
              className="px-4 py-2 border rounded-lg"
            >
              Cancelar
            </button>
          )}
        </div>
        {msg && <div className="text-sm mt-2">{msg}</div>}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
        <table className="w-full border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left text-sm text-gray-600">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Razão Social</th>
              <th className="px-3 py-2">CNPJ</th>
              <th className="px-3 py-2">UF</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(t => (
              <React.Fragment key={t.id}>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-3 py-2">{t.id}</td>
                  <td className="px-3 py-2">{t.razaoSocial}</td>
                  <td className="px-3 py-2">{t.cnpj}</td>
                  <td className="px-3 py-2">{t.uf ?? '-'}</td>
                  <td className="px-3 py-2 flex flex-wrap gap-2">
                    <button onClick={() => startEdit(t)} className="px-3 py-1 border rounded-lg">
                      Editar
                    </button>
                    <button onClick={() => del(t.id)} className="px-3 py-1 border rounded-lg">
                      Excluir
                    </button>
                    <button
                      onClick={() => abrirRegistro(t)}
                      className="px-3 py-1 rounded-lg bg-teal-600 text-white hover:opacity-90"
                    >
                      Registrar Doc
                    </button>
                    <button onClick={() => toggleRegistros(t.id)} className="px-3 py-1 border rounded-lg">
                      {expanded[t.id] ? 'Ocultar registros' : 'Ver registros'}
                    </button>
                  </td>
                </tr>

                {expanded[t.id] && (
                  <tr>
                    <td colSpan={5} className="px-3 py-2 bg-slate-50">
                      {loadingRegs[t.id] ? (
                        <div className="text-sm">Carregando registros…</div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-600">
                              <th className="px-2 py-1">Documento</th>
                              <th className="px-2 py-1">Emissão</th>
                              <th className="px-2 py-1">Validade</th>
                              <th className="px-2 py-1">Número</th>
                              <th className="px-2 py-1">Criado em</th>
                              <th className="px-2 py-1">Ativo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(registrosMap[t.id] || []).map(r => (
                              <tr key={r.id} className="border-t">
                                <td className="px-2 py-1">{r.documento?.nome || r.documentoId}</td>
                                <td className="px-2 py-1">{fmtDate(r.emissao)}</td>
                                <td className="px-2 py-1">{fmtDate(r.validade)}</td>
                                <td className="px-2 py-1">{r.numero || '-'}</td>
                                <td className="px-2 py-1">{fmtDateTime(r.createdAt)}</td>
                                <td className="px-2 py-1">{r.ativo ? 'Sim' : 'Não'}</td>
                              </tr>
                            ))}
                            {(!registrosMap[t.id] || registrosMap[t.id].length === 0) && (
                              <tr>
                                <td className="px-2 py-2 text-slate-500" colSpan={6}>
                                  Nenhum registro cadastrado.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {loading && <div className="text-sm p-2">Carregando…</div>}
      </div>

      {/* Modal registrar documento */}
      {openReg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">
                Registrar documento — <span className="text-slate-600">{openReg.nome}</span>
              </div>
              <button onClick={() => setOpenReg(null)} className="p-1 rounded hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-slate-600 mb-1">Documento</div>
                <select
                  value={docId}
                  onChange={e => setDocId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Selecione…</option>
                  {docs.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-slate-600 mb-1">Validade</div>
                <input
                  type="date"
                  value={validadeReg}
                  onChange={e => setValidadeReg(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </label>

              <label className="text-sm">
                <div className="text-slate-600 mb-1">Emissão (opcional)</div>
                <input
                  type="date"
                  value={emissao}
                  onChange={e => setEmissao(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </label>

              <label className="text-sm">
                <div className="text-slate-600 mb-1">Número (opcional)</div>
                <input
                  value={numeroReg}
                  onChange={e => setNumeroReg(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nº do documento"
                />
              </label>

              <label className="text-sm md:col-span-2">
                <div className="text-slate-600 mb-1">Arquivo URL (opcional)</div>
                <input
                  value={urlReg}
                  onChange={e => setUrlReg(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://…"
                />
              </label>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button className="px-4 py-2 rounded border" onClick={() => setOpenReg(null)}>
                Cancelar
              </button>
              <button
                disabled={savingReg}
                onClick={salvarRegistro}
                className="px-4 py-2 rounded bg-teal-600 text-white hover:opacity-90 disabled:opacity-50"
              >
                {savingReg ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-600">{label}</span>
      {children}
    </label>
  )
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="border rounded-lg px-3 py-2 w-full" />
}

export default function Transportadoras() {
  return <h1>Transportadoras OK</h1>
}

