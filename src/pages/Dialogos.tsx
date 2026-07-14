import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Dialogo } from '../lib/supabase'
import { categoriaLabels, categoriaColors, statusLabels, statusColors, formatDate } from '../lib/utils'
import { Plus, Search, ShieldCheck, Heart, Leaf, Calendar, Clock, Users, ChevronRight } from 'lucide-react'

export default function Dialogos() {
  const [dialogos, setDialogos] = useState<Dialogo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategoria, setFilterCategoria] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadDialogos()
  }, [])

  async function loadDialogos() {
    setLoading(true)
    const { data } = await supabase
      .from('dialogos')
      .select('*')
      .order('data_realizacao', { ascending: false })
    setDialogos(data || [])
    setLoading(false)
  }

  const filtered = dialogos.filter((d) => {
    const matchSearch = !search ||
      d.titulo.toLowerCase().includes(search.toLowerCase()) ||
      d.tema.toLowerCase().includes(search.toLowerCase()) ||
      d.setor.toLowerCase().includes(search.toLowerCase()) ||
      d.responsavel.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCategoria === 'all' || d.categoria === filterCategoria
    const matchStatus = filterStatus === 'all' || d.status === filterStatus
    return matchSearch && matchCat && matchStatus
  })

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-heading font-bold text-neutral-800">
            Diálogos
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gestão de DDS — Diálogos de Segurança, Saúde e Meio Ambiente
          </p>
        </div>
        <Link to="/dialogos/novo" className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Diálogo
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex-1">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por título, tema, setor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-neutral-400"
            />
          </div>
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="input sm:w-44"
          >
            <option value="all">Todas categorias</option>
            <option value="seguranca">Segurança</option>
            <option value="saude">Saúde</option>
            <option value="meio_ambiente">Meio Ambiente</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input sm:w-36"
          >
            <option value="all">Todos status</option>
            <option value="realizado">Realizado</option>
            <option value="agendado">Agendado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-neutral-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquareIcon />
          <p className="text-neutral-500 mt-3">Nenhum diálogo encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d) => {
            const CatIcon = d.categoria === 'seguranca' ? ShieldCheck : d.categoria === 'saude' ? Heart : Leaf
            return (
              <Link
                key={d.id}
                to={`/dialogos/${d.id}`}
                className="card-hover p-4 flex items-center gap-4 group"
              >
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${categoriaColors[d.categoria]}`}>
                  <CatIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-neutral-800 text-sm truncate group-hover:text-aguia-700 transition-colors">
                      {d.titulo}
                    </h3>
                    <span className={`badge-${d.status === 'realizado' ? 'success' : d.status === 'agendado' ? 'warning' : 'danger'}`}>
                      {statusLabels[d.status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(d.data_realizacao)}
                    </span>
                    <span>· {d.setor}</span>
                    <span>· {d.responsavel}</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {d.duracao_minutos}min
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Users className="w-3 h-3" /> {d.num_participantes}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-aguia-500 transition-colors shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MessageSquareIcon() {
  return (
    <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center">
      <Search className="w-6 h-6 text-neutral-400" />
    </div>
  )
}
