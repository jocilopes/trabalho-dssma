import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { ShieldCheck, Clock, CheckCircle2, XCircle, Mail, Calendar, User, Loader2 } from 'lucide-react'

type AccessRequest = {
  id: string
  user_id: string
  email: string
  status: string
  requested_at: string
  reviewed_by: string | null
  reviewed_at: string | null
}

export default function Acessos() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function loadRequests() {
    setLoading(true)
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .order('requested_at', { ascending: false })
    if (!error && data) setRequests(data)
    setLoading(false)
  }

  useEffect(() => { loadRequests() }, [])

  async function updateStatus(id: string, status: 'aprovado' | 'reprovado') {
    setActionLoading(id)
    const { error } = await supabase
      .from('access_requests')
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (!error) {
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status, reviewed_by: user?.id ?? null, reviewed_at: new Date().toISOString() } : r))
    }
    setActionLoading(null)
  }

  const pendentes = requests.filter((r) => r.status === 'pendente')
  const aprovados = requests.filter((r) => r.status === 'aprovado')
  const reprovados = requests.filter((r) => r.status === 'reprovado')

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-aguia-100 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-aguia-600" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold text-neutral-800">Controle de Acessos</h1>
          <p className="text-sm text-neutral-500">Aprove ou reprove solicitações de acesso ao sistema</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Pendentes" value={pendentes.length} icon={<Clock className="w-4 h-4" />} color="warning" />
        <StatCard label="Aprovados" value={aprovados.length} icon={<CheckCircle2 className="w-4 h-4" />} color="success" />
        <StatCard label="Reprovados" value={reprovados.length} icon={<XCircle className="w-4 h-4" />} color="danger" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-aguia-500 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma solicitação de acesso registrada.</p>
        </div>
      ) : (
        <>
          {pendentes.length > 0 && (
            <Section title="Aguardando aprovação" icon={<Clock className="w-4 h-4 text-warning-500" />}>
              {pendentes.map((r) => (
                <RequestCard key={r.id} request={r} onApprove={() => updateStatus(r.id, 'aprovado')} onReject={() => updateStatus(r.id, 'reprovado')} actionLoading={actionLoading === r.id} />
              ))}
            </Section>
          )}

          {aprovados.length > 0 && (
            <Section title="Aprovados" icon={<CheckCircle2 className="w-4 h-4 text-success-500" />}>
              {aprovados.map((r) => (
                <RequestCard key={r.id} request={r} actionLoading={false} />
              ))}
            </Section>
          )}

          {reprovados.length > 0 && (
            <Section title="Reprovados" icon={<XCircle className="w-4 h-4 text-danger-500" />}>
              {reprovados.map((r) => (
                <RequestCard key={r.id} request={r} actionLoading={false} />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    success: 'bg-success-50 text-success-700 border-success-200',
    danger: 'bg-danger-50 text-danger-700 border-danger-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-heading font-bold">{value}</p>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">
        {icon}
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function RequestCard({ request, onApprove, onReject, actionLoading }: {
  request: AccessRequest
  onApprove?: () => void
  onReject?: () => void
  actionLoading: boolean
}) {
  const statusConfig: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
    pendente: { label: 'Pendente', class: 'bg-warning-100 text-warning-700', icon: <Clock className="w-3.5 h-3.5" /> },
    aprovado: { label: 'Aprovado', class: 'bg-success-100 text-success-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    reprovado: { label: 'Reprovado', class: 'bg-danger-100 text-danger-700', icon: <XCircle className="w-3.5 h-3.5" /> },
  }
  const cfg = statusConfig[request.status]

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aguia-400 to-aguia-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {request.email.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-neutral-800 truncate">{request.email}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}>
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(request.requested_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            {request.reviewed_at && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Revisado em {new Date(request.reviewed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {request.status === 'pendente' && onApprove && onReject && (
        <div className="flex items-center gap-2">
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="btn-success text-sm py-2 px-3"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Aprovar
          </button>
          <button
            onClick={onReject}
            disabled={actionLoading}
            className="btn-danger text-sm py-2 px-3"
          >
            <XCircle className="w-4 h-4" />
            Reprovar
          </button>
        </div>
      )}
    </div>
  )
}
