import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, CheckCircle2 } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function ResetPasswordModal({ onClose, onNotify }) {
  const { users } = useSubscriptions()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    onNotify?.(`Password reset instructions sent to ${email}`)
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="modal"
        onMouseDown={e => e.stopPropagation()}
        style={{ width: 'min(460px, 100%)' }}
      >
        <div className="modal-heading">
          <div>
            <div className="eyebrow">Security & Credentials</div>
            <h2>Reset Account Password</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Reset Link Dispatched</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              A time-limited, encrypted reset link has been dispatched to <strong>{email}</strong>. Check your inbox to configure your new credentials.
            </p>
            <button className="primary-btn" onClick={onClose} style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '12px', lineHeight: 1.5 }}>
              Enter your registered Brightloop business email. If an account matches our records, a secure reset token will be sent immediately.
            </p>

            <div className="form-grid" style={{ marginTop: '16px' }}>
              <label className="wide">
                Registered Email Address
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoFocus
                />
              </label>
            </div>

            <div className="modal-footer">
              <button type="button" className="outline-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="primary-btn">
                <Mail size={15} />
                Send Reset Link
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}

