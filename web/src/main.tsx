import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './layout/Layout'
import Login from './pages/Login'
import Transportadoras from './pages/Transportadoras'
import Documentos from './pages/Documentos'
import Vencidos from './pages/Vencidos'
import './index.css'

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Transportadoras /> },
      { path: 'transportadoras', element: <Transportadoras /> },
      { path: 'documentos', element: <Documentos /> },
      { path: 'vencidos', element: <Vencidos /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
