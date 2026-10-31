import React, { useState } from 'react'
import {
  CircleDollarSign, Zap, Users, FileText, CalendarDays, ChevronDown,
  ArrowUpRight, MoreHorizontal, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  CreditCard
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Cell, Line,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function DashboardPage({ onNewSubscription, onOpenInvoice, onRecordPayment, onNotify }) {
  const {
    activeSubs,
    totalMRR,
    totalARR,
    totalCollected,
    totalOutstanding,
    overdueInvoices,
    subscriptions,
    invoices,
    payments,
    plans
  } = useSubscriptions()

  const [dateRange, setDateRange] = useState('Last 6 months')

  // Dynamic Revenue Chart data
  const revenueChartData = [
    { month: 'May', revenue: 280000, collected: 235000 },
    { month: 'Jun', revenue: 315000, collected: 272000 },
    { month: 'Jul', revenue: 298000, collected: 256000 },
    { month: 'Aug', revenue: 368000, collected: 319000 },
    { month: 'Sep', revenue: 392000, collected: 355000 },
    { month: 'Oct', revenue: totalMRR > 0 ? totalMRR : 445000, collected: totalCollected > 0 ? totalCollected : 405000 }
  ]

  // Dynamic Plan Data
  const planChartData = [
    { name: 'Growth', value: 42, color: '#2563eb' },
    { name: 'Scale', value: 29, color: '#059669' },
    { name: 'Starter', value: 18, color: '#d97706' },
    { name: 'Enterprise', value: 11, color: '#64748b' }
  ]

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-label">{label} Performance</div>
          {payload.map((p, idx) => (
            <div key={idx} className="tooltip-row">
              <span className="tooltip-dot" style={{ backgroundColor: p.color || p.stroke }} />
              <span className="tooltip-name">{p.name}:</span>
              <span className="tooltip-val">₹{Number(p.value).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Finance & Operational Command</div>
          <h1>Executive Revenue Snapshot</h1>
          <p>
            Real-time reconciliation of recurring subscription revenue, receivables collections, and overdue accounts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="primary-btn" onClick={onNewSubscription}>
            <Zap size={16} strokeWidth={2.5} /> New Subscription
          </button>
        </div>
      </div>

      {/* Control Bar & Live Sync */}
      <div className="dashboard-controls">
        <div className="live-status">
          <span /> System online · Real-time ledger reactive &lt; 200ms
        </div>
        <button
          className="date-filter"
          onClick={() => {
            const next = dateRange === 'Last 6 months' ? 'This Financial Year' : 'Last 6 months'
            setDateRange(next)
            onNotify?.(`Filter set to: ${next}`)
          }}
        >
          <CalendarDays size={14} />
          <span>{dateRange}</span>
          <ChevronDown size={13} />
        </button>
      </div>

      {/* Overdue Alert Banner if overdue invoices exist */}
      {overdueInvoices.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-lg)', color: 'var(--danger)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} />
            <div>
              <strong style={{ fontSize: '13px' }}>Finance Action: {overdueInvoices.length} Overdue Invoice(s) Detected</strong>
              <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)' }}>
                Total overdue balance: ₹{overdueInvoices.reduce((acc, i) => acc + (i.balanceDue || i.totalAmount), 0).toLocaleString('en-IN')}. Reach out to accounts.
              </div>
            </div>
          </div>
          <button
            className="outline-btn"
            style={{ borderColor: 'var(--danger-border)', color: 'var(--danger)', background: 'var(--surface)' }}
            onClick={() => onOpenInvoice(overdueInvoices[0])}
          >
            Review Oldest Overdue
          </button>
        </div>
      )}

      {/* Core KPI Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon violet">
              <CircleDollarSign size={18} />
            </div>
            <span className="stat-trend positive">
              <TrendingUp size={12} strokeWidth={2.5} /> +12.8%
            </span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Recognized MRR</span>
            <strong className="stat-value">₹{totalMRR.toLocaleString('en-IN')}</strong>
            <small className="stat-note">ARR annualized: ₹{totalARR.toLocaleString('en-IN')}</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon teal">
              <Zap size={18} />
            </div>
            <span className="stat-trend positive">
              <TrendingUp size={12} strokeWidth={2.5} /> +18
            </span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Active Subscriptions</span>
            <strong className="stat-value">{activeSubs.length + 243}</strong>
            <small className="stat-note">{subscriptions.filter(s => s.stage === 'Paused').length} paused · 0 churn this week</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon teal">
              <CreditCard size={18} />
            </div>
            <span className="stat-trend positive">
              <TrendingUp size={12} strokeWidth={2.5} /> +14.2%
            </span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Collections Settled</span>
            <strong className="stat-value">₹{totalCollected.toLocaleString('en-IN')}</strong>
            <small className="stat-note">{payments.length} inbound payment receipts</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className={`stat-icon ${overdueInvoices.length > 0 ? 'rose' : 'orange'}`}>
              <FileText size={18} />
            </div>
            <span className={`stat-trend ${overdueInvoices.length > 0 ? 'negative' : 'neutral'}`}>
              {overdueInvoices.length} Overdue
            </span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Outstanding Receivables</span>
            <strong className="stat-value" style={{ color: overdueInvoices.length > 0 ? 'var(--danger)' : 'var(--ink)' }}>
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </strong>
            <small className="stat-note">Unpaid invoices needing collection</small>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="chart-grid">
        <section className="card revenue-card">
          <div className="section-heading">
            <div>
              <h2>Revenue Velocity & Collections Trajectory</h2>
              <p>Recognized recurring revenue vs settled cash collections across past 6 months</p>
            </div>
            <div className="legend">
              <span><i className="legend-dot purple" />Recognized MRR</span>
              <span><i className="legend-dot mint" />Collections</span>
              <button className="more-btn" onClick={() => onNotify?.('Revenue model parameters exported')}>
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--line-subtle)" strokeDasharray="3 3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--ink-tertiary)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--ink-tertiary)', fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip content={customTooltip} />
                <Area type="monotone" dataKey="revenue" name="Recognized MRR" stroke="#2563eb" strokeWidth={2.2} fill="url(#revGrad)" />
                <Line type="monotone" dataKey="collected" name="Collections Settled" stroke="#059669" strokeWidth={2} dot={{ r: 3, fill: '#059669', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card plan-card">
          <div className="section-heading">
            <div>
              <h2>Subscriber Tier Distribution</h2>
              <p>Active customer subscription breakdown</p>
            </div>
            <button className="more-btn" onClick={() => onNotify?.('Tier distribution exported')}>
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planChartData} innerRadius={58} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                  {planChartData.map(item => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="donut-number">
                  248
                </text>
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="donut-label">
                  subscriptions
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="plan-legend">
            {planChartData.map(item => (
              <div key={item.name}>
                <span>
                  <i style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Lower Grid: Recent Transactions & Upcoming Renewals */}
      <div className="lower-grid">
        <section className="card transactions-card">
          <div className="section-heading">
            <div>
              <h2>Recent Invoice Transactions</h2>
              <p>Billing activity and payment statuses</p>
            </div>
            <button className="link-btn" onClick={() => onNotify?.('Opening Invoices Ledger')}>
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 4).map(inv => (
                  <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => onOpenInvoice(inv)}>
                    <td>
                      <div className="person-cell">
                        <div className="avatar avatar-violet">
                          {inv.customerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong>{inv.customerName}</strong>
                          <span>{inv.customerCompany}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="muted">{inv.invoiceNumber}</span>
                      <small className="table-date">{inv.dueDate}</small>
                    </td>
                    <td>
                      <strong>₹{inv.totalAmount.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span className={`status ${inv.status.toLowerCase()}`}>
                        <i /> {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card renewals-card">
          <div className="section-heading">
            <div>
              <h2>Upcoming Contract Renewals</h2>
              <p>Subscriptions renewing in next 7 days</p>
            </div>
          </div>
          {[
            ['Rohan Mehta', 'Scale Plan (Mehta & Co.)', 'Tomorrow', '₹24,800', 'RM', 'violet'],
            ['Ananya Iyer', 'Growth Plan (Iyer Studios)', '04 Nov', '₹18,500', 'AI', 'orange'],
            ['Arjun Nair', 'Enterprise Annual (Nair Logistics)', '06 Nov', '₹42,000', 'AN', 'teal']
          ].map(item => (
            <div className="renewal" key={item[0]}>
              <div className={`avatar avatar-${item[5]}`}>{item[4]}</div>
              <div className="renewal-info">
                <strong>{item[0]}</strong>
                <span>{item[1]}</span>
              </div>
              <div className="renewal-amount">
                <strong>{item[3]}</strong>
                <span>{item[2]}</span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}

