import React from 'react'
import { Package, Plus, Sparkles, Tag, Check } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function ProductsPage({ onNewProduct, onNotify }) {
  const { products } = useSubscriptions()

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Product & Offering Architecture</div>
          <h1>Products & Variant Catalog</h1>
          <p>
            Configure software packages, add-ons, and professional services with multi-attribute variants and price adjustments.
          </p>
        </div>
        <button className="primary-btn" onClick={onNewProduct}>
          <Plus size={16} strokeWidth={2.5} />
          Launch New Product & Variants
        </button>
      </div>

      <div className="summary-strip">
        <div>
          <span>Catalog Offerings</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Software Licenses</span>
          <strong>{products.filter(p => p.type === 'Software').length}</strong>
        </div>
        <div>
          <span>Add-on Modules</span>
          <strong>{products.filter(p => p.type === 'Add-on').length}</strong>
        </div>
        <div>
          <span>Active in Subscriptions</span>
          <strong className="green-text">100%</strong>
        </div>
      </div>

      <section className="card full-table-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h2>Product Catalog</h2>
            <span className="count-pill">{products.length} active offerings</span>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Type</th>
                <th>Base Sales Price</th>
                <th>Cost Price</th>
                <th>Configured Variants & Price Modifiers</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id}>
                  <td>
                    <strong>{prod.name}</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)', maxWidth: '300px' }}>
                      {prod.notes}
                    </span>
                  </td>
                  <td>
                    <span className="plan-chip">{prod.type}</span>
                  </td>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      ₹{prod.salesPrice.toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)' }}>
                      ₹{prod.costPrice.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {prod.variants && prod.variants.length > 0 ? (
                        prod.variants.map((v, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '11.5px',
                              background: v.name.includes('Odoo') ? 'var(--primary-subtle)' : 'var(--surface-subtle)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: `1px solid ${v.name.includes('Odoo') ? 'var(--primary-border)' : 'var(--line)'}`,
                              color: v.name.includes('Odoo') ? 'var(--primary)' : 'var(--ink-secondary)'
                            }}
                          >
                            <span>{v.name}</span>
                            <strong style={{ fontFamily: 'var(--font-mono)' }}>
                              {v.priceDelta > 0 ? `(+₹${v.priceDelta})` : '(Base)'}
                            </strong>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--ink-tertiary)' }}>Standard Edition only</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status ${prod.status.toLowerCase()}`}>
                      <i /> {prod.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

