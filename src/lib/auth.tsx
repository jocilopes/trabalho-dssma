import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

const LEADER_EMAIL = 'aguiasistemas@gmail.com'

export type AccessStatus = 'loading' | 'approved' | 'pending' | 'rejected' | 'none'

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  accessStatus: AccessStatus
  isLeader: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshAccessStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('loading')

  async function fetchAccessStatus(userId: string | undefined) {
    if (!userId) {
      setAccessStatus('none')
      return
    }
    const { data, error } = await supabase
      .from('access_requests')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !data) {
      setAccessStatus('pending')
      return
    }
    if (data.status === 'aprovado') setAccessStatus('approved')
    else if (data.status === 'reprovado') setAccessStatus('rejected')
    else setAccessStatus('pending')
  }

  async function refreshAccessStatus() {
    await fetchAccessStatus(session?.user?.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      fetchAccessStatus(data.session?.user?.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      setLoading(false)
      ;(async () => {
        await fetchAccessStatus(sess?.user?.id)
      })()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message || null }
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message || null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setAccessStatus('none')
  }

  const isLeader = session?.user?.email === LEADER_EMAIL

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, accessStatus, isLeader, signIn, signUp, signOut, refreshAccessStatus }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
