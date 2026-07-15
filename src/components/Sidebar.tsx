import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, BookOpen, Users, BarChart3, Building2, LogOut, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/auth'

const baseNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dialogos', label: 'Diálogos', icon: MessageSquare },
  { to: '/temas', label: 'Temas', icon: BookOpen },
  { to: '/participantes', label: 'Participantes', icon: Users },
  { to: '/setores', label: 'Setores', icon: Building2 },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

const leaderNavItems = [
  { to: '/acessos', label: 'Controle de Acessos', icon: ShieldCheck },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut, isLeader } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const navItems = isLeader ? [...baseNavItems, ...leaderNavItems] : baseNavItems

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
          {navItems.map((item, idx) => {
            const Icon = item.icon
            const isLeaderSection = idx >= baseNavItems.length
            return (
              <div key={item.to}>
                {isLeaderSection && idx === baseNavItems.length && (
                  <div className="pt-3 mt-3 border-t border-aguia-800/50">
                    <p className="px-3 pb-1 text-[10px] text-aguia-500 uppercase tracking-wider font-semibold">Administração</p>
                  </div>
                )}
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mt-1 ${
                      isActive
                        ? 'bg-aguia-700 text-white shadow-sm'
                        : 'text-aguia-200 hover:bg-aguia-800/50 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                  {item.label}
                </NavLink>
              </div>
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
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1.5 rounded-lg text-aguia-300 hover:text-white hover:bg-aguia-800/50 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

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
