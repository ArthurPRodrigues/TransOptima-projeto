import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './auth'
import App, { RequireAuth } from './App'
import Login from './pages/Login'
import Layout from './layout/Layout'
import TransportadorasPage from './pages/Transportadoras'
import DocumentosPage from './pages/Documentos'
import VencidosPage from './pages/Vencidos'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<App/>}>
            <Route path="/login" element={<Login/>} />
            <Route path="/app" element={<RequireAuth><Layout/></RequireAuth>}>
              <Route index element={<Navigate to="transportadoras" replace/>}/>
              <Route path="transportadoras" element={<TransportadorasPage/>}/>
              <Route path="documentos" element={<DocumentosPage/>}/>
              <Route path="vencidos" element={<VencidosPage/>}/>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
