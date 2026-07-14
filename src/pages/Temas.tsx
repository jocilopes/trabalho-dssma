import { useEffect, useState } from 'react'
import { supabase, type Tema } from '../lib/supabase'
import { categoriaLabels, categoriaColors } from '../lib/utils'
import { Plus, ShieldCheck, Heart, Leaf, Pencil, Trash2, Search, BookOpen } from 'lucide-react'

export default function Temas() {
  const [temas, setTemas] = useState<Tema[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Tema | null>(null)
  const [form, setForm] = useState({ titulo: '', categoria: 'seguranca', descricao: '' })

  useEffect(() => {
    loadTemas()
  }, [])

  async function loadTemas() {
    setLoading(true)
    const { data } = await supabase.from('temas').select('*').order('titulo')
    setTemas(data || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) return
    const payload = {
      titulo: form.titulo.trim(),
      categoria: form.categoria,
      descricao: form.descricao.trim() || null,
    }
    if (editing) {
      await supabase.from('temas').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('temas').insert(payload)
    }
    setShowForm(false)
    setEditing(null)
    setForm({ titulo: '', categoria: 'seguranca', descricao: '' })
    loadTemas()
  }

  function startEdit(t: Tema) {
    setEditing(t)
    setForm({ titulo: t.titulo, categoria: t.categoria, descricao: t.descricao || '' })
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este tema?')) return
    await supabase.from('temas').delete().eq('id', id)
    loadTemas()
  }

  const filtered = temas.filter((t) => {
    const matchSearch = !search || t.titulo.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'all' || t.categoria === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-heading font-bold text-neutral-800">
            Temas
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Biblioteca de temas para DDS — Segurança, Saúde e Meio Ambiente
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ titulo: '', categoria: 'seguranca', descricao: '' }); setShowForm(true) }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Novo Tema
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-neutral-200 flex-1">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar tema..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-neutral-400"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="input sm:w-44"
        >
          <option value="all">Todas categorias</option>
          <option value="seguranca">Segurança</option>
          <option value="saude">Saúde</option>
          <option value="meio_ambiente">Meio Ambiente</option>
        </select>
      </div>

      {showForm && (
        <div className="card p-5 mb-4 animate-slide-down">
          <h3 className="font-heading font-semibold text-neutral-800 mb-3">
            {editing ? 'Editar tema' : 'Novo tema'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Título do tema *"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="input"
              />
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="input"
              >
                <option value="seguranca">Segurança</option>
                <option value="saude">Saúde</option>
                <option value="meio_ambiente">Meio Ambiente</option>
              </select>
            </div>
            <textarea
              placeholder="Descrição do tema..."
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={2}
              className="input resize-none"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm">
                {editing ? 'Salvar' : 'Adicionar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-neutral-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-neutral-500 mt-3">Nenhum tema encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => {
            const CatIcon = t.categoria === 'seguranca' ? ShieldCheck : t.categoria === 'saude' ? Heart : Leaf
            return (
              <div key={t.id} className="card-hover p-4 group">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${categoriaColors[t.categoria]}`}>
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-neutral-800">{t.titulo}</h3>
                    <span className={`inline-block mt-1 ${categoriaColors[t.categoria]}`}>
                      {categoriaLabels[t.categoria]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(t)} className="p-1.5 rounded text-neutral-400 hover:text-aguia-600 hover:bg-aguia-50">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded text-neutral-400 hover:text-danger-600 hover:bg-danger-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {t.descricao && (
                  <p className="text-xs text-neutral-500 mt-3 line-clamp-2">{t.descricao}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
