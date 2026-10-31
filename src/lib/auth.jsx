import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isLiveSupabaseConfigured, validatePasswordComplexity } from './supabase'

const AuthContext = createContext(null)

// In-memory rate limiting tracker: IP/Identifier -> { attempts, lockedUntil }
const loginAttemptTracker = new Map()
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 60 * 1000 // 1 minute lockout

function checkRateLimit(email) {
  const normalized = email.toLowerCase().trim()
  const record = loginAttemptTracker.get(normalized)
  if (record) {
    if (record.lockedUntil && record.lockedUntil > Date.now()) {
      const remainingSeconds = Math.ceil((record.lockedUntil - Date.now()) / 1000)
      throw new Error(`Too many failed login attempts. Account temporarily locked. Try again in ${remainingSeconds}s.`)
    }
    if (record.lockedUntil && record.lockedUntil <= Date.now()) {
      loginAttemptTracker.delete(normalized)
    }
  }
}

function recordFailedAttempt(email) {
  const normalized = email.toLowerCase().trim()
  const record = loginAttemptTracker.get(normalized) || { attempts: 0, lockedUntil: null }
  record.attempts += 1
  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS
  }
  loginAttemptTracker.set(normalized, record)
}

function clearFailedAttempts(email) {
  loginAttemptTracker.delete(email.toLowerCase().trim())
}

const DEMO_USERS = [
  {
    id: 'usr-admin-001',
    email: 'admin@brightloop.io',
    name: 'Priya Sharma',
    role: 'admin',
    company: 'Brightloop Technologies',
    initials: 'PS',
    color: 'purple'
  },
  {
    id: 'usr-staff-002',
    email: 'staff@brightloop.io',
    name: 'Aman Verma',
    role: 'staff',
    company: 'Brightloop Billing Operations',
    initials: 'AV',
    color: 'teal'
  },
  {
    id: 'usr-cust-003',
    email: 'rohan@mehta.co',
    name: 'Rohan Mehta',
    role: 'customer',
    company: 'Mehta & Co.',
    initials: 'RM',
    color: 'violet'
  }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize session
  useEffect(() => {
    if (isLiveSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user)
          fetchSupabaseProfile(session.user.id)
        } else {
          setLoading(false)
        }
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchSupabaseProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      })

      return () => subscription.unsubscribe()
    } else {
      // Local session storage for seamless standalone dev
      const savedUser = localStorage.getItem('brightloop_current_user')
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser)
          setUser({ id: parsed.id, email: parsed.email })
          setProfile(parsed)
        } catch {
          localStorage.removeItem('brightloop_current_user')
        }
      } else {
        // Default to Administrator
        const defaultAdmin = DEMO_USERS[0]
        setUser({ id: defaultAdmin.id, email: defaultAdmin.email })
        setProfile(defaultAdmin)
        localStorage.setItem('brightloop_current_user', JSON.stringify(defaultAdmin))
      }
      setLoading(false)
    }
  }, [])

  async function fetchSupabaseProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      setProfile({
        id: data.id,
        email: data.email,
        name: data.full_name,
        role: data.role,
        company: data.company_name,
        initials: (data.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      })
    } catch {
      // Fallback profile if profile row is still syncing
      setProfile({
        id: userId,
        email: user?.email,
        name: user?.email?.split('@')[0],
        role: 'customer',
        initials: 'CU'
      })
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    checkRateLimit(email)

    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) {
        recordFailedAttempt(email)
        throw new Error(error.message)
      }
      clearFailedAttempts(email)
      setUser(data.user)
      await fetchSupabaseProfile(data.user.id)
      return data.user
    } else {
      // Local fallback mode: check demo password complexity & demo accounts
      const complexity = validatePasswordComplexity(password)
      if (!complexity.valid && password !== 'Brightloop@2026!') {
        recordFailedAttempt(email)
        throw new Error(complexity.error)
      }

      const match = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (!match) {
        // Allow dynamic customer sign in if password valid
        const customUser = {
          id: `usr-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: 'customer',
          company: 'Subscriber Account',
          initials: email.slice(0, 2).toUpperCase(),
          color: 'blue'
        }
        clearFailedAttempts(email)
        setUser({ id: customUser.id, email })
        setProfile(customUser)
        localStorage.setItem('brightloop_current_user', JSON.stringify(customUser))
        return customUser
      }

      clearFailedAttempts(email)
      setUser({ id: match.id, email: match.email })
      setProfile(match)
      localStorage.setItem('brightloop_current_user', JSON.stringify(match))
      return match
    }
  }

  async function register(email, password, fullName, company, role = 'customer') {
    const complexity = validatePasswordComplexity(password)
    if (!complexity.valid) {
      throw new Error(complexity.error)
    }

    // Role escalation prevention: only current admins can create staff/admin roles
    if (role !== 'customer' && profile?.role !== 'admin') {
      throw new Error('Privilege escalation rejected: only administrators can create staff or admin accounts.')
    }

    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company: company,
            role: role
          }
        }
      })
      if (error) throw new Error(error.message)
      return data.user
    } else {
      const newUser = {
        id: `usr-${Date.now()}`,
        email,
        name: fullName,
        role: role,
        company: company || 'Brightloop Customer',
        initials: (fullName || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        color: role === 'admin' ? 'purple' : role === 'staff' ? 'teal' : 'violet'
      }
      setUser({ id: newUser.id, email })
      setProfile(newUser)
      localStorage.setItem('brightloop_current_user', JSON.stringify(newUser))
      return newUser
    }
  }

  async function logout() {
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
    localStorage.removeItem('brightloop_current_user')
  }

  async function resetPassword(email) {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.')
    }
    if (isLiveSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw new Error(error.message)
    }
    return { success: true, message: `Password reset instructions sent to ${email}` }
  }

  function switchRole(targetRole) {
    // Allows switching demo persona for testing role-based perspectives
    const target = DEMO_USERS.find(u => u.role === targetRole)
    if (target) {
      setUser({ id: target.id, email: target.email })
      setProfile(target)
      localStorage.setItem('brightloop_current_user', JSON.stringify(target))
    }
  }

  const role = profile?.role || 'customer'
  const isAdmin = role === 'admin'
  const isStaff = role === 'staff'
  const isCustomer = role === 'customer'

  const value = {
    user,
    profile,
    role,
    isAdmin,
    isStaff,
    isCustomer,
    loading,
    login,
    register,
    logout,
    resetPassword,
    switchRole,
    demoUsers: DEMO_USERS
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

