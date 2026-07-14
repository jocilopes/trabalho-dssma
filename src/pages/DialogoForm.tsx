import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/utils'
import { ArrowLeft, Save } from 'lucide-react'

export default function DialogoForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    titulo: '',
    tema: '',
    categoria: 'seguranca' as string,
    data_realizacao: todayISO(),
    setor: '',
    responsavel: '',
    duracao_minutos: 15,
    num_participantes: 0,
    observacoes: '',
    status: 'realizado' as string,
  })
  const [temas, setTemas] = useState<{ id: string; titulo: string; categoria: string }[]>([])
  const [setores, setSetores] = useState<{ nome: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    const [{ data: temasData }, { data: setoresData }] = await Promise.all([
      supabase.from('temas').select('id, titulo, categoria').order('titulo'),
      supabase.from('setores').select('nome').order('nome'),
    ])
    setTemas(temasData || [])
    setSetores(setoresData || [])

    if (id) {
      const { data } = await supabase.from('dialogos').select('*').eq('id', id).maybeSingle()
      if (data) {
        setForm({
          titulo: data.titulo,
          tema: data.tema,
          categoria: data.categoria,
          data_realizacao: data.data_realizacao,
          setor: data.setor,
          responsavel: data.responsavel,
          duracao_minutos: data.duracao_minutos,
          num_participantes: data.num_participantes,
          observacoes: data.observacoes || '',
          status: data.status,
        })
      }
    }
  }

  function handleTemaSelect(titulo: string) {
    const tema = temas.find((t) => t.titulo === titulo)
    setForm((f) => ({
      ...f,
      tema: titulo,
      categoria: tema?.categoria || f.categoria,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (!form.titulo.trim() || !form.tema.trim() || !form.setor.trim() || !form.responsavel.trim()) {
      setError('Preencha todos os campos obrigatórios.')
      setSaving(false)
      return
    }

    const payload = {
      titulo: form.titulo.trim(),
      tema: form.tema.trim(),
      categoria: form.categoria,
      data_realizacao: form.data_realizacao,
      setor: form.setor.trim(),
      responsavel: form.responsavel.trim(),
      duracao_minutos: Number(form.duracao_minutos) || 15,
      num_participantes: Number(form.num_participantes) || 0,
      observacoes: form.observacoes.trim() || null,
      status: form.status,
    }

    if (isEdit) {
      const { error: err } = await supabase.from('dialogos').update(payload).eq('id', id!)
      if (err) setError(err.message)
      else navigate(`/dialogos/${id}`)
    } else {
      const { data, error: err } = await supabase.from('dialogos').insert(payload).select().single()
      if (err) setError(err.message)
      else if (data) navigate(`/dialogos/${data.id}`)
    }
    setSaving(false)
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto animate-fade-in">
      <Link to="/dialogos" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <h1 className="text-xl lg:text-2xl font-heading font-bold text-neutral-800 mb-1">
        {isEdit ? 'Editar Diálogo' : 'Novo Diálogo'}
      </h1>
      <p className="text-sm text-neutral-500 mb-6">
        Registre um DDS — Diálogo de Segurança, Saúde e Meio Ambiente
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger-50 border border-danger-200 text-sm text-danger-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-5 lg:p-6 space-y-4">
        <div>
          <label className="label">Título *</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Ex: DDS - Uso de EPIs na Produção"
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tema *</label>
            <input
              type="text"
              list="temas-list"
              value={form.tema}
              onChange={(e) => handleTemaSelect(e.target.value)}
              placeholder="Selecione ou digite um tema"
              className="input"
            />
            <datalist id="temas-list">
              {temas.map((t) => (
                <option key={t.id} value={t.titulo} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label">Categoria *</label>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Data de Realização *</label>
            <input
              type="date"
              value={form.data_realizacao}
              onChange={(e) => setForm({ ...form, data_realizacao: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Setor *</label>
            <input
              type="text"
              list="setores-list"
              value={form.setor}
              onChange={(e) => setForm({ ...form, setor: e.target.value })}
              placeholder="Selecione ou digite"
              className="input"
            />
            <datalist id="setores-list">
              {setores.map((s) => (
                <option key={s.nome} value={s.nome} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Responsável *</label>
            <input
              type="text"
              value={form.responsavel}
              onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
              placeholder="Nome do responsável"
              className="input"
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input"
            >
              <option value="realizado">Realizado</option>
              <option value="agendado">Agendado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Duração (min)</label>
            <input
              type="number"
              min={1}
              value={form.duracao_minutos}
              onChange={(e) => setForm({ ...form, duracao_minutos: Number(e.target.value) })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Nº Participantes</label>
            <input
              type="number"
              min={0}
              value={form.num_participantes}
              onChange={(e) => setForm({ ...form, num_participantes: Number(e.target.value) })}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Observações</label>
          <textarea
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            rows={3}
            placeholder="Notas adicionais sobre o diálogo..."
            className="input resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Registrar diálogo'}
          </button>
          <Link to="/dialogos" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
