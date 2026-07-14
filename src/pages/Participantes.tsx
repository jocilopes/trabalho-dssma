import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, Users, ChevronRight, Check, X, Camera } from 'lucide-react'
import type { Participante } from '../lib/supabase'

export default function Participantes() {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data } = await supabase
      .from('participantes')
      .select(`
        id, nome, matricula, setor, assinatura, foto_url, assinatura_data,
        assinatura_imagem_url, dialogo_id, created_at,
        dialogos ( titulo, data_realizacao )
      `)
      .order('nome')
    setParticipantes(data || [])
    setLoading(false)
  }

  const filtered = participantes.filter((p) =>
    !search ||
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.matricula || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.setor || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-heading font-bold text-neutral-800">
          Participantes
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Pessoas que participaram dos diálogos DDS
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-neutral-200 mb-4">
        <Search className="w-4 h-4 text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por nome, matrícula ou setor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-neutral-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-neutral-500 mt-3">Nenhum participante encontrado.</p>
        </div>
      ) : (
        <div className="card divide-y divide-neutral-100">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/dialogos/${p.dialogo_id}`}
              className="flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors group"
            >
              {/* Photo or avatar */}
              {p.foto_url ? (
                <img
                  src={p.foto_url}
                  alt={p.nome}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aguia-400 to-aguia-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {p.nome.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate group-hover:text-aguia-700 transition-colors">
                  {p.nome}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {p.matricula && `Mat. ${p.matricula}`}
                  {p.matricula && p.setor && ' · '}
                  {p.setor}
                  {(p as any).dialogos && ` · ${(p as any).dialogos[0]?.titulo}`}
                </p>
                {p.assinatura_data && (
                  <p className="text-xs text-success-600 mt-0.5 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Confirmado em {new Date(p.assinatura_data).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              {/* Status badge */}
              {p.assinatura ? (
                <span className="badge-success hidden sm:inline-flex">
                  <Camera className="w-3 h-3 mr-0.5" />
                  Presença confirmada
                </span>
              ) : (
                <span className="badge-warning hidden sm:inline-flex">
                  <X className="w-3 h-3 mr-0.5" />
                  Pendente
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-aguia-500 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
