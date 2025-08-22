import { useEffect, useState } from 'react'
import { createTransportadora, deleteTransportadora, listTransportadoras, updateTransportadora, type Transportadora } from '../lib/api'

export default function TransportadorasPage(){
  const [rows,setRows]=useState<Transportadora[]>([])
  const [f,setF]=useState<Partial<Transportadora>>({razaoSocial:'', cnpj:'', uf:''})
  const [editId,setEditId]=useState<number|null>(null)
  const [loading,setLoading]=useState(false); const [msg,setMsg]=useState('')

  async function load(){ setLoading(true); try{ setRows(await listTransportadoras()) } finally{ setLoading(false) } }
  useEffect(()=>{ load() },[])

  async function save(){
    setMsg('')
    try{
      if(editId){ await updateTransportadora(editId,f); setMsg('Atualizado!') }
      else { await createTransportadora(f); setMsg('Criado!') }
      setF({razaoSocial:'', cnpj:'', uf:''}); setEditId(null); await load()
    }catch(e:any){ setMsg(e?.message||'Erro ao salvar') }
  }
  async function del(id:number){ if(!confirm('Remover?')) return; await deleteTransportadora(id); await load() }
  function startEdit(t:Transportadora){ setEditId(t.id); setF({razaoSocial:t.razaoSocial, cnpj:t.cnpj, uf:t.uf}) }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Transportadoras</h1>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <Field label="Razão Social"><Input value={f.razaoSocial||''} onChange={e=>setF({...f,razaoSocial:e.target.value})}/></Field>
          <Field label="CNPJ"><Input value={f.cnpj||''} onChange={e=>setF({...f,cnpj:e.target.value})}/></Field>
          <Field label="UF"><Input value={f.uf||''} onChange={e=>setF({...f,uf:e.target.value.toUpperCase()})}/></Field>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} className="px-4 py-2 bg-teal-600 text-white rounded-lg">{editId?'Salvar':'Criar'}</button>
          {editId && <button onClick={()=>{setEditId(null); setF({razaoSocial:'',cnpj:'',uf:''})}} className="px-4 py-2 border rounded-lg">Cancelar</button>}
        </div>
        {msg && <div className="text-sm mt-2">{msg}</div>}
      </div>

      <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
        <table className="w-full border-separate border-spacing-y-1">
          <thead><tr className="text-left text-sm text-gray-600"><th className="px-3 py-2">ID</th><th className="px-3 py-2">Razão Social</th><th className="px-3 py-2">CNPJ</th><th className="px-3 py-2">UF</th><th className="px-3 py-2">Ações</th></tr></thead>
          <tbody>
            {rows.map(t=>(
              <tr key={t.id} className="bg-white hover:bg-gray-50">
                <td className="px-3 py-2">{t.id}</td>
                <td className="px-3 py-2">{t.razaoSocial}</td>
                <td className="px-3 py-2">{t.cnpj}</td>
                <td className="px-3 py-2">{t.uf||'-'}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={()=>startEdit(t)} className="px-3 py-1 border rounded-lg">Editar</button>
                  <button onClick={()=>del(t.id)} className="px-3 py-1 border rounded-lg">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="text-sm p-2">Carregando…</div>}
      </div>
    </div>
  )
}

function Field({label, children}:{label:string; children:React.ReactNode}){ return <label className="flex flex-col gap-1 text-sm">{label}{children}</label> }
function Input(props:React.InputHTMLAttributes<HTMLInputElement>){ return <input {...props} className="border rounded-lg px-3 py-2"/> }
