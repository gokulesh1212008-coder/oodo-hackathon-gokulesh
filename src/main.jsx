import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays, ChevronDown, ChevronLeft,
  ChevronRight, CircleDollarSign, ClipboardList, CreditCard, Database, Download,
  FileCheck2, FileText, Filter, LayoutDashboard, Menu, MoreHorizontal, Package,
  Plus, Search, Settings, ShieldCheck, Sun, Moon, Tag, Users, X, Zap,
  TrendingUp, TrendingDown, Check, UserCheck, LogIn, Lock, ShieldAlert
} from 'lucide-react'

import { SubscriptionProvider, useSubscriptions } from './context/SubscriptionContext'
import DashboardPage from './pages/DashboardPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import InvoicesPage from './pages/InvoicesPage'
import ProductsPage from './pages/ProductsPage'
import PlansPage from './pages/PlansPage'
import DiscountsPage from './pages/DiscountsPage'
import PaymentsPage from './pages/PaymentsPage'
import CustomersPage from './pages/CustomersPage'
import StaffPage from './pages/StaffPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import CustomerPortalPage from './pages/CustomerPortalPage'
import TasksPage from './pages/TasksPage'

import InvoiceViewModal from './components/InvoiceViewModal'
import SubscriptionDetailModal from './components/SubscriptionDetailModal'
import BillingDayModal from './components/BillingDayModal'
import RecordPaymentModal from './components/RecordPaymentModal'
import CreateProductModal from './components/CreateProductModal'
import CreatePlanModal from './components/CreatePlanModal'
import CreateDiscountModal from './components/CreateDiscountModal'
import CreateSubscriptionModal from './components/CreateSubscriptionModal'
import SignUpModal from './components/SignUpModal'
import ResetPasswordModal from './components/ResetPasswordModal'

import './styles.css'

function BrandLogo() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16.5c-3 0-5-2-5-4.5s2-4.5 5-4.5c3.5 0 6.5 9 10 9 3 0 5-2 5-4.5s-2-4.5-5-4.5c-3.5 0-6.5 9-10 9z" />
      </svg>
    </div>
  )
}

