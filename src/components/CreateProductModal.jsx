import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Trash2, Package } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function CreateProductModal({ onClose, onNotify }) {
  const { addProduct } = useSubscriptions()

  const [name, setName] = useState('')
  const [type, setType] = useState('Software')
  const [salesPrice, setSalesPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [variants, setVariants] = useState([
    { id: '1', name: 'Standard Edition', priceDelta: 0 },
    { id: '2', name: 'Odoo Brand Edition', priceDelta: 560 } // Pre-seeded with the exact example from the prompt!
  ])

  const addVariantRow = () => {
    setVariants(prev => [
      ...prev,
      { id: String(Date.now()), name: '', priceDelta: 0 }
    ])
  }

  const updateVariant = (id, field, value) => {
    setVariants(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          [field]: field === 'priceDelta' ? Number(value) || 0 : value
        }
      }
      return v
    }))
  }

  const removeVariant = (id) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter(v => v.id !== id))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const product = addProduct({
      name: name.trim(),
      type,
      salesPrice: Number(salesPrice) || 0,
      costPrice: Number(costPrice) || 0,
      notes: notes.trim(),
      variants: variants.filter(v => v.name.trim().length > 0)
    })

    onNotify?.(`Product "${product.name}" created with ${product.variants.length} variants!`)
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
            <div className="eyebrow">Catalog Architecture</div>
            <h2>Launch New Product & Variants</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginTop: '20px' }}>
            <label className="wide">
              Product Name
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Brightloop Accounting Suite"
                required
                autoFocus
              />
            </label>

            <label>
              Product Type
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
                <option value="Software">Software (Recurring License)</option>
                <option value="Add-on">Add-on (Optional Toggle)</option>
                <option value="Service">Professional Service / SLA</option>
              </select>
            </label>

            <label>
              Base Sales Price (₹)
              <input
                type="number"
                value={salesPrice}
                onChange={e => setSalesPrice(e.target.value)}
                placeholder="2000"
                required
              />
            </label>

            <label>
              Unit Cost Price (₹)
              <input
                type="number"
                value={costPrice}
                onChange={e => setCostPrice(e.target.value)}
                placeholder="600"
              />
            </label>

            <label className="wide">
              Internal Product Notes
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Deployment architecture, entitlement limits or fulfillment caveats..."
                rows={2}
              />
            </label>
          </div>

          {/* Variants Configuration Section */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  Product Variants & Price Modifiers
                </span>
                <p style={{ fontSize: '11px', color: 'var(--ink-tertiary)', margin: '2px 0 0' }}>
                  Define variants (e.g. Brand edition, deployment type). Adjustments add to base sales price.
                </p>
              </div>
              <button type="button" className="outline-btn" onClick={addVariantRow} style={{ padding: '4px 10px', fontSize: '11px' }}>
                <Plus size={13} /> Add Variant
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {variants.map((v, i) => (
                <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                  <input
                    value={v.name}
                    onChange={e => updateVariant(v.id, 'name', e.target.value)}
                    placeholder="Variant name (e.g. Odoo Brand)"
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 10px',
                      fontSize: '12px',
                      background: 'var(--surface)',
                      color: 'var(--ink)'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ink-tertiary)', fontFamily: 'var(--font-mono)' }}>+₹</span>
                    <input
                      type="number"
                      value={v.priceDelta}
                      onChange={e => updateVariant(v.id, 'priceDelta', e.target.value)}
                      placeholder="560"
                      style={{
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 10px',
                        fontSize: '12px',
                        width: '100%',
                        background: 'var(--surface)',
                        color: 'var(--ink)'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(v.id)}
                    style={{ color: 'var(--ink-tertiary)', padding: '6px' }}
                    title="Remove variant"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              <Plus size={15} strokeWidth={2.5} />
              Save Product & Variants
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

