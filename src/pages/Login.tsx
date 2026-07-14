import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { ShieldCheck, Mail, Lock, ArrowRight, UserPlus, AlertCircle } from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fn = mode === 'login' ? signIn : signUp
    const { error } = await fn(email, password)
    if (error) setError(error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-aguia-900 via-aguia-800 to-aguia-700 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-accent-400 rounded-full blur-3xl translate-y-1/3" />
        </div>

        <div className="relative z-10">
          <img src="/logo-white.svg" alt="Águia Sistemas" className="h-10 mb-12" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-accent-400" />
            </div>
            <span className="text-accent-400 text-sm font-medium uppercase tracking-wider">
              Segurança · Saúde · Meio Ambiente
            </span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-3 leading-tight">
            DSSMA Digital
          </h1>
          <p className="text-aguia-100 text-base max-w-md leading-relaxed">
            Sistema de gestão de diálogos de segurança, saúde e meio ambiente.
            Acompanhe, registre e analise os DDS da sua organização em um só lugar.
          </p>
        </div>

        <div className="relative z-10 text-aguia-300 text-sm">
          <p>Águia Sistemas · Ponta Grossa — PR</p>
          <p className="mt-1">Mais de 50 anos de atuação em Intralogística</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-neutral-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <img src="/logo-blue.svg" alt="Águia Sistemas" className="h-10" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-neutral-800 mb-2">
              {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
            </h2>
            <p className="text-sm text-neutral-500">
              {mode === 'login'
                ? 'Acesse o sistema DSSMA Digital'
                : 'Cadastre-se para acessar o sistema'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-50 border border-danger-200 flex items-center gap-2 text-sm text-danger-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="input pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="animate-pulse">Carregando...</span>
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Cadastrar'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="inline-flex items-center gap-1.5 text-sm text-aguia-600 hover:text-aguia-700 font-medium"
            >
              {mode === 'login' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Não tem conta? Cadastre-se
                </>
              ) : (
                'Já tem conta? Fazer login'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
