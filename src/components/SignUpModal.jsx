import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Check, ShieldCheck, AlertCircle, ArrowRight, Lock } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function SignUpModal({ onClose, onOpenReset, onNotify }) {
  const { validatePasswordRules, signUp } = useSubscriptions()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  // Live password validation state
  const rules = validatePasswordRules(password)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const res = signUp({
      name: name.trim(),
      email: email.trim(),
      password,
      company: company.trim(),
      phone: phone.trim()
    })

    if (res.success) {
      onNotify?.(`Welcome ${name}! Your account has been registered and you are now in the Customer Portal.`)
      onClose()
    } else {
      setError(res.error || 'Failed to complete registration.')
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="modal"
        onMouseDown={e => e.stopPropagation()}
        style={{ width: 'min(500px, 100%)' }}
      >
        <div className="modal-heading">
          <div>
            <div className="eyebrow">Client Portal Onboarding</div>
            <h2>Create Your Business Account</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginTop: '18px' }}>
            <label>
              Full Name
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Rajesh Verma"
                required
                autoFocus
              />
            </label>

            <label>
              Company / Legal Entity
              <input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Verma Logistics Pvt. Ltd."
                required
              />
            </label>

            <label className="wide">
              Official Business Email (Single Account)
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rajesh@vermalogistics.in"
                required
              />
            </label>

            <label className="wide">
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create secure password"
                required
              />
            </label>
          </div>

          {/* Live Enterprise Password Rules Checklist */}
          <div style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-tertiary)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Enterprise Password Standards
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: rules.minLength ? 'var(--success)' : 'var(--ink-tertiary)' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: rules.minLength ? 'var(--success)' : 'var(--line)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '9px' }}>
                  {rules.minLength ? '✓' : ''}
                </span>
                <span>More than 8 characters</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: rules.hasUpper ? 'var(--success)' : 'var(--ink-tertiary)' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: rules.hasUpper ? 'var(--success)' : 'var(--line)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '9px' }}>
                  {rules.hasUpper ? '✓' : ''}
                </span>
                <span>Uppercase letter (A–Z)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: rules.hasLower ? 'var(--success)' : 'var(--ink-tertiary)' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: rules.hasLower ? 'var(--success)' : 'var(--line)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '9px' }}>
                  {rules.hasLower ? '✓' : ''}
                </span>
                <span>Lowercase letter (a–z)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: rules.hasSpecial ? 'var(--success)' : 'var(--ink-tertiary)' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: rules.hasSpecial ? 'var(--success)' : 'var(--line)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '9px' }}>
                  {rules.hasSpecial ? '✓' : ''}
                </span>
                <span>Special char (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                onClose()
                onOpenReset()
              }}
              style={{ fontSize: '11.5px' }}
            >
              Forgot password?
            </button>
          </div>

          <div className="modal-footer">
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={!rules.isValid}>
              <ShieldCheck size={15} />
              Register Account & Enter Portal
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

