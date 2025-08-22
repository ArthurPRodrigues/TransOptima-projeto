import { useState } from 'react'
import { useAuth } from '../auth'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const { login } = useAuth()
  const nav = useNavigate()
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('')
  const [error,setError]=useState(''); const [loading,setLoading]=useState(false)

  async function submit(e:React.FormEvent){ e.preventDefault(); setError(''); setLoading(true)
    try{ await login(email,password); nav('/app/transportadoras') }
    catch(err:any){ setError(err?.message || 'Falha ao autenticar') }
    finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-100 p-6">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <div className="space-y-2">
          <label className="text-sm">E-mail</label>
          <input className="w-full border rounded-lg px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com"/>
        </div>
        <div className="space-y-2">
          <label className="text-sm">Senha</label>
          <input type="password" className="w-full border rounded-lg px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} placeholder="admin"/>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button disabled={loading} className="w-full bg-teal-600 text-white rounded-lg py-2">
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="text-xs text-slate-500">Dica: senha <b>admin</b> (temporário)</p>
      </form>
    </div>
  )
}
