import React from 'react'
import { motion } from 'framer-motion'
import { X, Check, ArrowRight, Play, Pause, Ban, FileText, Calendar, Building2, User } from 'lucide-react'

const STAGES = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed']

export default function SubscriptionDetailModal({ subscription, onClose, onAdvanceStage, onGenerateInvoice, onNotify }) {
  if (!subscription) return null

  const currentStageIndex = STAGES.indexOf(subscription.stage)

  const handleStageChange = (newStage) => {
    onAdvanceStage(subscription.id, newStage)
    onNotify?.(`Subscription ${subscription.id} transitioned to stage: ${newStage}`)
  }

  const handlePauseToggle = () => {
    const next = subscription.stage === 'Paused' ? 'Active' : 'Paused'
    onAdvanceStage(subscription.id, next)
    onNotify?.(`Subscription ${subscription.id} is now ${next}`)
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="modal sub-detail-modal"
        onMouseDown={e => e.stopPropagation()}
        style={{ width: 'min(780px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div className="eyebrow">Subscription Lifecycle Record</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{subscription.id}</h2>
              <span className={`status ${subscription.stage.toLowerCase()}`}>
                <i /> {subscription.stage}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Stage Progress Stepper */}
        <div style={{ marginBottom: '24px', padding: '16px 20px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-tertiary)', fontWeight: 700, marginBottom: '12px' }}>
            Lifecycle Progression
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {STAGES.map((stg, idx) => {
              const isPassed = currentStageIndex >= idx
              const isCurrent = subscription.stage === stg
              return (
                <div key={stg} style={{ display: 'flex', alignItems: 'center', flex: idx < STAGES.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isCurrent ? 'var(--primary)' : isPassed ? 'var(--success)' : 'var(--surface)',
                        color: isCurrent || isPassed ? '#ffffff' : 'var(--ink-tertiary)',
                        border: isPassed || isCurrent ? 'none' : '1px solid var(--line-strong)',
                        boxShadow: isCurrent ? '0 0 0 4px var(--primary-subtle)' : 'none'
                      }}
                    >
                      {isPassed && !isCurrent ? <Check size={14} strokeWidth={3} /> : idx + 1}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--ink)' : 'var(--ink-secondary)', marginTop: '6px' }}>
                      {stg}
                    </span>
                  </div>
                  {idx < STAGES.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: '2px',
                        backgroundColor: currentStageIndex > idx ? 'var(--success)' : 'var(--line)',
                        margin: '0 8px',
                        position: 'relative',
                        top: '-10px'
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Controls for Staff/Admin */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--line-subtle)' }}>
          {subscription.stage === 'Draft' && (
            <button className="primary-btn" onClick={() => handleStageChange('Quotation')}>
              <ArrowRight size={14} /> Send as Quotation
            </button>
          )}
          {subscription.stage === 'Quotation' && (
            <button className="primary-btn" onClick={() => handleStageChange('Confirmed')}>
              <Check size={14} /> Client Confirmed Quote
            </button>
          )}
          {subscription.stage === 'Confirmed' && (
            <button className="primary-btn" onClick={() => handleStageChange('Active')}>
              <Play size={14} /> Activate Subscription
            </button>
          )}
          {subscription.stage === 'Active' && (
            <>
              <button
                className="primary-btn"
                onClick={() => {
                  onGenerateInvoice(subscription.id)
                  onNotify?.(`Invoice drafted for ${subscription.id}`)
                }}
              >
                <FileText size={14} /> Create Invoice Now
              </button>
              <button className="outline-btn" onClick={handlePauseToggle}>
                <Pause size={14} /> Pause Subscription
              </button>
              <button className="outline-btn" onClick={() => handleStageChange('Closed')}>
                <Ban size={14} /> Close Early
              </button>
            </>
          )}
          {subscription.stage === 'Paused' && (
            <button className="primary-btn" onClick={handlePauseToggle}>
              <Play size={14} /> Resume Subscription
            </button>
          )}
          {subscription.stage === 'Closed' && (
            <button className="outline-btn" onClick={() => handleStageChange('Active')}>
              <Play size={14} /> Reopen Subscription
            </button>
          )}
        </div>

        {/* Customer & Contract Attributes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--ink-tertiary)', fontWeight: 700 }}>
              Subscriber
            </span>
            <strong style={{ display: 'block', fontSize: '13px', marginTop: '4px' }}>{subscription.customerName}</strong>
            <small style={{ color: 'var(--ink-secondary)', display: 'block' }}>{subscription.customerCompany}</small>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--ink-tertiary)', fontWeight: 700 }}>
              Plan & Cadence
            </span>
            <strong style={{ display: 'block', fontSize: '13px', marginTop: '4px' }}>{subscription.planName}</strong>
            <small style={{ color: 'var(--ink-secondary)', display: 'block' }}>Billed {subscription.billingFrequency} · {subscription.paymentTerms}</small>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--ink-tertiary)', fontWeight: 700 }}>
              Validity Dates
            </span>
            <strong style={{ display: 'block', fontSize: '13px', marginTop: '4px' }}>{subscription.startDate}</strong>
            <small style={{ color: 'var(--ink-secondary)', display: 'block' }}>Expires: {subscription.expiryDate}</small>
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-tertiary)', fontWeight: 700, marginBottom: '8px' }}>
            Subscription Lines & Products
          </div>
          <div className="table-scroll" style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Product & Variant</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Rate</th>
                  <th style={{ textAlign: 'center' }}>Tax</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {subscription.lines.map((line, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{line.productName}</strong>
                      {line.variantName && (
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--primary)' }}>
                          Variant: {line.variantName} {line.priceDelta > 0 ? `(+₹${line.priceDelta})` : ''}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{line.quantity}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      ₹{line.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                      {line.taxRate || 18}%
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      ₹{line.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
          <div style={{ width: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--ink-secondary)' }}>
              <span>Recurring Subtotal</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{subscription.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {subscription.discountCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--primary)' }}>
                <span>Discount ({subscription.discountCode})</span>
                <span>Applied</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--ink-secondary)' }}>
              <span>Estimated Tax (18% GST)</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{subscription.taxTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, paddingTop: '8px', borderTop: '1px solid var(--line)', color: 'var(--ink)' }}>
              <span>Cycle Total</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{subscription.recurringTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

