import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase, type Dialogo, type Participante } from '../lib/supabase'
import { categoriaLabels, categoriaColors, statusLabels, formatDateLong } from '../lib/utils'
import ConfirmacaoPresenca from '../components/ConfirmacaoPresenca'
import {
  ArrowLeft, Pencil, Trash2, Plus, ShieldCheck, Heart, Leaf,
  Calendar, Clock, Users, User, Building2, FileText, Camera, Check, X,
} from 'lucide-react'

export default function DialogoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dialogo, setDialogo] = useState<Dialogo | null>(null)
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPart, setShowAddPart] = useState(false)
  const [newPart, setNewPart] = useState({ nome: '', matricula: '', setor: '' })
  const [confirmingPart, setConfirmingPart] = useState<Participante | null>(null)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    const [{ data: dlg }, { data: parts }] = await Promise.all([
      supabase.from('dialogos').select('*').eq('id', id!).maybeSingle(),
      supabase.from('participantes').select('*').eq('dialogo_id', id!).order('nome'),
    ])
    setDialogo(dlg || null)
    setParticipantes(parts || [])
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Excluir este diálogo e todos os participantes associados?')) return
    await supabase.from('dialogos').delete().eq('id', id!)
    navigate('/dialogos')
  }

  async function addParticipante() {
    if (!newPart.nome.trim()) return
    const { data } = await supabase
      .from('participantes')
      .insert({
        dialogo_id: id,
        nome: newPart.nome.trim(),
        matricula: newPart.matricula.trim() || null,
        setor: newPart.setor.trim() || null,
      })
      .select()
      .single()
    if (data) {
      setParticipantes([...participantes, data])
      if (dialogo) {
        const newCount = participantes.length + 1
        await supabase.from('dialogos').update({ num_participantes: newCount }).eq('id', id!)
        setDialogo({ ...dialogo, num_participantes: newCount })
      }
    }
    setNewPart({ nome: '', matricula: '', setor: '' })
    setShowAddPart(false)
  }

  async function removeParticipante(pid: string) {
    const part = participantes.find((p) => p.id === pid)
    if (part?.foto_url) {
      const photoPath = `${id}/${pid}-foto.jpg`
      const sigPath = `${id}/${pid}-assinatura.png`
      await Promise.all([
        supabase.storage.from('participantes-fotos').remove([photoPath]),
        supabase.storage.from('participantes-fotos').remove([sigPath]),
      ])
    }
    await supabase.from('participantes').delete().eq('id', pid)
    const updated = participantes.filter((p) => p.id !== pid)
    setParticipantes(updated)
    if (dialogo) {
      await supabase.from('dialogos').update({ num_participantes: updated.length }).eq('id', id!)
      setDialogo({ ...dialogo, num_participantes: updated.length })
    }
  }

  function handleConfirmed(updated: Participante) {
    setParticipantes(participantes.map((p) => (p.id === updated.id ? updated : p)))
    setConfirmingPart(null)
  }

  if (loading) {
    return <div className="p-6 text-center text-neutral-400">Carregando...</div>
  }

  if (!dialogo) {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-500">Diálogo não encontrado.</p>
        <Link to="/dialogos" className="btn-secondary mt-4 inline-flex">Voltar</Link>
      </div>
    )
  }

  const CatIcon = dialogo.categoria === 'seguranca' ? ShieldCheck : dialogo.categoria === 'saude' ? Heart : Leaf
  const confirmedCount = participantes.filter((p) => p.assinatura).length

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto animate-fade-in">
      <Link to="/dialogos" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Header card */}
      <div className="card p-5 lg:p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${categoriaColors[dialogo.categoria]}`}>
              <CatIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg lg:text-xl font-heading font-bold text-neutral-800">
                {dialogo.titulo}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">{dialogo.tema}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to={`/dialogos/${id}/editar`} className="btn-ghost">
              <Pencil className="w-4 h-4" />
            </Link>
            <button onClick={handleDelete} className="btn-ghost text-danger-600 hover:bg-danger-50">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`badge-${dialogo.status === 'realizado' ? 'success' : dialogo.status === 'agendado' ? 'warning' : 'danger'}`}>
            {statusLabels[dialogo.status]}
          </span>
          <span className={categoriaColors[dialogo.categoria]}>
            {categoriaLabels[dialogo.categoria]}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <InfoChip icon={Calendar} label="Data" value={formatDateLong(dialogo.data_realizacao)} />
          <InfoChip icon={Building2} label="Setor" value={dialogo.setor} />
          <InfoChip icon={User} label="Responsável" value={dialogo.responsavel} />
          <InfoChip icon={Clock} label="Duração" value={`${dialogo.duracao_minutos} min`} />
        </div>

        {dialogo.observacoes && (
          <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
              <p className="text-sm text-neutral-600">{dialogo.observacoes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-neutral-800 flex items-center gap-2">
            <Users className="w-4.5 h-4.5" size={18} />
            Participantes
            <span className="badge-neutral">{participantes.length}</span>
            {confirmedCount > 0 && (
              <span className="badge-success">
                {confirmedCount} confirmada{confirmedCount > 1 ? 's' : ''}
              </span>
            )}
          </h2>
          <button onClick={() => setShowAddPart(!showAddPart)} className="btn-secondary text-sm">
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {showAddPart && (
          <div className="mb-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200 animate-slide-down">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nome *"
                value={newPart.nome}
                onChange={(e) => setNewPart({ ...newPart, nome: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Matrícula"
                value={newPart.matricula}
                onChange={(e) => setNewPart({ ...newPart, matricula: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Setor"
                value={newPart.setor}
                onChange={(e) => setNewPart({ ...newPart, setor: e.target.value })}
                className="input"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={addParticipante} className="btn-primary text-sm">
                Confirmar
              </button>
              <button onClick={() => setShowAddPart(false)} className="btn-ghost text-sm">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {participantes.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">
            Nenhum participante registrado.
          </p>
        ) : (
          <div className="space-y-1">
            {participantes.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
              >
                {/* Avatar / Photo */}
                {p.foto_url ? (
                  <img
                    src={p.foto_url}
                    alt={p.nome}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-aguia-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-aguia-600" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800">{p.nome}</p>
                  <p className="text-xs text-neutral-500">
                    {p.matricula && `Mat. ${p.matricula}`}
                    {p.matricula && p.setor && ' · '}
                    {p.setor}
                  </p>
                  {p.assinatura_data && (
                    <p className="text-xs text-success-600 mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Presença confirmada em {new Date(p.assinatura_data).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                {p.assinatura ? (
                  <span className="badge-success">
                    <Check className="w-3 h-3 mr-0.5" />
                    Presente
                  </span>
                ) : (
                  <span className="badge-warning">
                    <X className="w-3 h-3 mr-0.5" />
                    Pendente
                  </span>
                )}

                {/* Confirm presence button */}
                {!p.assinatura && (
                  <button
                    onClick={() => setConfirmingPart(p)}
                    className="btn-secondary text-sm whitespace-nowrap"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="hidden sm:inline">Confirmar presença</span>
                    <span className="sm:hidden">Confirmar</span>
                  </button>
                )}

                {/* Re-confirm button */}
                {p.assinatura && (
                  <button
                    onClick={() => setConfirmingPart(p)}
                    className="btn-ghost text-sm whitespace-nowrap"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="hidden sm:inline">Refazer</span>
                  </button>
                )}

                <button
                  onClick={() => removeParticipante(p.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded text-neutral-400 hover:text-danger-600 hover:bg-danger-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {confirmingPart && (
        <ConfirmacaoPresenca
          participante={confirmingPart}
          dialogoId={id!}
          onClose={() => setConfirmingPart(null)}
          onConfirmed={handleConfirmed}
        />
      )}
    </div>
  )
}

function InfoChip({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-50">
      <Icon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-sm font-medium text-neutral-800 truncate">{value}</p>
      </div>
    </div>
  )
}
