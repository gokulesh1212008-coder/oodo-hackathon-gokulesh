import React, { useState } from 'react'
import { CreditCard, Plus, Search, Filter, Download } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function PaymentsPage({ onRecordPayment, onNotify }) {
  const { payments, totalCollected } = useSubscriptions()
  const [query, setQuery] = useState('')

  const filtered = payments.filter(p => {
    const str = `${p.id} ${p.invoiceNumber} ${p.customerName} ${p.company} ${p.method} ${p.reference}`.toLowerCase()
    return str.includes(query.toLowerCase())
  })

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Cash Settlement & Bank Matching</div>
          <h1>Payments & Collections Ledger</h1>
          <p>
            Reconcile inbound customer cash collections across bank wires, corporate cards, and instant UPI transfers against target invoices.
          </p>
        </div>
        <button className="primary-btn" onClick={() => onRecordPayment(null)}>
          <Plus size={16} strokeWidth={2.5} />
          Record Customer Payment
        </button>
      </div>

      <div className="summary-strip">
        <div>
          <span>Total Recorded Payments</span>
          <strong>{payments.length}</strong>
        </div>
        <div>
          <span>Total Collections Settled</span>
          <strong className="green-text">₹{totalCollected.toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span>UPI Collections</span>
          <strong>{payments.filter(p => p.method === 'UPI').length}</strong>
        </div>
        <div>
          <span>Bank Wire / Cards</span>
          <strong>{payments.filter(p => p.method !== 'UPI').length}</strong>
        </div>
      </div>

      <section className="card full-table-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h2>Payment Transactions</h2>
            <span className="count-pill">{payments.length} transactions</span>
          </div>

          <div className="toolbar-actions">
            <div className="small-search">
              <Search size={14} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search UTR, invoice, client..."
              />
            </div>
            <button className="outline-btn" onClick={() => onNotify?.('Exported payments ledger as CSV')}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Target Invoice</th>
                <th>Customer / Account</th>
                <th>Payment Method</th>
                <th>Settlement Date</th>
                <th>Transaction Reference / UTR</th>
                <th>Amount Collected</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{p.id}</strong>
                  </td>
                  <td>
                    <span className="muted" style={{ fontWeight: 600 }}>{p.invoiceNumber}</span>
                  </td>
                  <td>
                    <strong>{p.customerName}</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                      {p.company}
                    </span>
                  </td>
                  <td>
                    <span className="plan-chip">{p.method}</span>
                  </td>
                  <td>{p.date}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--ink-secondary)' }}>
                      {p.reference}
                    </span>
                    {p.note && (
                      <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--ink-tertiary)' }}>
                        {p.note}
                      </span>
                    )}
                  </td>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)', fontSize: '13px' }}>
                      ₹{p.amount.toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>
                    <span className="status paid">
                      <i /> Settled
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

