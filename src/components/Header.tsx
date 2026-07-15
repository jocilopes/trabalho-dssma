import { Menu, Bell, Search, LogOut } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAuth()

  return (
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
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 w-64">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-neutral-400"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
          <Bell className="w-5 h-5 text-neutral-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full" />
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aguia-500 to-aguia-700 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-neutral-600 max-w-[140px] truncate">{user?.email || ''}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="p-2 rounded-lg text-neutral-500 hover:text-danger-600 hover:bg-danger-50 transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
