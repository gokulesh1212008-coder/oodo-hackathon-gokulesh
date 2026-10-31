import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CreditCard, Check, AlertCircle } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function RecordPaymentModal({ targetInvoice, onClose, onNotify }) {
  const { invoices, recordPayment } = useSubscriptions()

  // Invoices eligible for payment (balanceDue > 0 or not Paid)
  const unpaidInvoices = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled')
  const defaultInv = targetInvoice || unpaidInvoices[0] || invoices[0]

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(defaultInv?.id || '')
  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId)

  const balance = selectedInvoice ? (selectedInvoice.balanceDue ?? (selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0))) : 0

  const [method, setMethod] = useState('UPI')
  const [amount, setAmount] = useState(balance || 0)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  // When invoice selection changes, update suggested amount
  const handleInvoiceChange = (id) => {
    setSelectedInvoiceId(id)
    const inv = invoices.find(i => i.id === id)
    if (inv) {
      const bal = inv.balanceDue ?? (inv.totalAmount - (inv.paidAmount || 0))
      setAmount(bal)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!selectedInvoiceId) {
      setError('Please select an invoice to apply payment against.')
      return
    }

    const payNum = Number(amount)
    if (isNaN(payNum) || payNum <= 0) {
      setError('Please enter a valid payment amount greater than ₹0.')
      return
    }

    const res = recordPayment({
      invoiceId: selectedInvoiceId,
      method,
      amount: payNum,
      date,
      reference: reference || `REF/${Date.now().toString().slice(-8)}`,
      note: note || `Payment applied on ${selectedInvoice?.invoiceNumber}`
    })

    if (res.success) {
      onNotify?.(`Payment of ₹${payNum.toLocaleString('en-IN')} recorded on ${selectedInvoice?.invoiceNumber}. Status is now ${res.newStatus}.`)
      onClose()
    } else {
      setError(res.error || 'Failed to record payment.')
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="modal"
        onMouseDown={e => e.stopPropagation()}
        style={{ width: 'min(540px, 100%)' }}
      >
        <div className="modal-heading">
          <div>
            <div className="eyebrow">Cash Settlement Ledger</div>
            <h2>Record Customer Payment</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginTop: '20px' }}>
            <label className="wide">
              Target Invoice to Reconcile
              <select
                value={selectedInvoiceId}
                onChange={e => handleInvoiceChange(e.target.value)}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '12.5px'
                }}
              >
                {invoices.map(inv => {
                  const bal = inv.balanceDue ?? (inv.totalAmount - (inv.paidAmount || 0))
                  return (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.customerName} ({inv.customerCompany}) · Balance: ₹{bal.toLocaleString('en-IN')} [{inv.status}]
                    </option>
                  )
                })}
              </select>
            </label>

            <label>
              Payment Method
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '12.5px'
                }}
              >
                <option value="UPI">UPI (Google Pay / PhonePe)</option>
                <option value="Credit card">Credit / Debit Card</option>
                <option value="Bank transfer">NEFT / RTGS Bank Transfer</option>
                <option value="Cheque">Corporate Cheque</option>
                <option value="Cash">Cash Settlement</option>
              </select>
            </label>

            <label>
              Amount to Collect (₹)
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="₹ Amount"
                required
              />
            </label>

            <label>
              Settlement Date
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </label>

            <label>
              Transaction Reference / UTR
              <input
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="e.g. UTR-982138120"
              />
            </label>

            <label className="wide">
              Internal Reconcile Note
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Bank statement match details or notes..."
                rows={2}
              />
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              <Check size={15} strokeWidth={2.5} />
              Confirm & Post Payment
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

