import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import { Download, TrendingUp, Users, Clock, ShieldCheck, Heart, Leaf } from 'lucide-react'

export default function Relatorios() {
  const [loading, setLoading] = useState(true)
  const [bySetor, setBySetor] = useState<{ name: string; dialogos: number; participantes: number }[]>([])
  const [byCategoria, setByCategoria] = useState<{ name: string; value: number }[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<{ name: string; seguranca: number; saude: number; meio_ambiente: number }[]>([])
  const [summary, setSummary] = useState({
    total: 0,
    realizados: 0,
    participantes: 0,
    duracaoTotal: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data: dialogos } = await supabase.from('dialogos').select('*')
    const { data: participantes } = await supabase.from('participantes').select('id, setor')

    if (dialogos) {
      // Summary
      setSummary({
        total: dialogos.length,
        realizados: dialogos.filter((d) => d.status === 'realizado').length,
        participantes: participantes?.length || 0,
        duracaoTotal: dialogos.reduce((sum, d) => sum + d.duracao_minutos, 0),
      })

      // By setor
      const setorMap: Record<string, { dialogos: number; participantes: number }> = {}
      dialogos.forEach((d) => {
        if (!setorMap[d.setor]) setorMap[d.setor] = { dialogos: 0, participantes: 0 }
        setorMap[d.setor].dialogos++
        setorMap[d.setor].participantes += d.num_participantes
      })
      setBySetor(Object.entries(setorMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.dialogos - a.dialogos))

      // By categoria
      setByCategoria([
        { name: 'Segurança', value: dialogos.filter((d) => d.categoria === 'seguranca').length },
        { name: 'Saúde', value: dialogos.filter((d) => d.categoria === 'saude').length },
        { name: 'Meio Ambiente', value: dialogos.filter((d) => d.categoria === 'meio_ambiente').length },
      ])

      // Monthly trend by category
      const months: Record<string, { seguranca: number; saude: number; meio_ambiente: number }> = {}
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const key = d.toLocaleDateString('pt-BR', { month: 'short' })
        months[key] = { seguranca: 0, saude: 0, meio_ambiente: 0 }
      }
      dialogos.forEach((d) => {
        const date = new Date(d.data_realizacao + 'T00:00:00')
        const key = date.toLocaleDateString('pt-BR', { month: 'short' })
        if (key in months) {
          months[key][d.categoria as 'seguranca']++
        }
      })
      setMonthlyTrend(Object.entries(months).map(([name, v]) => ({ name, ...v })))
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="p-6 text-center text-neutral-400">Carregando relatórios...</div>
  }

  const cards = [
    { label: 'Total de Diálogos', value: summary.total, icon: TrendingUp, color: 'aguia' },
    { label: 'Realizados', value: summary.realizados, icon: ShieldCheck, color: 'success' },
    { label: 'Participantes', value: summary.participantes, icon: Users, color: 'accent' },
    { label: 'Minutos Totais', value: summary.duracaoTotal, icon: Clock, color: 'warning' },
  ]

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-heading font-bold text-neutral-800">
            Relatórios
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Análise e indicadores dos diálogos DDS
          </p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="card p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${card.color}-100 mb-3`}>
                <Icon className={`w-5 h-5 text-${card.color}-600`} />
              </div>
              <p className="text-2xl lg:text-3xl font-heading font-bold text-neutral-800">{card.value}</p>
              <p className="text-xs lg:text-sm text-neutral-500 mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* By setor */}
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-neutral-800 mb-4">Diálogos por setor</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bySetor} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Bar dataKey="dialogos" fill="#1e54f5" radius={[0, 6, 6, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend */}
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-neutral-800 mb-4">Tendência por categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="seguranca" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Segurança" />
              <Line type="monotone" dataKey="saude" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Saúde" />
              <Line type="monotone" dataKey="meio_ambiente" stroke="#3374ff" strokeWidth={2} dot={{ r: 4 }} name="Meio Ambiente" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="card p-5">
        <h2 className="font-heading font-semibold text-neutral-800 mb-4">Distribuição por categoria</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {byCategoria.map((cat, i) => {
            const Icon = i === 0 ? ShieldCheck : i === 1 ? Heart : Leaf
            const color = i === 0 ? 'danger' : i === 1 ? 'success' : 'aguia'
            const pct = summary.total > 0 ? Math.round((cat.value / summary.total) * 100) : 0
            return (
              <div key={cat.name} className={`p-4 rounded-xl bg-${color}-50 border border-${color}-100`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-9 h-9 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">{cat.name}</span>
                </div>
                <p className="text-3xl font-heading font-bold text-neutral-800">{cat.value}</p>
                <p className="text-xs text-neutral-500 mt-1">{pct}% do total</p>
                <div className="mt-3 h-2 rounded-full bg-neutral-200 overflow-hidden">
                  <div className={`h-full bg-${color}-500 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
