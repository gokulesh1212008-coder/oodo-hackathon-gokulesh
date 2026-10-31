import React from 'react'
import { Zap, Plus, Check, X, Calendar, Clock } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function PlansPage({ onNewPlan, onNotify }) {
  const { plans, subscriptions } = useSubscriptions()

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Recurring Revenue Architecture</div>
          <h1>Subscription Plans</h1>
          <p>
            Shape flexible pricing cadences, volume tiers, and plan-by-plan lifecycle governance (auto-close, early closure, pause/resume).
          </p>
        </div>
        <button className="primary-btn" onClick={onNewPlan}>
          <Plus size={16} strokeWidth={2.5} />
          Configure New Plan
        </button>
      </div>

      <div className="summary-strip">
        <div>
          <span>Configured Plans</span>
          <strong>{plans.length}</strong>
        </div>
        <div>
          <span>Monthly Cadence</span>
          <strong>{plans.filter(p => p.billingFrequency === 'Monthly').length}</strong>
        </div>
        <div>
          <span>Annual Cadence</span>
          <strong>{plans.filter(p => p.billingFrequency === 'Yearly').length}</strong>
        </div>
        <div>
          <span>Active Subscribers</span>
          <strong className="green-text">
            {subscriptions.filter(s => s.stage === 'Active').length}
          </strong>
        </div>
      </div>

      <section className="card full-table-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h2>Active Plan Tiers</h2>
            <span className="count-pill">{plans.length} tiers</span>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Billing Cadence</th>
                <th>Recurring Price</th>
                <th>Min Seats / Qty</th>
                <th>Lifecycle Governance Policies</th>
                <th>Subscribers</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => {
                const subCount = subscriptions.filter(s => s.planId === plan.id && s.stage === 'Active').length
                return (
                  <tr key={plan.id}>
                    <td>
                      <strong>{plan.name}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)', maxWidth: '280px' }}>
                        {plan.description}
                      </span>
                    </td>
                    <td>
                      <span className="plan-chip">{plan.billingFrequency}</span>
                    </td>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>
                        ₹{plan.price.toLocaleString('en-IN')}
                      </strong>
                      <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--ink-tertiary)' }}>
                        per {plan.billingFrequency.toLowerCase().replace('ly', '')}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {plan.minQuantity} seat(s)
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' }}>
                        <span style={{ color: plan.autoCloseOnEnd ? 'var(--warning)' : 'var(--ink-secondary)' }}>
                          • Auto-close on end: {plan.autoCloseOnEnd ? 'Enabled' : 'No (Continuous)'}
                        </span>
                        <span style={{ color: plan.allowPause ? 'var(--success)' : 'var(--ink-tertiary)' }}>
                          • Pause / Resume: {plan.allowPause ? 'Allowed' : 'Disabled'}
                        </span>
                        <span style={{ color: plan.autoRenew ? 'var(--primary)' : 'var(--ink-tertiary)' }}>
                          • Auto-Renew: {plan.autoRenew ? 'Active by default' : 'Manual renewal'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{subCount}</strong> active
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

