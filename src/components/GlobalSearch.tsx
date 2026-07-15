import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, MessageSquare, Users, BookOpen, Building2, ChevronRight } from 'lucide-react'

type SearchResult = {
  type: 'dialogo' | 'participante' | 'tema' | 'setor'
  id: string
  title: string
  subtitle: string
  route: string
  icon: typeof MessageSquare
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

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
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)

    async function search() {
      const q = query.trim().toLowerCase()
      const [dlgRes, partRes, temaRes, setorRes] = await Promise.all([
        supabase.from('dialogos').select('id, titulo, setor, status').ilike('titulo', `%${q}%`).limit(5),
        supabase.from('participantes').select('id, nome, setor, dialogo_id').ilike('nome', `%${q}%`).limit(5),
        supabase.from('temas').select('id, titulo, categoria').ilike('titulo', `%${q}%`).limit(5),
        supabase.from('setores').select('id, nome, responsavel').ilike('nome', `%${q}%`).limit(5),
      ])

      if (cancelled) return

      const items: SearchResult[] = []
      dlgRes.data?.forEach((d) =>
        items.push({ type: 'dialogo', id: d.id, title: d.titulo, subtitle: `Diálogo · ${d.setor}`, route: `/dialogos/${d.id}`, icon: MessageSquare }),
      )
      partRes.data?.forEach((p) =>
        items.push({ type: 'participante', id: p.id, title: p.nome, subtitle: `Participante · ${p.setor || ''}`, route: `/dialogos/${p.dialogo_id}`, icon: Users }),
      )
      temaRes.data?.forEach((t) =>
        items.push({ type: 'tema', id: t.id, title: t.titulo, subtitle: `Tema · ${t.categoria}`, route: '/temas', icon: BookOpen }),
      )
      setorRes.data?.forEach((s) =>
        items.push({ type: 'setor', id: s.id, title: s.nome, subtitle: `Setor · ${s.responsavel || ''}`, route: '/setores', icon: Building2 }),
      )
      setResults(items)
      setHighlight(0)
      setLoading(false)
    }

    const timer = setTimeout(search, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [query])

  function selectResult(r: SearchResult) {
    navigate(r.route)
    setOpen(false)
    setQuery('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && results[highlight]) {
      e.preventDefault()
      selectResult(results[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 w-64 focus-within:ring-2 focus-within:ring-aguia-500 focus-within:border-transparent transition-all">
        <Search className="w-4 h-4 text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-neutral-400"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]) }}
            className="text-neutral-400 hover:text-neutral-600 shrink-0 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-neutral-200 max-h-80 overflow-y-auto animate-slide-down z-50">
          {loading ? (
            <div className="p-4 text-center text-sm text-neutral-400">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-400">
              Nenhum resultado para "{query}"
            </div>
          ) : (
            <div className="py-1">
              {results.map((r, i) => {
                const Icon = r.icon
                return (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => selectResult(r)}
                    onMouseEnter={() => setHighlight(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      i === highlight ? 'bg-aguia-50' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{r.title}</p>
                      <p className="text-xs text-neutral-500 truncate">{r.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
