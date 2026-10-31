import React from 'react'
import { motion } from 'framer-motion'
import { X, Printer, Send, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'

export default function InvoiceViewModal({ invoice, onClose, onRecordPayment, onNotify }) {
  if (!invoice) return null

  const isPaid = invoice.status === 'Paid'
  const isOverdue = invoice.status === 'Overdue'

  const handlePrint = () => {
    window.print()
  }

  const handleSend = () => {
    onNotify?.(`Invoice ${invoice.invoiceNumber} dispatched to ${invoice.customerEmail}`)
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="modal invoice-modal"
        onMouseDown={e => e.stopPropagation()}
        style={{ width: 'min(760px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header Toolbar */}
        <div className="invoice-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div className="eyebrow">Tax Invoice Document</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{invoice.invoiceNumber}</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="outline-btn" onClick={handlePrint} title="Print Invoice">
              <Printer size={15} /> Print
            </button>
            <button className="outline-btn" onClick={handleSend} title="Resend to Customer">
              <Send size={15} /> Send
            </button>
            {!isPaid && (
              <button
                className="primary-btn"
                onClick={() => {
                  onClose()
                  onRecordPayment(invoice)
                }}
              >
                <CreditCard size={15} /> Record payment
              </button>
            )}
            <button className="close-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="invoice-sheet" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '28px', color: 'var(--ink)' }}>
          {/* Top Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', marginBottom: '28px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--primary)' }}>
                Brightloop Technologies Pvt. Ltd.
              </div>
              <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                12th Floor, Orion Tower, Residency Road<br />
                Bengaluru, Karnataka 560025, India<br />
                GSTIN: 29AABCB1234C1Z5 · billing@brightloop.in
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`status ${invoice.status.toLowerCase()}`} style={{ fontSize: '12px', padding: '5px 12px' }}>
                <i /> {invoice.status}
              </span>
              <div style={{ fontSize: '12px', color: 'var(--ink-tertiary)', marginTop: '8px' }}>
                Issued: <strong>{invoice.issueDate}</strong>
              </div>
              <div style={{ fontSize: '12px', color: isOverdue ? 'var(--danger)' : 'var(--ink-tertiary)' }}>
                Due Date: <strong>{invoice.dueDate}</strong>
              </div>
            </div>
          </div>

          {/* Billed To & Terms */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', padding: '16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--line)' }}>
            <div>
              <span style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-tertiary)', fontWeight: 700 }}>
                Billed To
              </span>
              <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>{invoice.customerName}</div>
              <div style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>{invoice.customerCompany}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--ink-tertiary)', marginTop: '4px' }}>
                {invoice.customerAddress || 'Registered Office'}<br />
                GSTIN: {invoice.customerTaxId || 'Unregistered'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-tertiary)', fontWeight: 700 }}>
                Contract Details
              </span>
              <div style={{ fontSize: '12px', marginTop: '6px' }}>
                Subscription: <strong style={{ fontFamily: 'var(--font-mono)' }}>{invoice.subscriptionId}</strong>
              </div>
              <div style={{ fontSize: '12px', marginTop: '3px' }}>
                Billing Period: <strong>{invoice.billingPeriod}</strong>
              </div>
              <div style={{ fontSize: '12px', marginTop: '3px' }}>
                Payment Terms: <strong>{invoice.paymentTerms}</strong>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Description</th>
                <th style={{ textAlign: 'center', width: '70px' }}>Qty</th>
                <th style={{ textAlign: 'right', width: '110px' }}>Unit Rate</th>
                <th style={{ textAlign: 'right', width: '110px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line, i) => (
                <tr key={i}>
                  <td>
                    <strong>{line.item}</strong>
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{line.qty}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    ₹{Number(line.rate).toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    ₹{Number(line.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
            <div style={{ width: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--ink-secondary)' }}>
                <span>Subtotal</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{invoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--ink-secondary)' }}>
                <span>Tax (GST 18%)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, padding: '10px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--ink)' }}>
                <span>Total Invoice</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px', color: 'var(--success)' }}>
                <span>Paid to Date</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>- ₹{(invoice.paidAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, marginTop: '6px', color: invoice.balanceDue > 0 ? 'var(--danger)' : 'var(--success)' }}>
                <span>Balance Due</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(invoice.balanceDue ?? (invoice.totalAmount - (invoice.paidAmount || 0))).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          {invoice.auditLog && invoice.auditLog.length > 0 && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--line-subtle)' }}>
              <span style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-tertiary)', fontWeight: 700 }}>
                Audit & Settlement Log
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', fontSize: '11px', color: 'var(--ink-secondary)' }}>
                {invoice.auditLog.map((log, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>• {log.action}</span>
                    <span style={{ color: 'var(--ink-tertiary)', fontFamily: 'var(--font-mono)' }}>{log.timestamp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

