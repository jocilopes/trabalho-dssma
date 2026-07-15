import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Bell, Calendar, Users, CheckCircle2, X, Inbox, ShieldCheck } from 'lucide-react'

type NotifItem = {
  id: string
  type: 'agendado' | 'pendente' | 'acesso'
  title: string
  subtitle: string
  route: string
  date: string
}

export default function Notifications() {
  const { isLeader } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotifItem[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    loadNotifications()
  }, [open])

  async function loadNotifications() {
    setLoading(true)
    const today = new Date().toISOString().slice(0, 10)

    const [dlgRes, partRes, accessRes] = await Promise.all([
      supabase
        .from('dialogos')
        .select('id, titulo, data_realizacao, setor, status')
        .eq('status', 'agendado')
        .gte('data_realizacao', today)
        .order('data_realizacao', { ascending: true })
        .limit(10),
      supabase
        .from('participantes')
        .select('id, nome, dialogo_id, dialogos ( titulo )')
        .eq('assinatura', false)
        .limit(10),
      isLeader
        ? supabase
            .from('access_requests')
            .select('id, email, requested_at')
            .eq('status', 'pendente')
            .order('requested_at', { ascending: false })
            .limit(10)
        : Promise.resolve({ data: null, error: null }),
    ])

    const notifs: NotifItem[] = []

    dlgRes.data?.forEach((d) => {
      notifs.push({
        id: `dlg-${d.id}`,
        type: 'agendado',
        title: d.titulo,
        subtitle: `Agendado · ${d.setor}`,
        route: `/dialogos/${d.id}`,
        date: d.data_realizacao,
      })
    })

    partRes.data?.forEach((p) => {
      const dlgTitulo = (p as any).dialogos?.[0]?.titulo || 'Diálogo'
      notifs.push({
        id: `part-${p.id}`,
        type: 'pendente',
        title: p.nome,
        subtitle: `Presença pendente · ${dlgTitulo}`,
        route: `/dialogos/${p.dialogo_id}`,
        date: today,
      })
    })

    accessRes.data?.forEach((a) => {
      notifs.push({
        id: `access-${a.id}`,
        type: 'acesso',
        title: a.email,
        subtitle: 'Solicitação de acesso pendente',
        route: '/acessos',
        date: a.requested_at.slice(0, 10),
      })
    })

    notifs.sort((a, b) => a.date.localeCompare(b.date))
    setItems(notifs)
    setLoading(false)
  }

  function handleClick(item: NotifItem) {
    navigate(item.route)
    setOpen(false)
  }

  const count = items.length

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        title="Notificações"
      >
        <Bell className="w-5 h-5 text-neutral-600" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* invisible overlay to catch clicks on mobile */}
          <div className="fixed inset-0 z-30 md:hidden" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 right-0 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-neutral-200 max-h-96 overflow-hidden flex flex-col animate-slide-down z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <h3 className="font-heading font-semibold text-neutral-800 text-sm">
                Notificações
                {count > 0 && (
                  <span className="ml-2 badge-warning">{count}</span>
                )}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded text-neutral-400 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-6 text-center text-sm text-neutral-400">Carregando...</div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center mb-2">
                    <Inbox className="w-5 h-5 text-neutral-400" />
                  </div>
                  <p className="text-sm text-neutral-500">Tudo em dia!</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Nenhum diálogo agendado ou presença pendente.
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleClick(item)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-0"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          item.type === 'agendado' ? 'bg-warning-100' : item.type === 'acesso' ? 'bg-danger-100' : 'bg-aguia-100'
                        }`}
                      >
                        {item.type === 'agendado' ? (
                          <Calendar className="w-4 h-4 text-warning-600" />
                        ) : item.type === 'acesso' ? (
                          <ShieldCheck className="w-4 h-4 text-danger-600" />
                        ) : (
                          <Users className="w-4 h-4 text-aguia-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">{item.subtitle}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-4 py-2.5 border-t border-neutral-100">
                <button
                  onClick={() => { navigate('/dialogos'); setOpen(false) }}
                  className="w-full text-center text-xs font-medium text-aguia-600 hover:text-aguia-700"
                >
                  Ver todos os diálogos
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
