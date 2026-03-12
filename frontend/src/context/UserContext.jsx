import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Restore session on page load (with timeout fallback for lock issues)
    const timeout = setTimeout(() => setIsLoading(false), 3000)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout)
      if (session) {
        setUser(await buildUser(session.user))
      }
      setIsLoading(false)
    })

    // Keep user state in sync with auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(await buildUser(session.user))
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    // If session is null, Supabase requires email confirmation
    return data.session === null
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <UserContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}

// Build the user object we expose to the app
async function buildUser(authUser) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', authUser.id)
    .single()

  return {
    id: authUser.id,
    email: authUser.email,
    name: profile?.name ?? authUser.email.split('@')[0],
  }
}