function MainApp() {
  const {
    currentUser,
    users,
    switchUser,
    subscriptions,
    invoices,
    customers
  } = useSubscriptions()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [toast, setToast] = useState('')

  // Modals
  const [invoiceToView, setInvoiceToView] = useState(null)
  const [subToView, setSubToView] = useState(null)
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [targetInvoiceForPay, setTargetInvoiceForPay] = useState(null)
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showSubModal, setShowSubModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const activePath = location.pathname

  const notify = (msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 3000)
  }

  const go = (path) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const isCustomer = currentUser.role === 'customer'
  const isAdmin = currentUser.role === 'admin'
  const isStaff = currentUser.role === 'staff'

  // Navigation Groups tailored to Roles
  const adminNav = [
    {
      label: 'Workspace',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Customers', icon: Users, path: '/customers', count: `${customers.length}` },
        { label: 'Products & Variants', icon: Package, path: '/products' },
        { label: 'Subscription Plans', icon: Zap, path: '/plans' }
      ]
    },
    {
      label: 'Billing Operations',
      items: [
        { label: 'Subscriptions & Quotes', icon: FileCheck2, path: '/subscriptions', count: `${subscriptions.length}` },
        { label: 'Invoices & Billing Day', icon: FileText, path: '/invoices', count: `${invoices.filter(i => i.status !== 'Paid').length}` },
        { label: 'Discounts & Coupons', icon: Tag, path: '/discounts' },
        { label: 'Payments Ledger', icon: CreditCard, path: '/payments' }
      ]
    },
    {
      label: 'Administration',
      items: [
        { label: 'Reports & Analytics', icon: CircleDollarSign, path: '/reports' },
        { label: 'Staff Management', icon: ShieldCheck, path: '/staff' },
        { label: 'Settings & Taxes', icon: Settings, path: '/settings' },
        { label: 'Tasks & Database', icon: Database, path: '/tasks' }
      ]
    }
  ]

  const staffNav = [
    {
      label: 'Operations Workspace',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Customers', icon: Users, path: '/customers', count: `${customers.length}` },
        { label: 'Products & Variants', icon: Package, path: '/products' },
        { label: 'Subscription Plans', icon: Zap, path: '/plans' }
      ]
    },
    {
      label: 'Billing Day & Orders',
      items: [
        { label: 'Subscriptions & Quotes', icon: FileCheck2, path: '/subscriptions', count: `${subscriptions.length}` },
        { label: 'Invoices & Billing Day', icon: FileText, path: '/invoices', count: `${invoices.filter(i => i.status !== 'Paid').length}` },
        { label: 'Discounts (View Only)', icon: Tag, path: '/discounts' },
        { label: 'Record Payments', icon: CreditCard, path: '/payments' }
      ]
    },
    {
      label: 'Intelligence',
      items: [
        { label: 'Reports & Analytics', icon: CircleDollarSign, path: '/reports' },
        { label: 'Workspace Preferences', icon: Settings, path: '/settings' },
        { label: 'Tasks & Database', icon: Database, path: '/tasks' }
      ]
    }
  ]

  const customerNav = [
    {
      label: 'Client Self-Service',
      items: [
        { label: 'My Client Portal', icon: LayoutDashboard, path: '/' },
        { label: 'My Subscriptions', icon: FileCheck2, path: '/subscriptions' },
        { label: 'Invoices & Receipts', icon: FileText, path: '/invoices' },
        { label: 'Payment Ledger', icon: CreditCard, path: '/payments' }
      ]
    }
  ]

  const activeNavGroups = isCustomer ? customerNav : isStaff ? staffNav : adminNav

  // Page title mapping
  const getPageTitle = () => {
    if (isCustomer) return 'Client Portal — Mehta & Co.'
    if (activePath === '/') return 'Executive Dashboard'
    if (activePath === '/customers') return 'Customers & Accounts'
    if (activePath === '/products') return 'Products & Variants'
    if (activePath === '/plans') return 'Subscription Plans'
    if (activePath === '/subscriptions') return 'Subscriptions & Quotes'
    if (activePath === '/invoices') return 'Invoices & Billing Day'
    if (activePath === '/discounts') return 'Discounts & Margin Rules'
    if (activePath === '/payments') return 'Payments Ledger'
    if (activePath === '/reports') return 'Revenue & Audit Reports'
    if (activePath === '/staff') return 'Staff & Access Control'
    if (activePath === '/settings') return 'Settings & Tax Rules'
    return 'Brightloop'
  }

  return (
    <div className={dark ? 'app dark' : 'app'}>
      {/* Sidebar Navigation */}
      <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <BrandLogo />
          <div className="brand-text">
            <div className="brand-name">Bright<span>loop</span></div>
            <div className="brand-badge">
              {isCustomer ? 'Customer Portal' : isStaff ? 'Staff Console' : 'Enterprise Ops'}
            </div>
          </div>
        </div>

        {/* Persona Switcher for Evaluation */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-tertiary)', fontWeight: 700, display: 'block', padding: '0 4px 6px' }}>
            Simulate User Persona
          </label>
          <select
            value={currentUser.id}
            onChange={(e) => {
              switchUser(e.target.value)
              const usr = users.find(u => u.id === e.target.value)
              notify(`Switched role to: ${usr?.name} (${usr?.role.toUpperCase()})`)
              navigate('/')
            }}
            style={{
              width: '100%',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 10px',
              fontSize: '11.5px',
              fontWeight: 600,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              cursor: 'pointer'
            }}
          >
            <option value="USR-001">👑 Priya Sharma (Administrator)</option>
            <option value="USR-002">⚡ Aman Verma (Internal Staff)</option>
            <option value="USR-004">🏢 Rohan Mehta (Customer Portal)</option>
          </select>
        </div>

        <nav>
          {activeNavGroups.map(group => (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-label">{group.label}</div>
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
          <div
            className="help-card"
            onClick={() => setShowSignUpModal(true)}
            style={{ border: '1px dashed var(--line-strong)' }}
          >
            <div className="help-icon"><Plus size={15} /></div>
            <div>
              <strong>Sign Up New Business</strong>
              <small>Test Scene 1 password rule</small>
            </div>
            <ArrowUpRight size={14} />
          </div>

          <div className="user-card">
            <div className={`avatar avatar-${currentUser.avatarTone || 'violet'}`}>
              {currentUser.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong>{currentUser.name}</strong>
              <small>{currentUser.title || currentUser.role.toUpperCase()}</small>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="scrim"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Main Content Area */}
      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumbs">
            <span>{isCustomer ? 'Client Portal' : 'Workspace'}</span>
            <ChevronRight size={13} />
            <strong>{getPageTitle()}</strong>
          </div>

          <div className="top-actions">
            <div className="global-search">
              <Search size={15} />
              <input placeholder="Search subscriptions, invoices, customers..." />
              <kbd>⌘ K</kbd>
            </div>

            <button
              className="outline-btn"
              style={{ padding: '5px 10px', fontSize: '11px', display: 'flex', gap: '5px' }}
              onClick={() => setShowSignUpModal(true)}
              title="Test Scene 1: New customer signup"
            >
              <UserCheck size={14} />
              <span>Sign Up New Customer</span>
            </button>

            <button
              className="icon-btn notification"
              onClick={() => notify('3 unread system alerts')}
              aria-label="Notifications"
            >
              <Bell size={17} />
              <i />
            </button>

            <button
              className="icon-btn"
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="top-avatar" title={`${currentUser.name} (${currentUser.role})`}>
              {currentUser.initials}
            </div>
          </div>
        </header>

        <div className="page">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activePath}-${currentUser.role}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
            >
              {isCustomer ? (
                <CustomerPortalPage
                  onOpenInvoice={(inv) => setInvoiceToView(inv)}
                  onRecordPayment={(inv) => {
                    setTargetInvoiceForPay(inv)
                    setShowRecordPaymentModal(true)
                  }}
                  onNotify={notify}
                />
              ) : activePath === '/' ? (
                <DashboardPage
                  onNewSubscription={() => setShowSubModal(true)}
                  onOpenInvoice={(inv) => setInvoiceToView(inv)}
                  onRecordPayment={(inv) => {
                    setTargetInvoiceForPay(inv)
                    setShowRecordPaymentModal(true)
                  }}
                  onNotify={notify}
                />
              ) : activePath === '/subscriptions' ? (
                <SubscriptionsPage
                  onOpenSubscription={(sub) => setSubToView(sub)}
                  onNewSubscription={() => setShowSubModal(true)}
                  onNotify={notify}
                />
              ) : activePath === '/invoices' ? (
                <InvoicesPage
                  onOpenInvoice={(inv) => setInvoiceToView(inv)}
                  onRecordPayment={(inv) => {
                    setTargetInvoiceForPay(inv)
                    setShowRecordPaymentModal(true)
                  }}
                  onRunBilling={() => setShowBillingModal(true)}
                  onNotify={notify}
                />
              ) : activePath === '/products' ? (
                <ProductsPage
                  onNewProduct={() => setShowProductModal(true)}
                  onNotify={notify}
                />
              ) : activePath === '/plans' ? (
                <PlansPage
                  onNewPlan={() => setShowPlanModal(true)}
                  onNotify={notify}
                />
              ) : activePath === '/discounts' ? (
                <DiscountsPage
                  onNewDiscount={() => setShowDiscountModal(true)}
                  onNotify={notify}
                />
              ) : activePath === '/payments' ? (
                <PaymentsPage
                  onRecordPayment={(inv) => {
                    setTargetInvoiceForPay(inv)
                    setShowRecordPaymentModal(true)
                  }}
                  onNotify={notify}
                />
              ) : activePath === '/customers' ? (
                <CustomersPage
                  onNewCustomer={() => setShowSignUpModal(true)}
                  onNotify={notify}
                />
              ) : activePath === '/staff' ? (
                <StaffPage onNotify={notify} />
              ) : activePath === '/reports' ? (
                <ReportsPage onNotify={notify} />
              ) : activePath === '/settings' ? (
                <SettingsPage onNotify={notify} />
              ) : activePath === '/tasks' ? (
                <TasksPage onNotify={notify} />
              ) : (
                <DashboardPage
                  onNewSubscription={() => setShowSubModal(true)}
                  onOpenInvoice={(inv) => setInvoiceToView(inv)}
                  onRecordPayment={(inv) => {
                    setTargetInvoiceForPay(inv)
                    setShowRecordPaymentModal(true)
                  }}
                  onNotify={notify}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global Modals */}
      {invoiceToView && (
        <InvoiceViewModal
          invoice={invoiceToView}
          onClose={() => setInvoiceToView(null)}
          onRecordPayment={(inv) => {
            setTargetInvoiceForPay(inv)
            setShowRecordPaymentModal(true)
          }}
          onNotify={notify}
        />
      )}

      {subToView && (
        <SubscriptionDetailModal
          subscription={subToView}
          onClose={() => setSubToView(null)}
          onAdvanceStage={(id, stg) => {
            setSubToView(prev => prev ? { ...prev, stage: stg } : null)
          }}
          onGenerateInvoice={(subId) => {
            notify(`Invoice generated from subscription ${subId}`)
          }}
          onNotify={notify}
        />
      )}

      {showBillingModal && (
        <BillingDayModal
          onClose={() => setShowBillingModal(false)}
          onNotify={notify}
        />
      )}

      {showRecordPaymentModal && (
        <RecordPaymentModal
          targetInvoice={targetInvoiceForPay}
          onClose={() => {
            setShowRecordPaymentModal(false)
            setTargetInvoiceForPay(null)
          }}
          onNotify={notify}
        />
      )}

      {showProductModal && (
        <CreateProductModal
          onClose={() => setShowProductModal(false)}
          onNotify={notify}
        />
      )}

      {showPlanModal && (
        <CreatePlanModal
          onClose={() => setShowPlanModal(false)}
          onNotify={notify}
        />
      )}

      {showDiscountModal && (
        <CreateDiscountModal
          onClose={() => setShowDiscountModal(false)}
          onNotify={notify}
        />
      )}

      {showSubModal && (
        <CreateSubscriptionModal
          onClose={() => setShowSubModal(false)}
          onNotify={notify}
        />
      )}

      {showSignUpModal && (
        <SignUpModal
          onClose={() => setShowSignUpModal(false)}
          onOpenReset={() => setShowResetModal(true)}
          onNotify={notify}
        />
      )}

      {showResetModal && (
        <ResetPasswordModal
          onClose={() => setShowResetModal(false)}
          onNotify={notify}
        />
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10 }}
          className="toast"
        >
          <span className="toast-check"><Check size={12} strokeWidth={3} /></span>
          <span>{toast}</span>
        </motion.div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SubscriptionProvider>
        <MainApp />
      </SubscriptionProvider>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
