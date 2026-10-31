import React, { useState } from 'react'
import { Users, Plus, Search, Filter, Download, MoreHorizontal, Mail, Phone } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function CustomersPage({ onNewCustomer, onNotify }) {
  const { customers, subscriptions } = useSubscriptions()
  const [query, setQuery] = useState('')

  const filtered = customers.filter(c =>
    `${c.name} ${c.company} ${c.email} ${c.phone}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Enterprise Client Directory</div>
          <h1>Customers & Accounts</h1>
          <p>
            Unified registry of client accounts, subscribed tiers, lifetime customer value, and billing addresses.
          </p>
        </div>
        <button className="primary-btn" onClick={onNewCustomer}>
          <Plus size={16} strokeWidth={2.5} />
          Add Customer Account
        </button>
      </div>

      <div className="summary-strip">
        <div>
          <span>Total Client Accounts</span>
          <strong>{customers.length}</strong>
        </div>
        <div>
          <span>Active Accounts</span>
          <strong className="green-text">{customers.filter(c => c.status === 'Active').length}</strong>
        </div>
        <div>
          <span>Paused Accounts</span>
          <strong>{customers.filter(c => c.status === 'Paused').length}</strong>
        </div>
        <div>
          <span>High-Value Accounts</span>
          <strong style={{ color: 'var(--primary)' }}>{customers.filter(c => c.totalSpent > 100000).length}</strong>
        </div>
      </div>

      <section className="card full-table-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h2>All Customer Accounts</h2>
            <span className="count-pill">{customers.length} accounts</span>
          </div>

          <div className="toolbar-actions">
            <div className="small-search">
              <Search size={14} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search customers by name, company, email..."
              />
            </div>
            <button className="outline-btn" onClick={() => onNotify?.('Exported customer directory as CSV')}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Customer / Organization</th>
                <th>Subscribed Plan</th>
                <th>GSTIN / Tax ID</th>
                <th>Total Spent</th>
                <th>Onboarded Date</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cust => (
                <tr key={cust.id}>
                  <td>
                    <div className="person-cell">
                      <div className={`avatar avatar-${cust.color || 'violet'}`}>
                        {cust.initials}
                      </div>
                      <div>
                        <strong>{cust.name}</strong>
                        <span>{cust.company} · {cust.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="plan-chip">{cust.plan}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-secondary)' }}>
                      {cust.taxId || '29AABCB1234F1Z0'}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      ₹{cust.totalSpent.toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>
                    <span className="muted">{cust.joined}</span>
                  </td>
                  <td>
                    <span className={`status ${cust.status.toLowerCase()}`}>
                      <i /> {cust.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="row-menu"
                      onClick={() => onNotify?.(`Account details for ${cust.name}`)}
                      aria-label="Actions"
                    >
                      <MoreHorizontal size={16} />
                    </button>
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

