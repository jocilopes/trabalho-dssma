export const categoriaLabels: Record<string, string> = {
  seguranca: 'Segurança',
  saude: 'Saúde',
  meio_ambiente: 'Meio Ambiente',
}

export const categoriaColors: Record<string, string> = {
  seguranca: 'bg-danger-100 text-danger-700',
  saude: 'bg-success-100 text-success-700',
  meio_ambiente: 'bg-aguia-100 text-aguia-700',
}

export const statusLabels: Record<string, string> = {
  realizado: 'Realizado',
  agendado: 'Agendado',
  cancelado: 'Cancelado',
}

export const statusColors: Record<string, string> = {
  realizado: 'bg-success-100 text-success-700',
  agendado: 'bg-warning-100 text-warning-700',
  cancelado: 'bg-danger-100 text-danger-700',
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''))
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''))
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
