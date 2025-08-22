import { useEffect, useState } from 'react'
import { getTransportadoras, postRegistro, notifyNow, downloadVencidosCsv, type ListResp } from './lib/api'
import { Card, CardHeader, Grid2, Field, Input, Button } from './components/FormUI'
import './index.css'

export default function App() {
  // filtros/lista
  const [uf, setUf] = useState('')
  const [produto, setProduto] = useState('quimico')
  const [data, setData] = useState<ListResp>({ disponiveis: [], indisponiveis: [] })
  const [loading, setLoading] = useState(false)

  // formulário (registro)
  const [transportadoraId, setT] = useState('')
  const [documentoId, setD] = useState('')
  const [validade, setV] = useState('')
  const [numero, setN] = useState('')
  const [arquivoUrl, setU] = useState('')
  const [msg, setMsg] = useState('')

  async function buscar(params?: { uf?: string; produto?: string }) {
    setLoading(true)
    try {
      const r = await getTransportadoras(params ?? { uf, produto })
      setData(r)
    } finally {
      setLoading(false)
    }
  }

  async function salvar() {
    setMsg('')
    if (!transportadoraId || !documentoId || !validade) {
      setMsg('Preencha Transportadora ID, Documento ID e Validade.')
      return
    }
    try {
      const r = await postRegistro({
        transportadoraId: Number(transportadoraId),
        documentoId: Number(documentoId),
        validade,
        numero: numero || undefined,
        arquivoUrl: arquivoUrl || undefined,
      })
      setMsg('Registro salvo. Disponível para frete: ' + (r?.disponivel ? 'Sim' : 'Não'))
      setN(''); setU('');
      await buscar()
    } catch (e: unknown) {
      if (e instanceof Error) setMsg('Erro: ' + (e.message || 'falha ao salvar'))
      else setMsg('Erro: falha ao salvar')
    }
  }

  useEffect(() => { buscar({ produto }) }, [])

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Cabeçalho */}
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-bold">TransOptima</h1>
        <p className="text-gray-600">Consulta de disponibilidade e cadastro de documentos</p>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader title="Consulta" />
          <div className="p-6">
            <Grid2>
              <Field label="UF">
                <Input placeholder="SC" value={uf} onChange={e=>setUf(e.target.value.toUpperCase())} />
              </Field>
              <Field label="Produto">
                <Input placeholder="quimico" value={produto} onChange={e=>setProduto(e.target.value)} />
              </Field>
            </Grid2>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => buscar({ uf, produto })}
                className="bg-teal-600 text-white"
              >
                Buscar
              </Button>

              <Button
                onClick={async () => {
                  const r = await notifyNow()
                  alert(`Disparo ok. Documentos: ${r.count}`)
                }}
                className="border border-gray-300 bg-white"
              >
                Disparar e-mail agora
              </Button>

              <Button
                onClick={downloadVencidosCsv}
                className="border border-gray-300 bg-white"
              >
                Baixar CSV (vencidos)
              </Button>
            </div>
          </div>
        </Card>

        {/* Listas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Disponíveis" />
            <div className="p-6 overflow-auto">
              <Table rows={data.disponiveis}/>
            </div>
          </Card>
          <Card>
            <CardHeader title="Indisponíveis" />
            <div className="p-6 overflow-auto">
              <Table rows={data.indisponiveis}/>
            </div>
          </Card>
        </div>

        {/* Formulário 2 colunas */}
        <Card>
          <CardHeader title="Cadastrar Registro de Documento" />
          <div className="p-6">
            <Grid2>
              <Field label="Transportadora ID">
                <Input placeholder="1" inputMode="numeric" value={transportadoraId} onChange={e=>setT(e.target.value)} />
              </Field>
              <Field label="Documento ID">
                <Input placeholder="1" inputMode="numeric" value={documentoId} onChange={e=>setD(e.target.value)} />
              </Field>
              <Field label="Validade">
                <Input type="date" value={validade} onChange={e=>setV(e.target.value)} />
              </Field>
              <Field label="Número (opcional)">
                <Input placeholder="Nº do documento" value={numero} onChange={e=>setN(e.target.value)} />
              </Field>
              <Field label="Arquivo URL (opcional)">
                <Input placeholder="https://..." value={arquivoUrl} onChange={e=>setU(e.target.value)} />
              </Field>
            </Grid2>

            <div className="mt-4">
              <Button onClick={salvar} className="bg-teal-600 text-white">Enviar</Button>
            </div>

            {msg && <p className="mt-3 text-sm text-gray-700">{msg}</p>}
          </div>
        </Card>
      </main>

      {loading && <div className="fixed bottom-4 right-4 bg-black/90 text-white px-3 py-2 rounded-lg">Carregando…</div>}
    </div>
  )
}

function Table({ rows }: { rows: { id: number; razaoSocial?: string; uf?: string }[] }) {
  return (
    <table className="w-full border-separate border-spacing-y-1">
      <thead>
        <tr className="text-left text-sm text-gray-600">
          <th className="px-3 py-2">ID</th>
          <th className="px-3 py-2">Razão Social</th>
          <th className="px-3 py-2">UF</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.id} className="bg-white hover:bg-gray-50">
            <td className="px-3 py-2">{t.id}</td>
            <td className="px-3 py-2">{t.razaoSocial || '-'}</td>
            <td className="px-3 py-2">{t.uf || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
