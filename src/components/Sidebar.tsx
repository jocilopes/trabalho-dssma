import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, BookOpen, Users, BarChart3, Building2, LogOut } from 'lucide-react'
import { useAuth } from '../lib/auth'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dialogos', label: 'Diálogos', icon: MessageSquare },
  { to: '/temas', label: 'Temas', icon: BookOpen },
  { to: '/participantes', label: 'Participantes', icon: Users },
  { to: '/setores', label: 'Setores', icon: Building2 },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-neutral-950/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-aguia-950 text-white flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center px-5 border-b border-aguia-800/50">
          <img src="/logo-white.svg" alt="Águia Sistemas" className="h-7" />
        </div>

        <div className="px-5 py-3 border-b border-aguia-800/50">
          <p className="text-xs text-aguia-400 uppercase tracking-wider font-medium">DSSMA Digital</p>
          <p className="text-xs text-aguia-300 mt-0.5">Sistema de Gestão</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-aguia-700 text-white shadow-sm'
                      : 'text-aguia-200 hover:bg-aguia-800/50 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="px-3 py-3 border-t border-aguia-800/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aguia-400 to-aguia-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">{user?.email || 'Usuário'}</p>
              <p className="text-xs text-aguia-400">Autenticado</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-aguia-300 hover:text-white hover:bg-aguia-800/50 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
