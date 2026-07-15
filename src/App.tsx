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
import Acessos from './pages/Acessos'

function PendingAccess() {
  const { accessStatus, signOut } = useAuth()
  const isRejected = accessStatus === 'rejected'
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md text-center">
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${isRejected ? 'bg-danger-100' : 'bg-warning-100'}`}>
          {isRejected ? (
            <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-warning-600 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <h2 className="text-2xl font-heading font-bold text-neutral-800 mb-3">
          {isRejected ? 'Acesso reprovado' : 'Acesso pendente'}
        </h2>
        <p className="text-sm text-neutral-500 mb-2 leading-relaxed">
          {isRejected
            ? 'Sua solicitação de acesso foi reprovada pelo líder do sistema. Entre em contato para mais informações.'
            : 'Sua solicitação de acesso foi enviada e está aguardando aprovação do líder do sistema.'}
        </p>
        <p className="text-sm text-neutral-400 mb-8">
          Você receberá acesso assim que for autorizado.
        </p>
        <button onClick={() => signOut()} className="btn-secondary w-full">
          Sair
        </button>
      </div>
    </div>
  )
}

function ProtectedApp() {
  const { session, loading, accessStatus } = useAuth()
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

  if (accessStatus === 'pending' || accessStatus === 'rejected') {
    return <PendingAccess />
  }

  if (accessStatus !== 'approved') {
    return null
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
            <Route path="/acessos" element={<Acessos />} />
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
