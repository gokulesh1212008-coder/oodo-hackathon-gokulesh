import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Zap, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function BillingDayModal({ onClose, onNotify }) {
  const { subscriptions, runBillingCycle } = useSubscriptions()
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const activeDueSubs = subscriptions.filter(s => s.stage === 'Active')

  const handleRunBilling = () => {
    setProcessing(true)
    setTimeout(() => {
      const res = runBillingCycle()
      setProcessing(false)
      setResult(res)
      if (res.count > 0) {
        onNotify?.(`Automated Billing Run Complete: ${res.count} invoices created without human error!`)
      } else {
        onNotify?.('All active subscriptions are already up to date. No duplicate invoices generated.')
      }
    }, 600)
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="modal"
        onMouseDown={e => e.stopPropagation()}
        style={{ width: 'min(580px, 100%)' }}
      >
        <div className="modal-heading">
          <div>
            <div className="eyebrow">Automated Billing Engine</div>
            <h2>Process Monthly Billing Day</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
            Today is billing day. In traditional spreadsheets, typing invoices by hand leads to missed renewals, calculation errors, and double-billing.
          </p>

          <div style={{ padding: '16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', margin: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Active Subscriptions Due for Invoicing:</span>
              <strong style={{ fontSize: '14px', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                {activeDueSubs.length} subscriptions
              </strong>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--ink-tertiary)' }}>
              • Product line items & variant prices imported automatically<br />
              • Taxes calculated according to admin tax rules (GST 18%)<br />
              • Applicable discounts applied automatically<br />
              • <strong>Anti-Double-Billing:</strong> Safeguard prevents duplicate invoices for identical billing windows
            </div>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: result.count > 0 ? 'var(--success-bg)' : 'var(--surface-subtle)',
                border: `1px solid ${result.count > 0 ? 'var(--success-border)' : 'var(--line)'}`,
                color: result.count > 0 ? 'var(--success)' : 'var(--ink-secondary)',
                fontSize: '12.5px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <CheckCircle2 size={18} />
              <div>
                <strong>{result.count > 0 ? `Successfully generated ${result.count} new invoices!` : 'All active subscriptions are already up to date.'}</strong>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  Invoices are now listed in the Invoices register and available on customer portals.
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="modal-footer">
          <button className="outline-btn" onClick={onClose}>
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button className="primary-btn" onClick={handleRunBilling} disabled={processing}>
              <Zap size={15} />
              {processing ? 'Processing Ledger...' : `Run Billing Cycle (${activeDueSubs.length} Due)`}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

