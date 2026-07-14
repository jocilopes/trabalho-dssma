import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Dialogo } from '../lib/supabase'
import { categoriaLabels, categoriaColors, statusLabels, statusColors, formatDate } from '../lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  MessageSquare, Users, TrendingUp, Calendar, ShieldCheck, Heart, Leaf,
  Plus, ArrowRight, Clock,
} from 'lucide-react'

type Stats = {
  total: number
  realizados: number
  agendados: number
  totalParticipantes: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, realizados: 0, agendados: 0, totalParticipantes: 0 })
  const [recentes, setRecentes] = useState<Dialogo[]>([])
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([])
  const [categoriaData, setCategoriaData] = useState<{ name: string; value: number; color: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data: dialogos } = await supabase
      .from('dialogos')
      .select('*')
      .order('data_realizacao', { ascending: false })

    const { data: participantes } = await supabase
      .from('participantes')
      .select('id')

    if (dialogos) {
      const realizados = dialogos.filter((d) => d.status === 'realizado')
      setStats({
        total: dialogos.length,
        realizados: realizados.length,
        agendados: dialogos.filter((d) => d.status === 'agendado').length,
        totalParticipantes: participantes?.length || 0,
      })
      setRecentes(dialogos.slice(0, 5))

      // Chart: last 6 months
      const months: Record<string, number> = {}
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const key = d.toLocaleDateString('pt-BR', { month: 'short' })
        months[key] = 0
      }
      dialogos.forEach((d) => {
        const date = new Date(d.data_realizacao + 'T00:00:00')
        const key = date.toLocaleDateString('pt-BR', { month: 'short' })
        if (key in months) months[key]++
      })
      setChartData(Object.entries(months).map(([name, value]) => ({ name, value })))

      // Pie chart: by categoria
      const catCount: Record<string, number> = { seguranca: 0, saude: 0, meio_ambiente: 0 }
      dialogos.forEach((d) => { catCount[d.categoria] = (catCount[d.categoria] || 0) + 1 })
      setCategoriaData([
        { name: 'Segurança', value: catCount.seguranca, color: '#ef4444' },
        { name: 'Saúde', value: catCount.saude, color: '#10b981' },
        { name: 'Meio Ambiente', value: catCount.meio_ambiente, color: '#3374ff' },
      ])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-neutral-400">Carregando...</div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total de Diálogos', value: stats.total, icon: MessageSquare, color: 'aguia' },
    { label: 'Realizados', value: stats.realizados, icon: ShieldCheck, color: 'success' },
    { label: 'Agendados', value: stats.agendados, icon: Calendar, color: 'warning' },
    { label: 'Participantes', value: stats.totalParticipantes, icon: Users, color: 'accent' },
  ]

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-aguia-800 via-aguia-700 to-aguia-600 p-6 lg:p-8 mb-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-accent-400 rounded-full blur-3xl translate-y-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-accent-400" />
            <span className="text-accent-400 text-sm font-medium uppercase tracking-wider">
              Segurança · Saúde · Meio Ambiente
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-2">
            DSSMA Digital
          </h1>
          <p className="text-aguia-100 text-sm lg:text-base max-w-2xl">
            Sistema de gestão de diálogos de segurança, saúde e meio ambiente.
            Acompanhe, registre e analise os DDS da sua organização em um só lugar.
          </p>
          <Link
            to="/dialogos/novo"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-lg bg-white text-aguia-700 font-semibold text-sm hover:bg-aguia-50 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Diálogo
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="card p-5 animate-slide-up">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${card.color}-100`}>
                  <Icon className={`w-5 h-5 text-${card.color}-600`} />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-heading font-bold text-neutral-800">
                {card.value}
              </p>
              <p className="text-xs lg:text-sm text-neutral-500 mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-neutral-800">Diálogos por mês</h2>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="value" fill="#1e54f5" radius={[6, 6, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-neutral-800 mb-4">Por categoria</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoriaData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {categoriaData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent dialogues */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-neutral-800">Diálogos recentes</h2>
          <Link
            to="/dialogos"
            className="inline-flex items-center gap-1 text-sm text-aguia-600 hover:text-aguia-700 font-medium"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-2">
          {recentes.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-8">
              Nenhum diálogo registrado ainda.
            </p>
          )}
          {recentes.map((d) => {
            const catIcon = d.categoria === 'seguranca' ? ShieldCheck : d.categoria === 'saude' ? Heart : Leaf
            const CatIcon = catIcon
            return (
              <Link
                key={d.id}
                to={`/dialogos/${d.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${categoriaColors[d.categoria]}`}>
                  <CatIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate group-hover:text-aguia-700 transition-colors">
                    {d.titulo}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
                    <span>{formatDate(d.data_realizacao)}</span>
                    <span>·</span>
                    <span>{d.setor}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {d.duracao_minutos}min
                    </span>
                  </p>
                </div>
                <span className={`badge-${d.status === 'realizado' ? 'success' : d.status === 'agendado' ? 'warning' : 'danger'}`}>
                  {statusLabels[d.status]}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
