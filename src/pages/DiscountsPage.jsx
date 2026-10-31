import React from 'react'
import { Tag, Plus, ShieldCheck, ShieldAlert, CheckCircle2, Clock } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function DiscountsPage({ onNewDiscount, onNotify }) {
  const { discounts, currentUser } = useSubscriptions()
  const isAdmin = currentUser.role === 'admin'

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> Admin Price Control & Margin Protection
          </div>
          <h1>Discounts & Promotional Rules</h1>
          <p>
            Create automated coupon rules with strict quantity minimums, expiry gates, and usage limits. Automatically applied to invoices without manual intervention.
          </p>
        </div>
        <div>
          {isAdmin ? (
            <button className="primary-btn" onClick={onNewDiscount}>
              <Plus size={16} strokeWidth={2.5} />
              Create Discount Rule
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--ink-tertiary)', background: 'var(--surface-subtle)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
              <ShieldAlert size={14} /> Admin Access Required to Add Discounts
            </div>
          )}
        </div>
      </div>

      <div className="summary-strip">
        <div>
          <span>Configured Rules</span>
          <strong>{discounts.length}</strong>
        </div>
        <div>
          <span>Active Coupons</span>
          <strong className="green-text">{discounts.filter(d => d.status === 'Active').length}</strong>
        </div>
        <div>
          <span>Total Redemptions</span>
          <strong>{discounts.reduce((acc, d) => acc + d.usedCount, 0)}</strong>
        </div>
        <div>
          <span>Expired / Depleted</span>
          <strong style={{ color: 'var(--danger)' }}>{discounts.filter(d => d.status === 'Expired').length}</strong>
        </div>
      </div>

      <section className="card full-table-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h2>Active Promotion Ledger</h2>
            <span className="count-pill">{discounts.length} promotional rules</span>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Benefit</th>
                <th>Minimum Purchase Requirement</th>
                <th>Validity Window</th>
                <th>Usage / Redemption Quota</th>
                <th>Rule Status</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map(disc => {
                const isExpired = disc.status === 'Expired' || disc.usedCount >= disc.maxUsage
                return (
                  <tr key={disc.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{disc.code}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                        {disc.description}
                      </span>
                    </td>
                    <td>
                      <span className="plan-chip">
                        {disc.type === 'percentage' ? `${disc.value}% off` : `₹${disc.value.toLocaleString()} off`}
                      </span>
                      <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--ink-tertiary)', marginTop: '2px' }}>
                        Scope: {disc.scope === 'all' ? 'Entire invoice' : 'Specific product line'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px' }}>Min spend: <strong>₹{disc.minAmount.toLocaleString('en-IN')}</strong></span>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                        Min items / seats: {disc.minQuantity}
                      </span>
                    </td>
                    <td>
                      <span>{disc.startDate} → {disc.endDate}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', width: '80px', background: 'var(--surface-subtle)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                          <div
                            style={{
                              width: `${Math.min(100, (disc.usedCount / disc.maxUsage) * 100)}%`,
                              height: '100%',
                              backgroundColor: isExpired ? 'var(--danger)' : 'var(--primary)'
                            }}
                          />
                        </div>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {disc.usedCount} / {disc.maxUsage}
                        </strong>
                      </div>
                      {disc.usedCount >= disc.maxUsage && (
                        <span style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: 600 }}>
                          Quota depleted!
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status ${isExpired ? 'expired' : 'active'}`}>
                        <i /> {isExpired ? 'Expired' : 'Active'}
                      </span>
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

