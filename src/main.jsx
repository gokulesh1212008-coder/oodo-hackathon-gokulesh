import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, CircleDollarSign, ClipboardList, CreditCard, Database, Download,
  FileCheck2, FileText, Filter, History, KeyRound, LayoutDashboard, Lock, LogIn, LogOut, Menu,
  MoreHorizontal, Package, Plus, RefreshCw, Search, Settings, ShieldAlert, ShieldCheck,
  Sparkles, Sun, Tag, UserCheck, Users, X, Zap
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { AuthProvider, useAuth } from './lib/auth'
import { validatePasswordComplexity } from './lib/supabase'
import './styles.css'

const fullNavGroups = [
  { label: 'Workspace', items: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Customers', icon: Users, path: '/customers', count: '248' },
    { label: 'Products', icon: Package, path: '/products' },
    { label: 'Subscription plans', icon: Zap, path: '/plans' }
  ]},
  { label: 'Billing', items: [
    { label: 'Quotations', icon: ClipboardList, path: '/quotations', count: '12' },
    { label: 'Subscriptions', icon: FileCheck2, path: '/subscriptions' },
    { label: 'Invoices', icon: FileText, path: '/invoices', count: '7' },
    { label: 'Discounts', icon: Tag, path: '/discounts' },
    { label: 'Payments', icon: CreditCard, path: '/payments' }
  ]},
  { label: 'Manage', items: [
    { label: 'Reports & analytics', icon: CircleDollarSign, path: '/reports' },
    { label: 'Staff management', icon: ShieldCheck, path: '/staff' },
    { label: 'Security & audit', icon: History, path: '/audit-logs' },
    { label: 'Settings', icon: Settings, path: '/settings' }
  ]}
]

const customerNavGroups = [
  { label: 'Portal', items: [
    { label: 'My Subscription', icon: Zap, path: '/' },
    { label: 'My Invoices', icon: FileText, path: '/my-invoices', count: '1' },
    { label: 'My Payments', icon: CreditCard, path: '/my-payments' },
    { label: 'Available Plans', icon: Package, path: '/plans' }
  ]}
]

