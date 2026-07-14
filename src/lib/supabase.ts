import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

export type Dialogo = {
  id: string
  titulo: string
  tema: string
  categoria: 'seguranca' | 'saude' | 'meio_ambiente'
  data_realizacao: string
  setor: string
  responsavel: string
  duracao_minutos: number
  num_participantes: number
  observacoes: string | null
  status: 'realizado' | 'agendado' | 'cancelado'
  created_at: string
}

export type Participante = {
  id: string
  dialogo_id: string
  nome: string
  matricula: string | null
  setor: string
  assinatura: boolean
  foto_url: string | null
  assinatura_data: string | null
  assinatura_imagem_url: string | null
  created_at: string
  dialogos?: { titulo: string; data_realizacao: string }[]
}

export type Setor = {
  id: string
  nome: string
  responsavel: string | null
  created_at: string
}

export type Tema = {
  id: string
  titulo: string
  categoria: 'seguranca' | 'saude' | 'meio_ambiente'
  descricao: string | null
  created_at: string
}
