import React, { useState } from 'react'
import {
  FileText, Zap, Search, Filter, Printer, CreditCard, ArrowUpRight, AlertTriangle
} from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function InvoicesPage({ onOpenInvoice, onRecordPayment, onRunBilling, onNotify }) {
  const { invoices } = useSubscriptions()
  const [filterStatus, setFilterStatus] = useState('All')
  const [query, setQuery] = useState('')

  const statuses = ['All', 'Paid', 'Pending', 'Overdue', 'Confirmed', 'Draft']

  const filtered = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'All' || inv.status === filterStatus
    const searchString = `${inv.invoiceNumber} ${inv.customerName} ${inv.customerCompany} ${inv.subscriptionId}`.toLowerCase()
    const matchesQuery = searchString.includes(query.toLowerCase())
    return matchesStatus && matchesQuery
  })

  const overdueCount = invoices.filter(i => i.status === 'Overdue').length
  const totalReceivables = invoices
    .filter(i => i.status !== 'Paid' && i.status !== 'Cancelled')
    .reduce((acc, i) => acc + (i.balanceDue ?? (i.totalAmount - (i.paidAmount || 0))), 0)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Accounts Receivable & Billing Engine</div>
          <h1>Invoices & Billing Register</h1>
          <p>
            Automated billing invoices generated from active subscriptions with real-time tax computation and payment matching.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="primary-btn" onClick={onRunBilling}>
            <Zap size={16} strokeWidth={2.5} />
            Run Billing Cycle (Billing Day)
          </button>
        </div>
      </div>

      {/* Overdue Alert Banner if invoices are overdue */}
      {overdueCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-lg)', color: 'var(--danger)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} />
            <div>
              <strong style={{ fontSize: '13px' }}>Attention: {overdueCount} invoice(s) are past their due date</strong>
              <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)' }}>
                Follow up with client finance teams immediately to prevent cash flow drag and service pause.
              </div>
            </div>
          </div>
          <button
            className="outline-btn"
            style={{ borderColor: 'var(--danger-border)', color: 'var(--danger)', background: 'var(--surface)' }}
            onClick={() => setFilterStatus('Overdue')}
          >
            Filter Overdue Only
          </button>
        </div>
      )}

      {/* Summary Strip */}
      <div className="summary-strip">
        <div>
          <span>Total Invoices</span>
          <strong>{invoices.length}</strong>
        </div>
        <div>
          <span>Paid & Reconciled</span>
          <strong className="green-text">{invoices.filter(i => i.status === 'Paid').length}</strong>
        </div>
        <div>
          <span>Pending Settlement</span>
          <strong>{invoices.filter(i => i.status === 'Pending').length}</strong>
        </div>
        <div>
          <span>Total Outstanding Owed</span>
          <strong style={{ color: totalReceivables > 0 ? 'var(--danger)' : 'var(--success)' }}>
            ₹{totalReceivables.toLocaleString('en-IN')}
          </strong>
        </div>
      </div>

      <section className="card full-table-card">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={filterStatus === st ? 'current' : 'outline-btn'}
                style={{
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  borderRadius: 'var(--radius-md)',
                  background: filterStatus === st ? 'var(--primary)' : 'var(--surface)',
                  color: filterStatus === st ? '#ffffff' : 'var(--ink-secondary)',
                  border: `1px solid ${filterStatus === st ? 'var(--primary)' : 'var(--line)'}`
                }}
              >
                {st} ({st === 'All' ? invoices.length : invoices.filter(i => i.status === st).length})
              </button>
            ))}
          </div>

          <div className="toolbar-actions">
            <div className="small-search">
              <Search size={14} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search invoices, clients..."
              />
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client / Organization</th>
                <th>Issued Date</th>
                <th>Due Date</th>
                <th>Invoice Total</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const bal = inv.balanceDue ?? (inv.totalAmount - (inv.paidAmount || 0))
                const isOverdue = inv.status === 'Overdue'
                return (
                  <tr
                    key={inv.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onOpenInvoice(inv)}
                  >
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{inv.invoiceNumber}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                        {inv.subscriptionId}
                      </span>
                    </td>
                    <td>
                      <strong>{inv.customerName}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                        {inv.customerCompany}
                      </span>
                    </td>
                    <td>
                      <span>{inv.issueDate}</span>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                        {inv.paymentTerms}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: isOverdue ? 'var(--danger)' : 'inherit', fontWeight: isOverdue ? 700 : 400 }}>
                        {inv.dueDate}
                      </span>
                      {isOverdue && (
                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--danger)', fontWeight: 600 }}>
                          Past due!
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>
                        ₹{inv.totalAmount.toLocaleString('en-IN')}
                      </strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                        Incl. 18% GST
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: bal > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        ₹{bal.toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <span className={`status ${inv.status.toLowerCase()}`}>
                        <i /> {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="outline-btn"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenInvoice(inv)
                          }}
                        >
                          View / Print
                        </button>
                        {inv.status !== 'Paid' && (
                          <button
                            className="primary-btn"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              onRecordPayment(inv)
                            }}
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>Showing {filtered.length} of {invoices.length} invoices</span>
          <div>
            <button className="current">1</button>
          </div>
        </div>
      </section>
    </>
  )
}

