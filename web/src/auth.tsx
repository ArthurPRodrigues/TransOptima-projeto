import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { isAuthed, login as apiLogin, logout as apiLogout } from './lib/api'

type AuthCtx = { authed:boolean; login:(e:string,p:string)=>Promise<void>; logout:()=>void }
const Ctx = createContext<AuthCtx>({ authed:false, login:async()=>{}, logout:()=>{} })

export function AuthProvider({children}:{children:ReactNode}){
  const [authed,setAuthed]=useState(false)
  useEffect(()=>{ setAuthed(isAuthed()) },[])
  async function login(email:string,password:string){ await apiLogin(email,password); setAuthed(true) }
  function logout(){ apiLogout(); setAuthed(false) }
  return <Ctx.Provider value={{authed,login,logout}}>{children}</Ctx.Provider>
}

export function useAuth(){ return useContext(Ctx) }
