'use client'

import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'

const AuthContext = createContext<User | null>(null)

export const AuthProvider = ({ user, children }: { user: User | null; children: React.ReactNode }) => (
  <AuthContext.Provider value={user}>
    {children}
  </AuthContext.Provider>
)

export const useAuth = () => useContext(AuthContext)
