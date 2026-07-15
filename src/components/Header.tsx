import { Menu, LogOut, AlertTriangle } from 'lucide-react'
import { useAuth } from '../lib/auth'
import GlobalSearch from './GlobalSearch'
import Notifications from './Notifications'
import { useState } from 'react'

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  return (
    <>
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-neutral-600" />
          </button>
          <div className="hidden sm:block">
            <h1 className="font-heading font-bold text-neutral-800 text-lg leading-none">
              DSSMA Digital
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Sistema de Gestão de Diálogos de Segurança, Saúde e Meio Ambiente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <GlobalSearch />
          <Notifications />
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aguia-500 to-aguia-700 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm text-neutral-600 max-w-[140px] truncate">{user?.email || ''}</span>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-lg text-neutral-500 hover:text-danger-600 hover:bg-danger-50 transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-danger-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
            <h2 className="font-heading font-bold text-neutral-800 text-lg mb-1">
              Sair do sistema?
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Você precisará fazer login novamente para acessar o DSSMA Digital.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={async () => { await signOut(); setShowLogoutConfirm(false) }}
                className="btn-danger flex-1"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
