import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Trash2, Tag, FileCheck, CheckCircle2 } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function CreateSubscriptionModal({ onClose, onNotify }) {
  const { customers, plans, products, createSubscription, validateDiscount } = useSubscriptions()

  const [template, setTemplate] = useState('custom')
  const [customerId, setCustomerId] = useState(customers[0]?.id || '')
  const [planId, setPlanId] = useState(plans[0]?.id || '')
  const [paymentTerms, setPaymentTerms] = useState('Net 15')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [expiryDate, setExpiryDate] = useState('2025-10-31')
  const [stage, setStage] = useState('Draft') // Start as Draft or Quotation
  const [discountCode, setDiscountCode] = useState('')
  const [discountMsg, setDiscountMsg] = useState(null)

  // Line items state
  const [lines, setLines] = useState([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      variantName: products[0]?.variants?.[0]?.name || 'Standard Edition',
      unitPrice: products[0]?.salesPrice || 2000,
      quantity: 5,
      priceDelta: 0
    }
  ])

  // Template pre-fill handler
  const handleTemplateChange = (tmplKey) => {
    setTemplate(tmplKey)
    if (tmplKey === 'growth-pack') {
      const gPlan = plans.find(p => p.code === 'growth') || plans[0]
      setPlanId(gPlan.id)
      setLines([
        {
          productId: products[0]?.id || '',
          productName: 'Brightloop CRM Core',
          variantName: 'Odoo Brand Integrated', // Uses Odoo brand variant
          unitPrice: 2560,
          quantity: 5,
          priceDelta: 560
        },
        {
          productId: products[2]?.id || '',
          productName: 'Insight Analytics Engine',
          variantName: 'Standard Reporting Pack',
          unitPrice: 1200,
          quantity: 2,
          priceDelta: 0
        }
      ])
      setDiscountCode('WELCOME20')
    } else if (tmplKey === 'enterprise-pack') {
      const ePlan = plans.find(p => p.code === 'enterprise') || plans[0]
      setPlanId(ePlan.id)
      setLines([
        {
          productId: products[1]?.id || '',
          productName: 'Cloud ERP Suite',
          variantName: 'High Availability Multi-Region',
          unitPrice: 5300,
          quantity: 10,
          priceDelta: 800
        },
        {
          productId: products[3]?.id || '',
          productName: 'Priority 24/7 SLA Support',
          variantName: '24/7 Mission-Critical SLA',
          unitPrice: 1400,
          quantity: 1,
          priceDelta: 600
        }
      ])
      setDiscountCode('ANNUAL10')
    }
  }

  const addLine = () => {
    const prod = products[0]
    setLines(prev => [
      ...prev,
      {
        productId: prod?.id || '',
        productName: prod?.name || '',
        variantName: prod?.variants?.[0]?.name || 'Standard',
        unitPrice: prod?.salesPrice || 2000,
        quantity: 1,
        priceDelta: 0
      }
    ])
  }

  const updateLineProduct = (index, prodId) => {
    const prod = products.find(p => p.id === prodId)
    if (!prod) return
    const defaultVariant = prod.variants?.[0] || { name: 'Standard', priceDelta: 0 }
    setLines(prev => prev.map((l, i) => {
      if (i === index) {
        return {
          ...l,
          productId: prod.id,
          productName: prod.name,
          variantName: defaultVariant.name,
          priceDelta: defaultVariant.priceDelta || 0,
          unitPrice: prod.salesPrice + (defaultVariant.priceDelta || 0)
        }
      }
      return l
    }))
  }

  const updateLineVariant = (index, variantName) => {
    setLines(prev => prev.map((l, i) => {
      if (i === index) {
        const prod = products.find(p => p.id === l.productId)
        const variant = prod?.variants?.find(v => v.name === variantName)
        const delta = variant?.priceDelta || 0
        return {
          ...l,
          variantName,
          priceDelta: delta,
          unitPrice: (prod?.salesPrice || 0) + delta
        }
      }
      return l
    }))
  }

  const updateLineQty = (index, qty) => {
    setLines(prev => prev.map((l, i) => {
      if (i === index) {
        return { ...l, quantity: Math.max(1, Number(qty) || 1) }
      }
      return l
    }))
  }

  const removeLine = (index) => {
    if (lines.length > 1) {
      setLines(prev => prev.filter((_, i) => i !== index))
    }
  }

  // Live calculation
  const subtotal = lines.reduce((acc, l) => acc + (l.unitPrice * l.quantity), 0)
  const totalQty = lines.reduce((acc, l) => acc + l.quantity, 0)

  const handleValidateDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountMsg(null)
      return
    }
    const check = validateDiscount(discountCode, subtotal, totalQty)
    if (check.valid) {
      setDiscountMsg({ success: true, text: `Valid! Applied ₹${check.discountAmount.toLocaleString()} discount.` })
    } else {
      setDiscountMsg({ success: false, text: check.error || 'Invalid discount' })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const sub = createSubscription({
      customerId,
      planId,
      lines,
      paymentTerms,
      startDate,
      expiryDate,
      stage,
      discountCode: discountCode.trim()
    })

    onNotify?.(`Created ${stage} subscription ${sub.id} for ₹${sub.recurringTotal.toLocaleString('en-IN')}`)
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
        style={{ width: 'min(760px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-heading">
          <div>
            <div className="eyebrow">Sales & Subscription Onboarding</div>
            <h2>Create Quotation / Subscription</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quotation Template Selector */}
          <div style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ fontSize: '12.5px', color: 'var(--ink)' }}>Start from Quotation Template:</strong>
              <div style={{ fontSize: '11px', color: 'var(--ink-tertiary)' }}>Accelerate drafting with pre-packaged product lines and pricing</div>
            </div>
            <select
              value={template}
              onChange={e => handleTemplateChange(e.target.value)}
              style={{
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 10px',
                fontSize: '12px',
                background: 'var(--surface)',
                color: 'var(--ink)'
              }}
            >
              <option value="custom">Blank / Custom Lines</option>
              <option value="growth-pack">SaaS Growth Starter Pack (15 days validity)</option>
              <option value="enterprise-pack">Enterprise ERP Suite Pack (30 days validity)</option>
            </select>
          </div>

          <div className="form-grid" style={{ marginTop: '16px' }}>
            <label>
              Customer Account
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '12.5px'
                }}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                ))}
              </select>
            </label>

            <label>
              Subscription Plan
              <select
                value={planId}
                onChange={e => setPlanId(e.target.value)}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '12.5px'
                }}
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.billingFrequency}) · ₹{p.price.toLocaleString()}</option>
                ))}
              </select>
            </label>

            <label>
              Payment Terms
              <select
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '12.5px'
                }}
              >
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Due on Receipt">Due Immediately on Receipt</option>
              </select>
            </label>

            <label>
              Initial Workflow Stage
              <select
                value={stage}
                onChange={e => setStage(e.target.value)}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '12.5px'
                }}
              >
                <option value="Draft">Draft (Internal Working Copy)</option>
                <option value="Quotation">Quotation (Dispatched to Client)</option>
                <option value="Confirmed">Confirmed (Accepted by Client)</option>
                <option value="Active">Active (Live Recurring Billing)</option>
              </select>
            </label>

            <label>
              Contract Start Date
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </label>

            <label>
              Expiry / Renewal Date
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                required
              />
            </label>
          </div>

          {/* Product Lines Section */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                Contract Product Lines
              </span>
              <button type="button" className="outline-btn" onClick={addLine} style={{ padding: '4px 10px', fontSize: '11px' }}>
                <Plus size={13} /> Add Line Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lines.map((line, idx) => {
                const prod = products.find(p => p.id === line.productId) || products[0]
                return (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 80px 100px auto', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={line.productId}
                      onChange={e => updateLineProduct(idx, e.target.value)}
                      style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '7px 8px', fontSize: '12px', background: 'var(--surface)' }}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>

                    <select
                      value={line.variantName}
                      onChange={e => updateLineVariant(idx, e.target.value)}
                      style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '7px 8px', fontSize: '12px', background: 'var(--surface)' }}
                    >
                      {prod?.variants?.map(v => (
                        <option key={v.id} value={v.name}>
                          {v.name} {v.priceDelta > 0 ? `(+₹${v.priceDelta})` : ''}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={line.quantity}
                      onChange={e => updateLineQty(idx, e.target.value)}
                      min="1"
                      placeholder="Qty"
                      style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '7px 8px', fontSize: '12px', textAlign: 'center', background: 'var(--surface)' }}
                    />

                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', textAlign: 'right', fontWeight: 600 }}>
                      ₹{(line.unitPrice * line.quantity).toLocaleString()}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      style={{ color: 'var(--ink-tertiary)', padding: '4px' }}
                      title="Remove line"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Discount Code Input */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '0 10px', background: 'var(--surface)', width: '220px' }}>
              <Tag size={14} style={{ color: 'var(--ink-tertiary)' }} />
              <input
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Discount Coupon"
                style={{ border: 'none', outline: 'none', height: '32px', fontSize: '12px', width: '100%', background: 'transparent' }}
              />
            </div>
            <button type="button" className="outline-btn" onClick={handleValidateDiscount}>
              Apply Code
            </button>
            {discountMsg && (
              <span style={{ fontSize: '11px', color: discountMsg.success ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {discountMsg.text}
              </span>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              <Plus size={15} strokeWidth={2.5} />
              Save {stage} Record
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

