import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bgfncanrbnqntyrpkptf.supabase.co'
const supabaseAnonKey = 'sb_publishable_RIeuvuxJytQ_sXAV85WgpQ_Yi9VDMkB'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  return supabase.auth.getSession()
}

export function onAuthChange(callback: (userId: string | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user?.id ?? null)
  })
}