const revenueData = [
  { month: 'May', revenue: 280000, collected: 235000 }, { month: 'Jun', revenue: 315000, collected: 272000 },
  { month: 'Jul', revenue: 298000, collected: 256000 }, { month: 'Aug', revenue: 368000, collected: 319000 },
  { month: 'Sep', revenue: 392000, collected: 355000 }, { month: 'Oct', revenue: 445000, collected: 405000 }
]
const planData = [{ name: 'Growth', value: 42, color: '#6559e8' }, { name: 'Scale', value: 29, color: '#2bb7a7' }, { name: 'Starter', value: 18, color: '#f0a35b' }, { name: 'Enterprise', value: 11, color: '#b7bdc9' }]
const transactions = [
  { name: 'Rohan Mehta', company: 'Mehta & Co.', invoice: 'INV-2048', amount: '₹24,800', date: 'Oct 31, 2024', status: 'Paid', initials: 'RM', color: 'violet' },
  { name: 'Ananya Iyer', company: 'Iyer Studios', invoice: 'INV-2047', amount: '₹18,500', date: 'Oct 30, 2024', status: 'Paid', initials: 'AI', color: 'orange' },
  { name: 'Arjun Nair', company: 'Nair Logistics', invoice: 'INV-2046', amount: '₹42,000', date: 'Oct 29, 2024', status: 'Pending', initials: 'AN', color: 'teal' },
  { name: 'Neha Kapoor', company: 'Kapoor Retail', invoice: 'INV-2045', amount: '₹12,900', date: 'Oct 28, 2024', status: 'Paid', initials: 'NK', color: 'blue' }
]
const defaultRevenueData = revenueData
const defaultPlanData = planData
const defaultTransactions = transactions
const customers = [
  { name: 'Rohan Mehta', company: 'Mehta & Co.', email: 'rohan@mehta.co', plan: 'Scale', revenue: '₹1,24,000', status: 'Active', joined: '12 Sep 2024', initials: 'RM', color: 'violet' },
  { name: 'Ananya Iyer', company: 'Iyer Studios', email: 'ananya@iyerstudios.in', plan: 'Growth', revenue: '₹86,400', status: 'Active', joined: '04 Sep 2024', initials: 'AI', color: 'orange' },
  { name: 'Arjun Nair', company: 'Nair Logistics', email: 'arjun@nairlogistics.com', plan: 'Enterprise', revenue: '₹2,48,000', status: 'Active', joined: '28 Aug 2024', initials: 'AN', color: 'teal' },
  { name: 'Neha Kapoor', company: 'Kapoor Retail', email: 'neha@kapoorretail.in', plan: 'Starter', revenue: '₹38,700', status: 'Paused', joined: '19 Aug 2024', initials: 'NK', color: 'blue' },
  { name: 'Vikram Shah', company: 'Shah & Sons', email: 'vikram@shahandsons.in', plan: 'Growth', revenue: '₹72,200', status: 'Active', joined: '07 Aug 2024', initials: 'VS', color: 'pink' }
]
const modules = {
  '/products': { title: 'Products', eyebrow: 'Catalog', description: 'Manage the products that power your recurring revenue.', icon: Package, columns: ['Product', 'Type', 'Variants', 'Price', 'Status'], rows: [['Brightloop CRM', 'Software', '3 variants', '₹2,000', 'Active'], ['Insight reports', 'Add-on', '2 variants', '₹1,200', 'Active'], ['Priority support', 'Service', '1 variant', '₹800', 'Draft']] },
  '/plans': { title: 'Subscription plans', eyebrow: 'Pricing', description: 'Shape flexible recurring plans for every customer segment.', icon: Zap, columns: ['Plan', 'Billing', 'Subscribers', 'MRR', 'Status'], rows: [['Growth', 'Monthly', '104', '₹2,08,000', 'Active'], ['Scale', 'Monthly', '72', '₹3,60,000', 'Active'], ['Enterprise', 'Yearly', '18', '₹7,20,000', 'Active']] },
  '/quotations': { title: 'Quotations', eyebrow: 'Sales workflow', description: 'Turn opportunities into predictable recurring revenue.', icon: ClipboardList, columns: ['Quotation', 'Customer', 'Created', 'Value', 'Status'], rows: [['QT-0084', 'Mehta & Co.', '31 Oct 2024', '₹24,800', 'Sent'], ['QT-0083', 'Kapoor Retail', '30 Oct 2024', '₹38,700', 'Accepted'], ['QT-0082', 'Shah & Sons', '29 Oct 2024', '₹72,200', 'Draft']] },
  '/subscriptions': { title: 'Subscriptions', eyebrow: 'Recurring revenue', description: 'Keep every customer relationship moving forward.', icon: FileCheck2, columns: ['Subscription', 'Customer', 'Plan', 'Next billing', 'Status'], rows: [['SUB-1092', 'Rohan Mehta', 'Scale', '30 Nov 2024', 'Active'], ['SUB-1091', 'Ananya Iyer', 'Growth', '04 Nov 2024', 'Active'], ['SUB-1087', 'Neha Kapoor', 'Starter', 'Paused', 'Paused']] },
  '/invoices': { title: 'Invoices', eyebrow: 'Collections', description: 'Track billing, balances and collection health in one place.', icon: FileText, columns: ['Invoice', 'Customer', 'Due date', 'Amount', 'Status'], rows: [['INV-2048', 'Rohan Mehta', '31 Oct 2024', '₹24,800', 'Paid'], ['INV-2047', 'Ananya Iyer', '30 Oct 2024', '₹18,500', 'Paid'], ['INV-2046', 'Arjun Nair', '29 Oct 2024', '₹42,000', 'Overdue'], ['INV-2045', 'Neha Kapoor', '28 Oct 2024', '₹12,900', 'Pending']] },
  '/discounts': { title: 'Discounts', eyebrow: 'Pricing tools', description: 'Create thoughtful offers without losing sight of margin.', icon: Tag, columns: ['Discount', 'Type', 'Usage', 'Valid until', 'Status'], rows: [['WELCOME20', '20% off', '84 / 100', '30 Nov 2024', 'Active'], ['ANNUAL10', '10% off', '32 / 50', '31 Dec 2024', 'Active'], ['LAUNCH500', '₹500 off', '100 / 100', '15 Oct 2024', 'Expired']] },
  '/payments': { title: 'Payments', eyebrow: 'Cash flow', description: 'See every collection and keep balances moving.', icon: CreditCard, columns: ['Payment', 'Customer', 'Method', 'Date', 'Amount'], rows: [['PAY-7721', 'Rohan Mehta', 'UPI', '31 Oct 2024', '₹24,800'], ['PAY-7720', 'Ananya Iyer', 'Credit card', '30 Oct 2024', '₹18,500'], ['PAY-7719', 'Arjun Nair', 'Bank transfer', '29 Oct 2024', '₹20,000']] },
  '/staff': { title: 'Staff management', eyebrow: 'Team access', description: 'Keep roles and responsibilities clear as you scale.', icon: ShieldCheck, columns: ['Staff member', 'Role', 'Joined', 'Last active', 'Status'], rows: [['Priya Sharma', 'Admin', '12 Jan 2024', 'Just now', 'Active'], ['Aman Verma', 'Billing manager', '18 Mar 2024', '2 hours ago', 'Active'], ['Kavya Rao', 'Sales', '02 Jun 2024', 'Yesterday', 'Active']] }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  let payload = null
  const text = await response.text()
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }
  if (!response.ok) {
    throw new Error((payload && payload.error) || `Server request failed (${response.status})`)
  }
  return payload || {}
}

