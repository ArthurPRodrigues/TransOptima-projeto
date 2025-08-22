import { useEffect, useState } from 'react'
import { downloadVencidosCsv, listVencidos, type VencidoRow } from '../lib/api'

export default function VencidosPage(){
  const [rows,setRows]=useState<VencidoRow[]>([])
  const [loading,setLoading]=useState(false)

  async function load(){ setLoading(true); try{ setRows(await listVencidos()) } finally{ setLoading(false)} }
  useEffect(()=>{ load() },[])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Documentos vencidos</h1>
        <button onClick={downloadVencidosCsv} className="px-3 py-2 border rounded-lg bg-white">Baixar CSV</button>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
        <table className="w-full border-separate border-spacing-y-1">
          <thead><tr className="text-left text-sm text-gray-600"><th className="px-3 py-2">Transportadora</th><th className="px-3 py-2">UF</th><th className="px-3 py-2">Documento</th><th className="px-3 py-2">Validade</th></tr></thead>
          <tbody>
            {rows.map((r,idx)=>(
              <tr key={idx} className="bg-white hover:bg-gray-50">
                <td className="px-3 py-2">{r.transportadora?.razaoSocial||`#${r.transportadoraId}`}</td>
                <td className="px-3 py-2">{(r.transportadora as any)?.uf || '-'}</td>
                <td className="px-3 py-2">{r.documento?.nome}</td>
                <td className="px-3 py-2">{new Date(r.validade).toISOString().slice(0,10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="text-sm p-2">Carregando…</div>}
      </div>
    </div>
  )
}
