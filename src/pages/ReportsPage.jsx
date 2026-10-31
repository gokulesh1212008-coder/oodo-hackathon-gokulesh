import React from 'react'
import {
  CircleDollarSign, ArrowUpRight, TrendingUp, Zap, CalendarDays, ChevronDown, Download
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function ReportsPage({ onNotify }) {
  const { totalMRR, totalARR, totalCollected, totalOutstanding, overdueInvoices } = useSubscriptions()

  const revenueData = [
    { month: 'May', revenue: 280000, collections: 235000 },
    { month: 'Jun', revenue: 315000, collections: 272000 },
    { month: 'Jul', revenue: 298000, collections: 256000 },
    { month: 'Aug', revenue: 368000, collections: 319000 },
    { month: 'Sep', revenue: 392000, collections: 355000 },
    { month: 'Oct', revenue: totalMRR > 0 ? totalMRR : 445000, collections: totalCollected > 0 ? totalCollected : 405000 }
  ]

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-label">{label} Performance</div>
          {payload.map((p, idx) => (
            <div key={idx} className="tooltip-row">
              <span className="tooltip-dot" style={{ backgroundColor: p.color || p.fill }} />
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
          <div className="eyebrow">Financial Auditing & Metrics</div>
          <h1>Revenue & Retention Analytics</h1>
          <p>
            Audit recurring revenue velocity, cohort net retention, overdue collection aging, and cash conversion cycles in under two seconds.
          </p>
        </div>
        <button className="primary-btn" onClick={() => onNotify?.('Quarterly recurring revenue audit exported as CSV')}>
          <Download size={15} strokeWidth={2.5} /> Export Audit CSV
        </button>
      </div>

      <div className="stats-grid report-stats">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon violet">
              <CircleDollarSign size={18} />
            </div>
            <span className="stat-trend positive">
              <TrendingUp size={12} strokeWidth={2.5} /> +16.2%
            </span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Annual Recurring Revenue</span>
            <strong className="stat-value">₹{(totalARR / 100000).toFixed(1)}L</strong>
            <small className="stat-note">Based on active contracted run-rate</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon teal">
              <ArrowUpRight size={18} />
            </div>
            <span className="stat-trend positive">
              <TrendingUp size={12} strokeWidth={2.5} /> +11.9%
            </span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Settled Collections YTD</span>
            <strong className="stat-value">₹{(totalCollected / 100000).toFixed(1)}L</strong>
            <small className="stat-note">Reconciled against bank statements</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon orange">
              <TrendingUp size={18} />
            </div>
            <span className="stat-trend positive">+4.2%</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Net Revenue Retention (NRR)</span>
            <strong className="stat-value">108.4%</strong>
            <small className="stat-note">Healthy expansion from seat add-ons</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon rose">
              <Zap size={18} />
            </div>
            <span className="stat-trend positive">-0.6%</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Gross Churn Rate</span>
            <strong className="stat-value">2.8%</strong>
            <small className="stat-note">Significantly below SaaS benchmark</small>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <section className="card revenue-card">
          <div className="section-heading">
            <div>
              <h2>Monthly Revenue Trajectory</h2>
              <p>Recognized subscription billing volume over previous 6 months</p>
            </div>
            <button className="date-filter" onClick={() => onNotify?.('Filter: Last 6 months')}>
              <span>Last 6 months</span>
              <ChevronDown size={13} />
            </button>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--line-subtle)" strokeDasharray="3 3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--ink-tertiary)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--ink-tertiary)', fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="revenue" name="Recognized Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Intelligence Executive Briefing */}
        <section className="card insight-card">
          <div>
            <div className="insight-top">
              <TrendingUp size={15} />
              <span>Executive Briefing · Cohort Health</span>
            </div>
            <h2>Scale tier accounts exhibit the highest lifetime value (LTV).</h2>
            <p>
              Scale customers represent 29% of active subscriptions with near-zero contraction (0.4%). Initiating an upgrade campaign for high-seat Growth customers using the <strong>ANNUAL10</strong> coupon code offers an estimated ₹1.4L MRR expansion opportunity.
            </p>
          </div>
          <button className="link-btn" onClick={() => onNotify?.('Opening promotional campaign generator')}>
            Launch targeted expansion campaign <ArrowUpRight size={13} />
          </button>
        </section>
      </div>
    </>
  )
}

