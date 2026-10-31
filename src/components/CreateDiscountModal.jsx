import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Tag, Plus, ShieldAlert } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function CreateDiscountModal({ onClose, onNotify }) {
  const { currentUser, addDiscount, products } = useSubscriptions()

  const [code, setCode] = useState('')
  const [type, setType] = useState('percentage') // percentage or fixed
  const [value, setValue] = useState('')
  const [minAmount, setMinAmount] = useState('5000')
  const [minQuantity, setMinQuantity] = useState('1')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('2024-12-31')
  const [maxUsage, setMaxUsage] = useState('100')
  const [scope, setScope] = useState('all') // all or specific_product
  const [targetProductId, setTargetProductId] = useState('')
  const [description, setDescription] = useState('')

  // Admin access guard
  const isAdmin = currentUser.role === 'admin'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isAdmin) return
    if (!code.trim() || !value) return

    const disc = addDiscount({
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minAmount: Number(minAmount) || 0,
      minQuantity: Number(minQuantity) || 1,
      startDate,
      endDate,
      maxUsage: Number(maxUsage) || 100,
      scope,
      targetProductId: scope === 'specific_product' ? targetProductId : null,
      description: description.trim()
    })

    onNotify?.(`Discount rule ${disc.code} created (${disc.type === 'percentage' ? `${disc.value}%` : `₹${disc.value}`} off)!`)
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
            <div className="eyebrow">Promotions & Margin Control</div>
            <h2>Configure Discount Rule (Admin Only)</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {!isAdmin ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--danger)' }}>
            <ShieldAlert size={32} style={{ margin: '0 auto 12px' }} />
            <h3>Administrative Permission Required</h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '6px' }}>
              Only company administrators can create or publish discount rules to safeguard profit margins.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginTop: '20px' }}>
              <label>
                Discount Coupon Code
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ANNUAL15"
                  required
                  autoFocus
                />
              </label>

              <label>
                Discount Calculation Type
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 12px',
                    background: 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '12.5px'
                  }}
                >
                  <option value="percentage">Percentage Off (%)</option>
                  <option value="fixed">Fixed Rupee Amount (₹)</option>
                </select>
              </label>

              <label>
                Discount Value ({type === 'percentage' ? '%' : '₹'})
                <input
                  type="number"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={type === 'percentage' ? '15' : '1000'}
                  required
                />
              </label>

              <label>
                Maximum Usage Redemption Limit
                <input
                  type="number"
                  value={maxUsage}
                  onChange={e => setMaxUsage(e.target.value)}
                  placeholder="100"
                  min="1"
                  required
                />
              </label>

              <label>
                Minimum Order Spend (₹)
                <input
                  type="number"
                  value={minAmount}
                  onChange={e => setMinAmount(e.target.value)}
                  placeholder="5000"
                />
              </label>

              <label>
                Minimum Seat / Item Quantity
                <input
                  type="number"
                  value={minQuantity}
                  onChange={e => setMinQuantity(e.target.value)}
                  placeholder="1"
                  min="1"
                />
              </label>

              <label>
                Valid From
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </label>

              <label>
                Valid Until (Auto-Expiry)
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </label>

              <label className="wide">
                Application Scope
                <select
                  value={scope}
                  onChange={e => setScope(e.target.value)}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 12px',
                    background: 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '12.5px'
                  }}
                >
                  <option value="all">Entire Subscription / Invoice Total</option>
                  <option value="specific_product">Specific Product Line Only</option>
                </select>
              </label>

              {scope === 'specific_product' && (
                <label className="wide">
                  Target Product
                  <select
                    value={targetProductId}
                    onChange={e => setTargetProductId(e.target.value)}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-md)',
                      padding: '9px 12px',
                      background: 'var(--surface)',
                      color: 'var(--ink)',
                      fontSize: '12.5px'
                    }}
                  >
                    <option value="">Select product line...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="wide">
                Campaign Terms & Internal Reason
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Approved by Priya for Q4 enterprise customer renewal push..."
                  rows={2}
                />
              </label>
            </div>

            <div className="modal-footer">
              <button type="button" className="outline-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="primary-btn">
                <Plus size={15} strokeWidth={2.5} />
                Activate Discount Rule
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}