function App() {
  const { user, profile, role, isAdmin, isStaff, isCustomer, logout, switchRole, demoUsers } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPersonaMenu, setShowPersonaMenu] = useState(false)
  const [toast, setToast] = useState('')
  const [customerVersion, setCustomerVersion] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const activePath = location.pathname
  const current = modules[activePath]
  const pageTitle = current?.title || (activePath === '/customers' ? 'Customers' : activePath === '/reports' ? 'Reports & analytics' : activePath === '/settings' ? 'Settings' : activePath === '/audit-logs' ? 'Security & audit logs' : isCustomer ? 'Customer Portal' : 'Dashboard')

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2800) }
  const go = (path) => { navigate(path); setSidebarOpen(false) }

  // Filter navigation by role
  const visibleNavGroups = useMemo(() => {
    if (isCustomer) return customerNavGroups
    if (isStaff) {
      return fullNavGroups.map(group => {
        if (group.label === 'Manage') {
          return { ...group, items: group.items.filter(i => i.path === '/reports') }
        }
        if (group.label === 'Billing') {
          return { ...group, items: group.items.filter(i => i.path !== '/discounts') }
        }
        return group
      })
    }
    return fullNavGroups
  }, [role, isCustomer, isStaff])

  return <div className={dark ? 'app dark' : 'app'}>
    <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand">
        <div className="brand-mark"><Sparkles size={16} /></div>
        <span>bright<span>loop</span></span>
      </div>
      
      <div className="workspace-switch" onClick={() => setShowPersonaMenu(!showPersonaMenu)} style={{ cursor: 'pointer' }}>
        <div className="workspace-icon">{profile?.initials || 'BL'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ display: 'flex', alignItems: 'center' }}>
            {profile?.name || 'Brightloop HQ'}
            <span className={`role-chip ${role}`}>{role}</span>
          </strong>
          <small>{profile?.company || 'Workspace'}</small>
        </div>
        <ChevronDown size={14} />
      </div>

      {showPersonaMenu && (
        <div className="role-switcher-card">
          <h4>Switch Active Persona (Testing)</h4>
          <div className="persona-pills">
            {demoUsers.map(u => (
              <button
                key={u.role}
                className={`persona-pill ${role === u.role ? 'active' : ''}`}
                onClick={() => {
                  switchRole(u.role)
                  setShowPersonaMenu(false)
                  notify(`Switched view to ${u.role.toUpperCase()} (${u.name})`)
                  navigate('/')
                }}
              >
                {u.role.toUpperCase()} ({u.initials})
              </button>
            ))}
          </div>
        </div>
      )}

      <nav>
        {visibleNavGroups.map(group => (
          <div className="nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map(item => (
              <button
                key={item.path}
                className={activePath === item.path ? 'nav-item active' : 'nav-item'}
                onClick={() => go(item.path)}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
                {item.count && <em>{item.count}</em>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon"><ShieldCheck size={15} /></div>
          <div><strong>RLS & Auth Active</strong><small>3-Tier RBAC Enforced</small></div>
        </div>
        <div className="user-card" onClick={() => setShowAuthModal(true)} style={{ cursor: 'pointer' }}>
          <div className={`avatar avatar-${profile?.color || 'purple'}`}>{profile?.initials || 'U'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>{profile?.name || 'User'}</strong>
            <small>{profile?.email || 'Logged in'}</small>
          </div>
          <MoreHorizontal size={17} />
        </div>
      </div>
    </aside>

    {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}

    <main className="main">
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
        <div className="breadcrumbs">
          <span>{isCustomer ? 'Customer Portal' : 'Workspace'}</span>
          <ChevronRight size={14} />
          <strong>{pageTitle}</strong>
        </div>
        <div className="top-actions">
          <button className="auth-badge" onClick={() => setShowPersonaMenu(!showPersonaMenu)}>
            <ShieldCheck size={14} color="#6559e8" />
            <span>Role: <strong>{role.toUpperCase()}</strong></span>
            <ChevronDown size={12} />
          </button>
          <div className="global-search"><Search size={16} /><input placeholder="Search records..." /><kbd>⌘ K</kbd></div>
          <button className="icon-btn notification" aria-label="Notifications"><Bell size={18} /><i /></button>
          <button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Sparkles size={18} />}</button>
          <button className="icon-btn" onClick={() => setShowAuthModal(true)} title="Account Settings / Switch"><KeyRound size={17} /></button>
          <div className="top-avatar" onClick={() => setShowAuthModal(true)} style={{ cursor: 'pointer' }}>{profile?.initials || 'U'}</div>
        </div>
      </header>

      <div className="page">
        <AnimatePresence mode="wait">
          <motion.div key={activePath + role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: .22 }}>
            {isCustomer ? (
              <CustomerPortal profile={profile} notify={notify} />
            ) : activePath === '/' ? (
              <Dashboard customerVersion={customerVersion} onAdd={() => setShowModal(true)} notify={notify} role={role} />
            ) : activePath === '/customers' ? (
              <Customers customerVersion={customerVersion} onAdd={() => setShowModal(true)} notify={notify} role={role} />
            ) : activePath === '/reports' ? (
              <Reports notify={notify} />
            ) : activePath === '/audit-logs' ? (
              <AuditLogsPage notify={notify} isAdmin={isAdmin} />
            ) : activePath === '/settings' ? (
              <SettingsPage notify={notify} isAdmin={isAdmin} />
            ) : (
              <ModulePage data={current} onAdd={() => setShowModal(true)} notify={notify} role={role} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>

    {showModal && (
      <AddModal
        title={activePath === '/' || activePath === '/customers' ? 'Add customer' : `Create ${pageTitle.toLowerCase().replace('subscription plans', 'plan').replace('staff management', 'staff member')}`}
        onClose={() => setShowModal(false)}
        role={role}
        onSave={async (formData) => {
          try {
            if (activePath === '/' || activePath === '/customers') {
              await apiRequest('/api/customers', { method: 'POST', body: JSON.stringify(formData) })
              setCustomerVersion(version => version + 1)
            }
            setShowModal(false)
            notify('Saved securely with audit record')
          } catch (error) {
            notify(error.message)
          }
        }}
      />
    )}

    {showAuthModal && (
      <AuthModal
        profile={profile}
        role={role}
        onClose={() => setShowAuthModal(false)}
        notify={notify}
        switchRole={switchRole}
        logout={logout}
      />
    )}

    {toast && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="toast"><span className="toast-check">✓</span>{toast}</motion.div>}
  </div>
}

function PageHeader({ eyebrow, title, description, action, onAction }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <button className="primary-btn" onClick={onAction}><Plus size={17} />{action}</button>}</div>
}

function StatCard({ label, value, change, note, icon: Icon, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18} /></div><div className="stat-label">{label}<span className={change?.startsWith('+') ? 'positive' : 'neutral'}>{change}</span></div><strong>{value}</strong><small>{note}</small></div>
}

function Dashboard({ customerVersion, onAdd, notify, role }) {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/api/dashboard')
      .then(data => {
        setDashboard(data)
        setError('')
      })
      .catch(requestError => setError(requestError.message))
  }, [customerVersion])

  const revenueData = dashboard?.revenue || defaultRevenueData
  const planData = dashboard?.plans || defaultPlanData
  const transactions = dashboard?.transactions || defaultTransactions
  const stats = dashboard?.stats

  return <>
    {error && <div className="error-banner" role="alert">Could not load live dashboard data: {error}</div>}
    <PageHeader eyebrow={`Active Role: ${role.toUpperCase()}`} title={<>Welcome back <span className="wave">✦</span></>} description="Here’s your subscription business at a glance with strict RBAC enforcement." action={role !== 'customer' ? "Add customer" : null} onAction={onAdd} />
    <div className="dashboard-controls"><div className="live-status"><span /> Live Auth & RLS Protected</div><button className="date-filter"><CalendarDays size={15} />Last 6 months<ChevronDown size={14} /></button></div>
    <div className="stats-grid">
      <StatCard label="Monthly recurring revenue" value={stats?.mrr || '₹4,45,000'} change="+12.8%" note="vs. last month" icon={CircleDollarSign} tone="violet" />
      <StatCard label="Active subscriptions" value={stats?.activeSubscriptions || '248'} change="+18" note="new this month" icon={Zap} tone="teal" />
      <StatCard label="Total customers" value={stats?.customers || '—'} change="+8.4%" note="vs. last month" icon={Users} tone="orange" />
      <StatCard label="Outstanding payments" value={stats?.outstanding || '₹86,400'} change="12 invoices" note="need your attention" icon={FileText} tone="rose" />
    </div>
    <div className="chart-grid">
      <section className="card revenue-card">
        <div className="section-heading"><div><h2>Revenue overview</h2><p>Collected revenue and recurring revenue over time</p></div><div className="legend"><span><i className="legend-dot purple" />Revenue</span><span><i className="legend-dot mint" />Collected</span><button className="more-btn"><MoreHorizontal size={17} /></button></div></div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
              <defs><linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7166e8" stopOpacity=".23" /><stop offset="100%" stopColor="#7166e8" stopOpacity="0" /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="#edf0f5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9aa1af', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9aa1af', fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} contentStyle={{ border: 0, borderRadius: 10, boxShadow: '0 8px 24px #1720331a' }} />
              <Area type="monotone" dataKey="revenue" stroke="#675ce7" strokeWidth={2.5} fill="url(#revenue)" />
              <Line type="monotone" dataKey="collected" stroke="#35b8a6" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="card plan-card">
        <div className="section-heading"><div><h2>Plan distribution</h2><p>Active subscriptions by plan</p></div><button className="more-btn"><MoreHorizontal size={17} /></button></div>
        <div className="donut-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={planData} innerRadius={62} outerRadius={86} paddingAngle={3} dataKey="value" stroke="none">
                {planData.map(item => <Cell key={item.name} fill={item.color} />)}
              </Pie>
              <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="donut-number">248</text>
              <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" className="donut-label">subscriptions</text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="plan-legend">
          {planData.map(item => <div key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><strong>{item.value}%</strong></div>)}
        </div>
      </section>
    </div>
    <div className="lower-grid">
      <section className="card transactions-card">
        <div className="section-heading"><div><h2>Recent transactions</h2><p>Latest verified customer collections</p></div><button className="link-btn" onClick={() => notify('Showing all transactions')}>View all <ArrowUpRight size={14} /></button></div>
        <TransactionTable rows={transactions} />
      </section>
      <section className="card renewals-card">
        <div className="section-heading"><div><h2>Upcoming renewals</h2><p>Next 7 days</p></div><button className="more-btn"><MoreHorizontal size={17} /></button></div>
        {[['Rohan Mehta', 'Scale plan', 'Tomorrow', '₹24,800', 'RM', 'violet'], ['Ananya Iyer', 'Growth plan', '04 Nov', '₹18,500', 'AI', 'orange'], ['Arjun Nair', 'Enterprise plan', '06 Nov', '₹42,000', 'AN', 'teal']].map(item => (
          <div className="renewal" key={item[0]}>
            <div className={`avatar avatar-${item[5]}`}>{item[4]}</div>
            <div className="renewal-info"><strong>{item[0]}</strong><span>{item[1]}</span></div>
            <div className="renewal-amount"><strong>{item[3]}</strong><span>{item[2]}</span></div>
          </div>
        ))}
      </section>
    </div>
  </>
}

function TransactionTable({ rows = transactions }) {
  return <div className="table-scroll"><table><thead><tr><th>Customer</th><th>Invoice</th><th>Amount</th><th>Status</th></tr></thead><tbody>{rows.map(row => <tr key={row.invoice}><td><div className="person-cell"><div className={`avatar avatar-${row.color}`}>{row.initials}</div><div><strong>{row.name}</strong><span>{row.company}</span></div></div></td><td><span className="muted">{row.invoice}</span><small className="table-date">{row.date}</small></td><td><strong>{row.amount}</strong></td><td><Status status={row.status} /></td></tr>)}</tbody></table></div>
}

function Status({ status }) {
  return <span className={`status ${status.toLowerCase().replace(' ', '-')}`}><i />{status}</span>
}

function Customers({ customerVersion, onAdd, notify, role }) {
  const [query, setQuery] = useState('')
  const [customerRows, setCustomerRows] = useState(customers)
  const [summary, setSummary] = useState({ total: customers.length, active: 4, paused: 1, atRisk: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/api/customers?q=${encodeURIComponent(query)}`)
      .then(payload => {
        setCustomerRows(payload.customers || [])
        if (payload.summary) setSummary(payload.summary)
        setError('')
      })
      .catch(requestError => setError(requestError.message))
  }, [query, customerVersion])

  return <>
    {error && <div className="error-banner" role="alert">Could not load live customers: {error}</div>}
    <PageHeader eyebrow="Relationship management" title="Customers" description="Row-level secured customer registry." action={role !== 'customer' ? "Add customer" : null} onAction={onAdd} />
    <div className="summary-strip">
      <div><span>All customers</span><strong>{summary.total}</strong></div>
      <div><span>Active</span><strong className="green-text">{summary.active}</strong></div>
      <div><span>Paused</span><strong>{summary.paused}</strong></div>
      <div><span>At risk</span><strong className="red-text">{summary.atRisk}</strong></div>
    </div>
    <section className="card full-table-card">
      <div className="table-toolbar">
        <div className="table-title"><h2>All customers</h2><span className="count-pill">{customerRows.length} shown</span></div>
        <div className="toolbar-actions">
          <div className="small-search"><Search size={15} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search customers..." /></div>
          <button className="outline-btn"><Filter size={15} />Filter</button>
          <button className="outline-btn" onClick={() => notify('Encrypted export generated')}><Download size={15} />Export</button>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>Customer</th><th>Plan</th><th>Revenue</th><th>Joined</th><th>Status</th><th /></tr></thead>
          <tbody>
            {customerRows.map(row => (
              <tr key={row.email}>
                <td><div className="person-cell"><div className={`avatar avatar-${row.color}`}>{row.initials}</div><div><strong>{row.name}</strong><span>{row.company} · {row.email}</span></div></div></td>
                <td><span className="plan-chip">{row.plan}</span></td>
                <td><strong>{row.revenue}</strong></td>
                <td><span className="muted">{row.joined}</span></td>
                <td><Status status={row.status} /></td>
                <td><button className="row-menu" onClick={() => notify(`Audited view: ${row.name}`)}><MoreHorizontal size={17} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <span>Showing {customerRows.length} of {summary.total} records</span>
        <div><button><ChevronLeft size={15} /></button><button className="current">1</button><button><ChevronRight size={15} /></button></div>
      </div>
    </section>
  </>
}

function CustomerPortal({ profile, notify }) {
  const [invoices, setInvoices] = useState([
    { id: 'INV-2048', amount: '₹24,800', date: '31 Oct 2024', status: 'Paid', plan: 'Scale' },
    { id: 'INV-2049', amount: '₹24,800', date: '30 Nov 2024', status: 'Sent', plan: 'Scale' }
  ])

  const handlePay = (invoiceId) => {
    setInvoices(invs => invs.map(inv => inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv))
    notify(`Payment of ₹24,800 for ${invoiceId} confirmed & reconciled!`)
  }

  return (
    <div className="customer-portal">
      <div className="customer-portal-header">
        <div className="eyebrow" style={{ color: '#e0e7ff' }}>Subscriber Account Portal</div>
        <h2>Welcome back, {profile?.name || 'Rohan Mehta'}</h2>
        <p>Manage your Brightloop subscription, review invoices, and submit secure payments.</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Current Subscription" value="Scale Plan" change="Active" note="Next billing: 30 Nov 2024" icon={Zap} tone="violet" />
        <StatCard label="Monthly Recurring Total" value="₹24,800" change="₹2,000 off" note="Promo applied" icon={CircleDollarSign} tone="teal" />
        <StatCard label="Open Balance Due" value="₹24,800" change="1 invoice" note="Due 30 Nov 2024" icon={FileText} tone="rose" />
        <StatCard label="Registered Company" value={profile?.company || 'Mehta & Co.'} change="Verified" note="GSTIN on file" icon={ShieldCheck} tone="orange" />
      </div>

      <section className="card full-table-card" style={{ marginTop: 20 }}>
        <div className="table-toolbar">
          <div className="table-title"><h2>My Invoices & Billing History</h2><span className="count-pill">Customer Scoped</span></div>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Invoice</th><th>Plan</th><th>Issue Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><strong>{inv.id}</strong></td>
                  <td><span className="plan-chip">{inv.plan}</span></td>
                  <td><span className="muted">{inv.date}</span></td>
                  <td><strong>{inv.amount}</strong></td>
                  <td><Status status={inv.status} /></td>
                  <td>
                    {inv.status === 'Sent' ? (
                      <button className="primary-btn" style={{ padding: '6px 12px', fontSize: 10 }} onClick={() => handlePay(inv.id)}>
                        Pay Invoice
                      </button>
                    ) : (
                      <span className="muted" style={{ fontSize: 10 }}>Receipt ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function AuditLogsPage({ notify, isAdmin }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/api/audit-logs')
      .then(payload => {
        setLogs(payload.logs || [])
        setLoading(false)
      })
      .catch(() => {
        // Fallback default sample audit logs
        setLogs([
          { id: '1', action: 'CUSTOMER_CREATED', entity_name: 'customers', actor_email: 'admin@brightloop.io', created_at: new Date().toISOString() },
          { id: '2', action: 'INVOICE_GENERATED', entity_name: 'invoices', actor_email: 'admin@brightloop.io', created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: '3', action: 'PAYMENT_RECORDED', entity_name: 'payments', actor_email: 'staff@brightloop.io', created_at: new Date(Date.now() - 7200000).toISOString() }
        ])
        setLoading(false)
      })
  }, [])

  if (!isAdmin) {
    return <div className="error-banner">Access Denied: Only administrators can inspect immutable system audit logs.</div>
  }

  return <>
    <PageHeader eyebrow="Security Auditing" title="Audit & Activity Logs" description="Immutable security log of all system mutations and financial transactions." action="Refresh Logs" onAction={() => { setLoading(true); notify('Logs refreshed'); }} />
    <section className="card full-table-card">
      <div className="table-toolbar">
        <div className="table-title"><h2>Recent System Mutations</h2><span className="count-pill">{logs.length} logged</span></div>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>Timestamp (UTC)</th><th>Actor</th><th>Action Event</th><th>Entity</th><th>Status</th></tr></thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={log.id || i}>
                <td><span className="muted table-date">{log.created_at}</span></td>
                <td><strong>{log.actor_email || 'admin@brightloop.io'}</strong></td>
                <td><span className="audit-pill">{log.action}</span></td>
                <td><span className="muted">{log.entity_name}</span></td>
                <td><span className="status paid"><i />Logged</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </>
}

function ModulePage({ data, onAdd, notify, role }) {
  const Icon = data?.icon || Database
  if (!data) return <EmptyState />
  const isRestricted = (data.title === 'Staff management' || data.title === 'Discounts') && role !== 'admin'

  return <>
    <PageHeader
      eyebrow={data.eyebrow}
      title={data.title}
      description={data.description}
      action={isRestricted ? null : (data.title === 'Payments' ? 'Record payment' : data.title === 'Invoices' ? 'Create invoice' : `Add ${data.title.slice(0, -1).toLowerCase()}`)}
      onAction={onAdd}
    />
    {isRestricted && (
      <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldAlert size={16} />
        <span>Action Restricted: Role <strong>{role.toUpperCase()}</strong> does not hold permission to modify {data.title.toLowerCase()}.</span>
      </div>
    )}
    <div className="summary-strip module-summary">
      <div><span>Total records</span><strong>{data.rows.length === 3 ? '248' : '1,284'}</strong></div>
      <div><span>Active this month</span><strong className="green-text">92%</strong></div>
      <div><span>Needs attention</span><strong className="red-text">12</strong></div>
      <div className="module-icon"><Icon size={22} /></div>
    </div>
    <section className="card full-table-card">
      <div className="table-toolbar">
        <div className="table-title"><h2>{data.title} overview</h2><span className="count-pill">{data.rows.length + 245} total</span></div>
        <div className="toolbar-actions"><div className="small-search"><Search size={15} /><input placeholder={`Search ${data.title.toLowerCase()}...`} /></div><button className="outline-btn"><Filter size={15} />Filter</button></div>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr>{data.columns.map(c => <th key={c}>{c}</th>)}<th /></tr></thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={row[0]}>
                {row.map((cell, j) => (
                  <td key={cell}>
                    {j === data.columns.length - 1 && ['Active', 'Paid', 'Sent', 'Accepted', 'Pending', 'Overdue', 'Paused', 'Expired'].includes(cell) ? (
                      <Status status={cell} />
                    ) : j === 0 ? (
                      <strong>{cell}</strong>
                    ) : (
                      <span className="muted">{cell}</span>
                    )}
                  </td>
                ))}
                <td><button className="row-menu" onClick={() => notify(`${row[0]} audited`)}><MoreHorizontal size={17} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </>
}

function Reports({ notify }) {
  return <>
    <PageHeader eyebrow="Business intelligence" title="Reports & analytics" description="Understand what is growing, what is owed and where to focus next." action="Export report" onAction={() => notify('Encrypted report exported')} />
    <div className="stats-grid report-stats">
      <StatCard label="Annual recurring revenue" value="₹53.4L" change="+16.2%" note="vs. last year" icon={CircleDollarSign} tone="violet" />
      <StatCard label="Collected revenue" value="₹42.8L" change="+11.9%" note="this financial year" icon={ArrowUpRight} tone="teal" />
      <StatCard label="Net revenue retention" value="108.4%" change="+4.2%" note="healthy expansion" icon={Sparkles} tone="orange" />
      <StatCard label="Churn rate" value="2.8%" change="-0.6%" note="vs. last quarter" icon={Zap} tone="rose" />
    </div>
    <div className="chart-grid">
      <section className="card revenue-card">
        <div className="section-heading"><div><h2>Revenue performance</h2><p>MRR movement across the last 6 months</p></div><button className="date-filter">Last 6 months <ChevronDown size={14} /></button></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={revenueData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#edf0f5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9aa1af', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#9aa1af', fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} /><Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} /><Bar dataKey="revenue" fill="#6c61e7" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </section>
      <section className="card insight-card">
        <div className="insight-top"><div className="stat-icon violet"><Sparkles size={18} /></div><span>Brightloop insight</span></div>
        <h2>Scale customers are your fastest-growing segment.</h2>
        <p>They now make up 29% of active subscriptions and have the lowest churn. Consider a targeted upgrade campaign for Growth customers.</p>
        <button className="link-btn" onClick={() => notify('Opening upgrade campaign')}>Explore opportunity <ArrowUpRight size={14} /></button>
      </section>
    </div>
  </>
}

function SettingsPage({ notify, isAdmin }) {
  return <>
    <PageHeader eyebrow="Workspace preferences" title="Settings" description="Make Brightloop fit the way your team works." />
    {!isAdmin && <div className="error-banner">Read-only notice: Only administrators can modify global company billing and numbering settings.</div>}
    <div className="settings-layout">
      <div className="settings-nav">
        <button className="selected"><BriefcaseBusiness size={16} />Company information</button>
        <button><CreditCard size={16} />Billing & tax</button>
        <button><FileText size={16} />Invoice numbering</button>
        <button><Bell size={16} />Notifications</button>
        <button><Users size={16} />Profile settings</button>
      </div>
      <section className="card settings-card">
        <div className="section-heading"><div><h2>Company information</h2><p>This information appears on customer invoices.</p></div><span className="saved-badge">✓ Saved</span></div>
        <div className="form-grid">
          <label>Company name<input defaultValue="Brightloop Technologies Pvt. Ltd." disabled={!isAdmin} /></label>
          <label>GSTIN<input defaultValue="29AABCB1234C1Z5" disabled={!isAdmin} /></label>
          <label>Business email<input defaultValue="hello@brightloop.in" disabled={!isAdmin} /></label>
          <label>Support phone<input defaultValue="+91 80 4567 8900" disabled={!isAdmin} /></label>
          <label className="wide">Business address<textarea defaultValue="12th Floor, Orion Tower, Residency Road, Bengaluru, Karnataka 560025" disabled={!isAdmin} /></label>
        </div>
        <div className="form-footer"><span>Immutable audit active</span>{isAdmin && <button className="primary-btn" onClick={() => notify('Company settings saved')}>Save changes</button>}</div>
      </section>
    </div>
  </>
}

function EmptyState() {
  return <div className="empty-state"><div className="empty-icon"><Database size={25} /></div><h2>Page coming soon</h2><p>This workspace view is being prepared.</p></div>
}

function AddModal({ title, onClose, onSave, role }) {
  const [formData, setFormData] = useState({ name: '', email: '', company: '' })
  const update = event => setFormData({ ...formData, [event.target.name]: event.target.value })
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><motion.div initial={{ opacity: 0, scale: .97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="modal" onMouseDown={e => e.stopPropagation()}><div className="modal-heading"><div><div className="eyebrow">Quick create</div><h2>{title}</h2></div><button type="button" className="close-btn" onClick={onClose}><X size={18} /></button></div><form onSubmit={handleSubmit}><div className="form-grid"><label>Name<input name="name" value={formData.name} onChange={update} placeholder="Enter a name" autoFocus required /></label><label>Email<input name="email" type="email" value={formData.email} onChange={update} placeholder="name@company.com" required /></label><label className="wide">Company<input name="company" value={formData.company} onChange={update} placeholder="Company name" /></label></div><div className="modal-footer"><button type="button" className="outline-btn" onClick={onClose}>Cancel</button><button type="submit" className="primary-btn"><Plus size={16} />Create</button></div></form></motion.div></div>
}

function AuthModal({ profile, role, onClose, notify, switchRole, logout }) {
  const { login, register, resetPassword } = useAuth()
  const [tab, setTab] = useState('persona') // 'persona', 'login', 'register', 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      notify('Authentication successful')
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    const complexity = validatePasswordComplexity(password)
    if (!complexity.valid) {
      setError(complexity.error)
      return
    }
    setLoading(true)
    try {
      await register(email, password, fullName, company)
      notify('Registration successful')
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await resetPassword(email)
      notify(res.message)
      setTab('login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <motion.div initial={{ opacity: 0, scale: .97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="modal" onMouseDown={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-heading">
          <div>
            <div className="eyebrow">Identity & Security</div>
            <h2>Account & Role Access</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab-btn ${tab === 'persona' ? 'active' : ''}`} onClick={() => { setTab('persona'); setError(''); }}>Switch Persona</button>
          <button className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
          <button className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Register</button>
          <button className={`auth-tab-btn ${tab === 'reset' ? 'active' : ''}`} onClick={() => { setTab('reset'); setError(''); }}>Reset</button>
        </div>

        {error && <div className="error-banner" style={{ marginBottom: 14 }}>{error}</div>}

        {tab === 'persona' && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 0 }}>
              Quickly switch between pre-configured test roles to inspect RBAC enforcement:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {[
                { r: 'admin', title: 'Administrator (Priya Sharma)', desc: 'Full system privileges, staff provision, audit logs.' },
                { r: 'staff', title: 'Staff Member (Aman Verma)', desc: 'Manage invoices, quotations & customers. No staff/discount edits.' },
                { r: 'customer', title: 'Customer (Rohan Mehta)', desc: 'Customer portal, own subscriptions & invoice payments only.' }
              ].map(item => (
                <button
                  key={item.r}
                  className={`outline-btn ${role === item.r ? 'primary-btn' : ''}`}
                  style={{ justifyContent: 'flex-start', padding: 12, textAlign: 'left', borderRadius: 8 }}
                  onClick={() => {
                    switchRole(item.r)
                    notify(`Active role changed to ${item.r.toUpperCase()}`)
                    onClose()
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: 11 }}>{item.title}</strong>
                    <small style={{ fontSize: 9, opacity: .8 }}>{item.desc}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr', marginTop: 10 }}>
              <label>Email Address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@brightloop.io" required autoFocus /></label>
              <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" required /></label>
            </div>
            <div className="modal-footer" style={{ marginTop: 16 }}>
              <button type="button" className="outline-btn" onClick={() => setTab('reset')}>Forgot Password?</button>
              <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Authenticating...' : 'Sign In'}</button>
            </div>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr', marginTop: 10 }}>
              <label>Full Name<input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" required /></label>
              <label>Email Address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@company.com" required /></label>
              <label>Company / Organization<input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company Name" /></label>
              <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create password" required /></label>
            </div>
            <div className="pwd-requirements">
              <strong>Password Complexity Policy:</strong>
              <ul>
                <li>At least 10 characters long</li>
                <li>At least one uppercase and one lowercase letter</li>
                <li>At least one number (0-9)</li>
                <li>At least one special character (!@#$%^&*...)</li>
              </ul>
            </div>
            <div className="modal-footer" style={{ marginTop: 16 }}>
              <button type="button" className="outline-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Creating Account...' : 'Register'}</button>
            </div>
          </form>
        )}

        {tab === 'reset' && (
          <form onSubmit={handleReset}>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 0 }}>
              Enter your verified email address to receive a secure password reset link.
            </p>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr', marginTop: 10 }}>
              <label>Email Address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" required /></label>
            </div>
            <div className="modal-footer" style={{ marginTop: 16 }}>
              <button type="button" className="outline-btn" onClick={() => setTab('login')}>Back to Sign In</button>
              <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)
