import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-ref')
)

export const supabase = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'brightloop_auth_token'
      }
    })
  : null

/**
 * Validate password complexity:
 * - At least 10 characters long
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordComplexity(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' }
  }
  if (password.length < 10) {
    return { valid: false, error: 'Password must be at least 10 characters long' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must include at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must include at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must include at least one number' }
  }
  if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(password)) {
    return { valid: false, error: 'Password must include at least one special character (!@#$%^&*...)' }
  }
  return { valid: true, error: null }
}

