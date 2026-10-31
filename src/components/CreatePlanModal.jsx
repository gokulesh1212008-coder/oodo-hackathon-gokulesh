import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Calendar, Clock } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function CreatePlanModal({ onClose, onNotify }) {
  const { addPlan } = useSubscriptions()

  const [name, setName] = useState('')
  const [billingFrequency, setBillingFrequency] = useState('Monthly') // daily, weekly, monthly, yearly
  const [price, setPrice] = useState('')
  const [minQuantity, setMinQuantity] = useState('1')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('2025-12-31')
  const [description, setDescription] = useState('')

  // Plan lifecycle policies decided plan by plan
  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState(false)
  const [allowEarlyTermination, setAllowEarlyTermination] = useState(true)
  const [allowPause, setAllowPause] = useState(true)
  const [autoRenew, setAutoRenew] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const plan = addPlan({
      name: name.trim(),
      code: name.trim().toLowerCase().replace(/\s+/g, '-'),
      billingFrequency,
      price: Number(price) || 0,
      minQuantity: Number(minQuantity) || 1,
      startDate,
      endDate,
      autoCloseOnEnd,
      allowEarlyTermination,
      allowPause,
      autoRenew,
      description: description.trim()
    })

    onNotify?.(`Subscription plan "${plan.name}" created with ${plan.billingFrequency} billing!`)
    onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="modal"
        onMouseDown={e => e.stopPropagation()}
        style={{ width: 'min(640px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-heading">
          <div>
            <div className="eyebrow">Pricing Architecture</div>
            <h2>Configure Subscription Plan</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginTop: '20px' }}>
            <label className="wide">
              Plan Title
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Professional Growth Tier"
                required
                autoFocus
              />
            </label>

            <label>
              Billing Cadence
              <select
                value={billingFrequency}
                onChange={e => setBillingFrequency(e.target.value)}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '12.5px'
                }}
              >
                <option value="Daily">Daily Billing</option>
                <option value="Weekly">Weekly Billing</option>
                <option value="Monthly">Monthly Billing</option>
                <option value="Yearly">Yearly / Annual Contract</option>
              </select>
            </label>

            <label>
              Base Recurring Price (₹)
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="2000"
                required
              />
            </label>

            <label>
              Minimum Quantity / Seats
              <input
                type="number"
                value={minQuantity}
                onChange={e => setMinQuantity(e.target.value)}
                min="1"
                required
              />
            </label>

            <label>
              Available From
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </label>

            <label>
              Available Until
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </label>

            <label className="wide">
              Plan Value Proposition & Summary
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Target customer segment, included features, and SLA allowances..."
                rows={2}
              />
            </label>
          </div>

          {/* Plan Lifecycle Rules */}
          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-tertiary)', fontWeight: 700, display: 'block', marginBottom: '10px' }}>
              Plan Lifecycle Policies (Admin Configurable)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={autoCloseOnEnd}
                  onChange={e => setAutoCloseOnEnd(e.target.checked)}
                />
                <span>Auto-close on end date</span>
              </label>

              <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={allowEarlyTermination}
                  onChange={e => setAllowEarlyTermination(e.target.checked)}
                />
                <span>Allow closing early</span>
              </label>

              <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={allowPause}
                  onChange={e => setAllowPause(e.target.checked)}
                />
                <span>Allow pause & resume</span>
              </label>

              <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={e => setAutoRenew(e.target.checked)}
                />
                <span>Default auto-renew</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              <Plus size={15} strokeWidth={2.5} />
              Publish Plan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

