import React, { useState } from 'react'
import {
  BriefcaseBusiness, CreditCard, FileText, Bell, Users, RefreshCw, Check
} from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function SettingsPage({ onNotify }) {
  const { taxes, resetToDemoData } = useSubscriptions()
  const [tab, setTab] = useState('company')

  const handleSave = () => {
    onNotify?.('Organization settings and tax configuration saved.')
  }

  const handleReset = () => {
    if (window.confirm('Reset all demo subscriptions, invoices, and payments to default seed state?')) {
      resetToDemoData()
      onNotify?.('System data reset to default demo scenario.')
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Platform Administration</div>
          <h1>Workspace Settings & Tax Rules</h1>
          <p>
            Configure legal entity details, default B2B tax computation rates, invoice sequencing, and notification defaults.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          <button
            className={tab === 'company' ? 'selected' : ''}
            onClick={() => setTab('company')}
          >
            <BriefcaseBusiness size={15} /> Company Information
          </button>
          <button
            className={tab === 'tax' ? 'selected' : ''}
            onClick={() => setTab('tax')}
          >
            <CreditCard size={15} /> Tax & GST Computation
          </button>
          <button
            className={tab === 'numbering' ? 'selected' : ''}
            onClick={() => setTab('numbering')}
          >
            <FileText size={15} /> Invoice Numbering
          </button>
          <button
            className={tab === 'reset' ? 'selected' : ''}
            onClick={() => setTab('reset')}
          >
            <RefreshCw size={15} /> Reset Demo State
          </button>
        </div>

        <section className="card settings-card">
          {tab === 'company' && (
            <>
              <div className="section-heading">
                <div>
                  <h2>Company Legal Profile</h2>
                  <p>Details printed on all customer tax invoices and quotation templates.</p>
                </div>
                <span className="saved-badge">✓ Active Verified</span>
              </div>

              <div className="form-grid">
                <label>
                  Legal Entity Name
                  <input defaultValue="Brightloop Technologies Pvt. Ltd." />
                </label>
                <label>
                  GSTIN / Tax ID
                  <input defaultValue="29AABCB1234C1Z5" />
                </label>
                <label>
                  Finance / Billing Email
                  <input defaultValue="billing@brightloop.in" />
                </label>
                <label>
                  Support Hotline
                  <input defaultValue="+91 80 4567 8900" />
                </label>
                <label className="wide">
                  Registered Business Headquarters
                  <textarea defaultValue="12th Floor, Orion Tower, Residency Road, Bengaluru, Karnataka 560025, India" />
                </label>
              </div>

              <div className="form-footer">
                <span>Last updated by Administrator Priya Sharma</span>
                <button className="primary-btn" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </>
          )}

          {tab === 'tax' && (
            <>
              <div className="section-heading">
                <div>
                  <h2>Tax & GST Rules</h2>
                  <p>Automatic tax rules applied on billing day when generating invoices.</p>
                </div>
                <span className="saved-badge">✓ Configured</span>
              </div>

              <div style={{ marginTop: '16px' }}>
                <table style={{ width: '100%', marginBottom: '20px' }}>
                  <thead>
                    <tr>
                      <th>Tax Rule Name</th>
                      <th>Tax Rate</th>
                      <th>Default Rule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxes.map(t => (
                      <tr key={t.id}>
                        <td><strong>{t.name}</strong></td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{t.rate}%</td>
                        <td>
                          {t.isDefault ? (
                            <span className="status active"><i /> Default B2B</span>
                          ) : (
                            <span className="muted">Secondary</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="form-footer">
                <span>Tax engine recalculates automatically on billing day</span>
                <button className="primary-btn" onClick={handleSave}>
                  Save Tax Rules
                </button>
              </div>
            </>
          )}

          {tab === 'numbering' && (
            <>
              <div className="section-heading">
                <div>
                  <h2>Invoice & Subscription Sequencing</h2>
                  <p>Standard prefix and sequence format for generated billing documents.</p>
                </div>
                <span className="saved-badge">✓ Compliant</span>
              </div>

              <div className="form-grid">
                <label>
                  Invoice Prefix
                  <input defaultValue="INV-" />
                </label>
                <label>
                  Next Invoice Sequence
                  <input defaultValue="2049" />
                </label>
                <label>
                  Subscription Prefix
                  <input defaultValue="SUB-2024-" />
                </label>
                <label>
                  Quotation Prefix
                  <input defaultValue="QT-" />
                </label>
              </div>

              <div className="form-footer">
                <span>Sequencing guarantees no skipped or duplicate invoice numbers</span>
                <button className="primary-btn" onClick={handleSave}>
                  Save Sequence Rules
                </button>
              </div>
            </>
          )}

          {tab === 'reset' && (
            <div style={{ padding: '20px 0' }}>
              <div className="section-heading">
                <div>
                  <h2>Reset Demo Environment</h2>
                  <p>Restore all subscriptions, invoices, and payments back to the initial scenario.</p>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', margin: '16px 0', lineHeight: 1.6 }}>
                Useful when presenting or demonstrating different user stories (e.g. creating new subscriptions from quotes, running billing cycles, testing discount rules, or recording payments).
              </p>
              <button
                className="outline-btn"
                style={{ borderColor: 'var(--danger-border)', color: 'var(--danger)' }}
                onClick={handleReset}
              >
                <RefreshCw size={15} /> Reset to Default Seed Data
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

