import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileCheck2, FileText, CreditCard, Clock, ShieldCheck, ArrowUpRight,
  Printer, CheckCircle2, AlertCircle, Sparkles, Building2, User
} from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function CustomerPortalPage({ onOpenInvoice, onRecordPayment, onNotify }) {
  const { currentUser, subscriptions, invoices, payments, customers } = useSubscriptions()

  // Filter ONLY current customer's data
  const myCustomerId = currentUser.customerId || 'CUST-001'
  const myCustomer = customers.find(c => c.id === myCustomerId) || {
    name: currentUser.name,
    company: currentUser.company || 'Client Organization',
    email: currentUser.email,
    taxId: '27AABCM1234F1Z8'
  }

  const mySubs = subscriptions.filter(s => s.customerId === myCustomerId)
  const myInvoices = invoices.filter(i => i.customerId === myCustomerId)
  const myPayments = payments.filter(p => p.customerId === myCustomerId)

  const unpaidInvoices = myInvoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled')
  const totalBalanceDue = unpaidInvoices.reduce((acc, i) => acc + (i.balanceDue ?? (i.totalAmount - (i.paidAmount || 0))), 0)

  return (
    <div className="customer-portal">
      {/* Portal Hero */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> Client Self-Service Portal
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Welcome, {currentUser.name}</h1>
          <p>
            Review and manage subscriptions, inspect itemized tax invoices, and settle balances directly for <strong>{myCustomer.company}</strong>.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--ink-tertiary)' }}>Account ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{myCustomerId}</strong></div>
          <div style={{ fontSize: '11.5px', color: 'var(--ink-tertiary)', marginTop: '2px' }}>GSTIN: <strong style={{ fontFamily: 'var(--font-mono)' }}>{myCustomer.taxId}</strong></div>
        </div>
      </div>

      {/* Account Overview Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon violet">
              <FileCheck2 size={18} />
            </div>
            <span className="stat-trend positive">Active</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Active Subscriptions</span>
            <strong className="stat-value">{mySubs.length}</strong>
            <small className="stat-note">Recurring software & add-ons</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon teal">
              <CreditCard size={18} />
            </div>
            <span className="stat-trend positive">Settled</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Total Invoices Settled</span>
            <strong className="stat-value">₹{myPayments.reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}</strong>
            <small className="stat-note">Lifetime payments made</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className={`stat-icon ${totalBalanceDue > 0 ? 'rose' : 'teal'}`}>
              <FileText size={18} />
            </div>
            <span className={`stat-trend ${totalBalanceDue > 0 ? 'negative' : 'positive'}`}>
              {totalBalanceDue > 0 ? 'Payment Due' : 'All Clear'}
            </span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Outstanding Balance</span>
            <strong className="stat-value" style={{ color: totalBalanceDue > 0 ? 'var(--danger)' : 'var(--ink)' }}>
              ₹{totalBalanceDue.toLocaleString('en-IN')}
            </strong>
            <small className="stat-note">{unpaidInvoices.length} invoice(s) pending payment</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon orange">
              <Clock size={18} />
            </div>
            <span className="stat-trend neutral">Next Cycle</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Next Renewal Date</span>
            <strong className="stat-value" style={{ fontSize: '20px' }}>
              {mySubs[0]?.nextBillingDate || '30 Nov 2024'}
            </strong>
            <small className="stat-note">Auto-renew enabled</small>
          </div>
        </div>
      </div>

      {/* Subscriptions Section */}
      <section className="card full-table-card" style={{ marginBottom: '24px' }}>
        <div className="table-toolbar">
          <div className="table-title">
            <h2>My Subscriptions</h2>
            <span className="count-pill">{mySubs.length} contract(s)</span>
          </div>
          <button
            className="outline-btn"
            onClick={() => onNotify?.('Support ticket created: Account executive will reach out to configure custom seat add-on.')}
          >
            Request Upgrade / Add-on
          </button>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Subscription ID</th>
                <th>Plan Tier</th>
                <th>Billing Cadence</th>
                <th>Renewal / Expiry</th>
                <th>Cycle Cost</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mySubs.map(sub => (
                <tr key={sub.id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{sub.id}</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                      Started: {sub.startDate}
                    </span>
                  </td>
                  <td>
                    <span className="plan-chip">{sub.planName}</span>
                  </td>
                  <td>{sub.billingFrequency} ({sub.paymentTerms})</td>
                  <td>
                    <strong>{sub.nextBillingDate}</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                      Expires: {sub.expiryDate}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{sub.recurringTotal.toLocaleString('en-IN')}</strong>
                  </td>
                  <td>
                    <span className={`status ${sub.stage.toLowerCase()}`}>
                      <i /> {sub.stage}
                    </span>
                  </td>
                  <td>
                    <button
                      className="link-btn"
                      onClick={() => onNotify?.(`Renewal preferences saved for ${sub.id}`)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invoices & Receipts Section */}
      <div className="chart-grid">
        <section className="card full-table-card">
          <div className="table-toolbar">
            <div className="table-title">
              <h2>My Invoices & Billing History</h2>
              <span className="count-pill">{myInvoices.length} invoices</span>
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Issued Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myInvoices.map(inv => {
                  const bal = inv.balanceDue ?? (inv.totalAmount - (inv.paidAmount || 0))
                  return (
                    <tr key={inv.id}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{inv.invoiceNumber}</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                          {inv.billingPeriod}
                        </span>
                      </td>
                      <td>{inv.issueDate}</td>
                      <td style={{ color: inv.status === 'Overdue' ? 'var(--danger)' : 'inherit' }}>
                        {inv.dueDate}
                      </td>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{inv.totalAmount.toLocaleString('en-IN')}</strong>
                        {bal > 0 && (
                          <span style={{ display: 'block', fontSize: '11px', color: 'var(--danger)' }}>
                            Due: ₹{bal.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`status ${inv.status.toLowerCase()}`}>
                          <i /> {inv.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="link-btn"
                            onClick={() => onOpenInvoice(inv)}
                          >
                            View
                          </button>
                          {bal > 0 && (
                            <button
                              className="primary-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => onRecordPayment(inv)}
                            >
                              Pay Now
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
        </section>

        {/* Payment History & Receipts */}
        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Settled Payments</h2>
              <p>Reconciled payments & transaction receipts</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {myPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-tertiary)', fontSize: '12px' }}>
                No settled payment receipts on file yet.
              </div>
            ) : (
              myPayments.map(p => (
                <div key={p.id} className="renewal">
                  <div className="avatar avatar-teal" style={{ width: '30px', height: '30px', fontSize: '10px' }}>
                    ₹
                  </div>
                  <div className="renewal-info">
                    <strong>₹{p.amount.toLocaleString('en-IN')} · {p.method}</strong>
                    <span>{p.reference} · {p.date}</span>
                  </div>
                  <div className="renewal-amount">
                    <span className="status paid" style={{ fontSize: '10px', padding: '2px 6px' }}>
                      Settled
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

