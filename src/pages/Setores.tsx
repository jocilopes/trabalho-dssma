import { useEffect, useState } from 'react'
import { supabase, type Setor } from '../lib/supabase'
import { Plus, Pencil, Trash2, Building2, User } from 'lucide-react'

export default function Setores() {
  const [setores, setSetores] = useState<Setor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Setor | null>(null)
  const [form, setForm] = useState({ nome: '', responsavel: '' })

  useEffect(() => {
    loadSetores()
  }, [])

  async function loadSetores() {
    setLoading(true)
    const { data } = await supabase.from('setores').select('*').order('nome')
    setSetores(data || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) return
    const payload = { nome: form.nome.trim(), responsavel: form.responsavel.trim() || null }
    if (editing) {
      await supabase.from('setores').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('setores').insert(payload)
    }
    setShowForm(false)
    setEditing(null)
    setForm({ nome: '', responsavel: '' })
    loadSetores()
  }

  function startEdit(s: Setor) {
    setEditing(s)
    setForm({ nome: s.nome, responsavel: s.responsavel || '' })
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este setor?')) return
    await supabase.from('setores').delete().eq('id', id)
    loadSetores()
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-heading font-bold text-neutral-800">
            Setores
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Departamentos da organização
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ nome: '', responsavel: '' }); setShowForm(true) }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Novo Setor
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-4 animate-slide-down">
          <h3 className="font-heading font-semibold text-neutral-800 mb-3">
            {editing ? 'Editar setor' : 'Novo setor'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nome do setor *"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="input"
            />
            <input
              type="text"
              placeholder="Responsável"
              value={form.responsavel}
              onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
              className="input"
            />
            <div className="sm:col-span-2 flex gap-2">
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
      ) : setores.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-neutral-500 mt-3">Nenhum setor cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {setores.map((s) => (
            <div key={s.id} className="card-hover p-4 group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-aguia-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-aguia-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-neutral-800">{s.nome}</h3>
                  {s.responsavel && (
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {s.responsavel}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(s)} className="p-1.5 rounded text-neutral-400 hover:text-aguia-600 hover:bg-aguia-50">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded text-neutral-400 hover:text-danger-600 hover:bg-danger-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
