// web/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth'      // <-- minúsculo
import Layout from './layout/Layout'
import Login from './pages/Login'
import Transportadoras from './pages/Transportadoras'
import Documentos from './pages/Documentos'
import Vencidos from './pages/Vencidos'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Transportadoras />} />
            <Route path="transportadoras" element={<Transportadoras />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="vencidos" element={<Vencidos />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
