import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Dialogos from './pages/Dialogos'
import DialogoForm from './pages/DialogoForm'
import DialogoDetail from './pages/DialogoDetail'
import Temas from './pages/Temas'
import Participantes from './pages/Participantes'
import Setores from './pages/Setores'
import Relatorios from './pages/Relatorios'

function ProtectedApp() {
  const { session, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-aguia-100 flex items-center justify-center animate-pulse">
            <ShieldCheckIcon />
          </div>
          <p className="text-sm text-neutral-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dialogos" element={<Dialogos />} />
            <Route path="/dialogos/novo" element={<DialogoForm />} />
            <Route path="/dialogos/:id" element={<DialogoDetail />} />
            <Route path="/dialogos/:id/editar" element={<DialogoForm />} />
            <Route path="/temas" element={<Temas />} />
            <Route path="/participantes" element={<Participantes />} />
            <Route path="/setores" element={<Setores />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function ShieldCheckIcon() {
  return (
    <svg className="w-6 h-6 text-aguia-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  )
}
