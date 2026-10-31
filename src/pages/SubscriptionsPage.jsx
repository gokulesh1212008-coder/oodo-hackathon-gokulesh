import React, { useState } from 'react'
import {
  FileCheck2, Plus, Search, Filter, ArrowUpRight, Play, Pause, MoreHorizontal
} from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function SubscriptionsPage({ onOpenSubscription, onNewSubscription, onNotify }) {
  const { subscriptions } = useSubscriptions()
  const [filterStage, setFilterStage] = useState('All')
  const [query, setQuery] = useState('')

  const stages = ['All', 'Active', 'Quotation', 'Confirmed', 'Paused', 'Closed']

  const filtered = subscriptions.filter(sub => {
    const matchesStage = filterStage === 'All' || sub.stage === filterStage
    const searchString = `${sub.id} ${sub.customerName} ${sub.customerCompany} ${sub.planName}`.toLowerCase()
    const matchesQuery = searchString.includes(query.toLowerCase())
    return matchesStage && matchesQuery
  })

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Recurring Revenue Contracts</div>
          <h1>Subscriptions & Quotations</h1>
          <p>
            Manage the entire recurring contract lifecycle from initial sales quote through confirmation, active billing, and renewal.
          </p>
        </div>
        <button className="primary-btn" onClick={onNewSubscription}>
          <Plus size={16} strokeWidth={2.5} />
          New Quotation / Subscription
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="summary-strip">
        <div>
          <span>Total Contracts</span>
          <strong>{subscriptions.length}</strong>
        </div>
        <div>
          <span>Active Billing</span>
          <strong className="green-text">{subscriptions.filter(s => s.stage === 'Active').length}</strong>
        </div>
        <div>
          <span>In Quotation</span>
          <strong>{subscriptions.filter(s => s.stage === 'Quotation').length}</strong>
        </div>
        <div>
          <span>Paused Contracts</span>
          <strong style={{ color: 'var(--warning)' }}>{subscriptions.filter(s => s.stage === 'Paused').length}</strong>
        </div>
      </div>

      <section className="card full-table-card">
        {/* Toolbar & Filters */}
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {stages.map(stg => (
              <button
                key={stg}
                onClick={() => setFilterStage(stg)}
                className={filterStage === stg ? 'current' : 'outline-btn'}
                style={{
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  borderRadius: 'var(--radius-md)',
                  background: filterStage === stg ? 'var(--primary)' : 'var(--surface)',
                  color: filterStage === stg ? '#ffffff' : 'var(--ink-secondary)',
                  border: `1px solid ${filterStage === stg ? 'var(--primary)' : 'var(--line)'}`
                }}
              >
                {stg} ({stg === 'All' ? subscriptions.length : subscriptions.filter(s => s.stage === stg).length})
              </button>
            ))}
          </div>

          <div className="toolbar-actions">
            <div className="small-search">
              <Search size={14} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search subscriptions..."
              />
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Subscription ID</th>
                <th>Customer / Account</th>
                <th>Plan Tier</th>
                <th>Billing Terms</th>
                <th>Next Billing Date</th>
                <th>Recurring Amount</th>
                <th>Lifecycle Stage</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sub => (
                <tr
                  key={sub.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onOpenSubscription(sub)}
                >
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{sub.id}</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                      Started {sub.startDate}
                    </span>
                  </td>
                  <td>
                    <strong>{sub.customerName}</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                      {sub.customerCompany}
                    </span>
                  </td>
                  <td>
                    <span className="plan-chip">{sub.planName}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px' }}>{sub.billingFrequency}</span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                      {sub.paymentTerms}
                    </span>
                  </td>
                  <td>
                    <strong>{sub.nextBillingDate || 'Pending'}</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                      Expires: {sub.expiryDate}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      ₹{sub.recurringTotal.toLocaleString('en-IN')}
                    </strong>
                    {sub.discountCode && (
                      <span style={{ display: 'block', fontSize: '10px', color: 'var(--primary)', fontWeight: 600 }}>
                        {sub.discountCode} applied
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status ${sub.stage.toLowerCase()}`}>
                      <i /> {sub.stage}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="link-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenSubscription(sub)
                      }}
                    >
                      Inspect <ArrowUpRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>Showing {filtered.length} of {subscriptions.length} subscriptions</span>
          <div>
            <button className="current">1</button>
          </div>
        </div>
      </section>
    </>
  )
}

