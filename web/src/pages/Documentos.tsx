import { useEffect, useState } from 'react'
import { createDocumento, deleteDocumento, listDocumentos, updateDocumento, type Documento } from '../lib/api'

export default function DocumentosPage(){
  const [rows,setRows]=useState<Documento[]>([])
  const [f,setF]=useState<Partial<Documento>>({nome:'', diasAntecedenciaAviso:7, obrigatorio:true})
  const [editId,setEditId]=useState<number|null>(null)
  const [loading,setLoading]=useState(false); const [msg,setMsg]=useState('')

  async function load(){ setLoading(true); try{ setRows(await listDocumentos()) } finally{ setLoading(false) } }
  useEffect(()=>{ load() },[])

  async function save(){
    setMsg('')
    try{
      if(editId){ await updateDocumento(editId,f); setMsg('Atualizado!') }
      else { await createDocumento(f); setMsg('Criado!') }
      setF({nome:'', diasAntecedenciaAviso:7, obrigatorio:true}); setEditId(null); await load()
    }catch(e:any){ setMsg(e?.message||'Erro ao salvar') }
  }
  async function del(id:number){ if(!confirm('Remover?')) return; await deleteDocumento(id); await load() }
  function startEdit(d:Documento){ setEditId(d.id); setF({nome:d.nome, diasAntecedenciaAviso:d.diasAntecedenciaAviso, obrigatorio:d.obrigatorio}) }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Documentos</h1>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <Field label="Nome"><Input value={f.nome||''} onChange={e=>setF({...f,nome:e.target.value})}/></Field>
          <Field label="Antecedência (dias)"><Input type="number" value={f.diasAntecedenciaAviso||7} onChange={e=>setF({...f,diasAntecedenciaAviso:Number(e.target.value)})}/></Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!f.obrigatorio} onChange={e=>setF({...f,obrigatorio:e.target.checked})}/>
            Obrigatório
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} className="px-4 py-2 bg-teal-600 text-white rounded-lg">{editId?'Salvar':'Criar'}</button>
          {editId && <button onClick={()=>{setEditId(null); setF({nome:'',diasAntecedenciaAviso:7,obrigatorio:true})}} className="px-4 py-2 border rounded-lg">Cancelar</button>}
        </div>
        {msg && <div className="text-sm mt-2">{msg}</div>}
      </div>

      <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
        <table className="w-full border-separate border-spacing-y-1">
          <thead><tr className="text-left text-sm text-gray-600"><th className="px-3 py-2">ID</th><th className="px-3 py-2">Nome</th><th className="px-3 py-2">Dias</th><th className="px-3 py-2">Obrigatório</th><th className="px-3 py-2">Ações</th></tr></thead>
          <tbody>
            {rows.map(d=>(
              <tr key={d.id} className="bg-white hover:bg-gray-50">
                <td className="px-3 py-2">{d.id}</td>
                <td className="px-3 py-2">{d.nome}</td>
                <td className="px-3 py-2">{d.diasAntecedenciaAviso}</td>
                <td className="px-3 py-2">{d.obrigatorio?'Sim':'Não'}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={()=>startEdit(d)} className="px-3 py-1 border rounded-lg">Editar</button>
                  <button onClick={()=>del(d.id)} className="px-3 py-1 border rounded-lg">Excluir</button>
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

export default function Documentos() {
  return <h1>Documentos OK</h1>
}
