import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  initialUsers,
  initialCustomers,
  initialProducts,
  initialPlans,
  initialTaxes,
  initialDiscounts,
  initialSubscriptions,
  initialInvoices,
  initialPayments
} from '../data/initialData'

const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children }) {
  // Load or initialize state from localStorage
  const loadState = (key, fallback) => {
    try {
      const stored = localStorage.getItem(`brightloop_${key}`)
      return stored ? JSON.parse(stored) : fallback
    } catch {
      return fallback
    }
  }

  const [users, setUsers] = useState(() => loadState('users', initialUsers))
  const [currentUser, setCurrentUser] = useState(() => loadState('currentUser', initialUsers[0])) // Priya (Admin)
  const [customers, setCustomers] = useState(() => loadState('customers', initialCustomers))
  const [products, setProducts] = useState(() => loadState('products', initialProducts))
  const [plans, setPlans] = useState(() => loadState('plans', initialPlans))
  const [taxes, setTaxes] = useState(() => loadState('taxes', initialTaxes))
  const [discounts, setDiscounts] = useState(() => loadState('discounts', initialDiscounts))
  const [subscriptions, setSubscriptions] = useState(() => loadState('subscriptions', initialSubscriptions))
  const [invoices, setInvoices] = useState(() => loadState('invoices', initialInvoices))
  const [payments, setPayments] = useState(() => loadState('payments', initialPayments))

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('brightloop_users', JSON.stringify(users))
  }, [users])
  useEffect(() => {
    localStorage.setItem('brightloop_currentUser', JSON.stringify(currentUser))
  }, [currentUser])
  useEffect(() => {
    localStorage.setItem('brightloop_customers', JSON.stringify(customers))
  }, [customers])
  useEffect(() => {
    localStorage.setItem('brightloop_products', JSON.stringify(products))
  }, [products])
  useEffect(() => {
    localStorage.setItem('brightloop_plans', JSON.stringify(plans))
  }, [plans])
  useEffect(() => {
    localStorage.setItem('brightloop_taxes', JSON.stringify(taxes))
  }, [taxes])
  useEffect(() => {
    localStorage.setItem('brightloop_discounts', JSON.stringify(discounts))
  }, [discounts])
  useEffect(() => {
    localStorage.setItem('brightloop_subscriptions', JSON.stringify(subscriptions))
  }, [subscriptions])
  useEffect(() => {
    localStorage.setItem('brightloop_invoices', JSON.stringify(invoices))
  }, [invoices])
  useEffect(() => {
    localStorage.setItem('brightloop_payments', JSON.stringify(payments))
  }, [payments])

  // --- 1. AUTH & ROLES ---
  const switchUser = (userId) => {
    const found = users.find(u => u.id === userId)
    if (found) setCurrentUser(found)
  }

  // Password validation: >8 chars, at least 1 uppercase, 1 lowercase, 1 special character
  const validatePasswordRules = (pwd) => {
    const minLength = pwd.length > 8
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    return {
      minLength,
      hasUpper,
      hasLower,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasSpecial
    }
  }

  const signUp = ({ name, email, password, company, phone }) => {
    // Check uniqueness
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())
    if (exists) {
      return { success: false, error: 'An account with this email address already exists.' }
    }

    const { isValid } = validatePasswordRules(password)
    if (!isValid) {
      return { success: false, error: 'Password does not meet enterprise security requirements.' }
    }

    const newCustId = `CUST-${String(customers.length + 1).padStart(3, '0')}`
    const newUserId = `USR-${String(users.length + 1).padStart(3, '0')}`

    const newCustomer = {
      id: newCustId,
      name,
      company: company || `${name}'s Organization`,
      email: email.trim(),
      phone: phone || '+91 98000 00000',
      address: 'Registered Office, India',
      taxId: '29AABC00000A1Z0',
      plan: 'Growth Plan',
      status: 'Active',
      joined: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      totalSpent: 0,
      activeSubscriptions: 0,
      initials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      color: 'blue'
    }

    const newUser = {
      id: newUserId,
      name,
      email: email.trim(),
      role: 'customer',
      company: newCustomer.company,
      customerId: newCustId,
      title: 'Client Account Admin',
      initials: newCustomer.initials,
      avatarTone: 'blue'
    }

    setCustomers(prev => [...prev, newCustomer])
    setUsers(prev => [...prev, newUser])
    setCurrentUser(newUser)

    return { success: true, user: newUser }
  }

  // --- 2. PRODUCTS & VARIANTS ---
  const addProduct = (prodData) => {
    const newId = `PROD-${String(products.length + 1).padStart(3, '0')}`
    const newProduct = {
      id: newId,
      ...prodData,
      status: 'Active',
      variants: prodData.variants || [{ id: `VAR-${Date.now()}`, name: 'Standard Edition', priceDelta: 0 }]
    }
    setProducts(prev => [newProduct, ...prev])
    return newProduct
  }

  // --- 3. PLANS ---
  const addPlan = (planData) => {
    const newId = `PLAN-${String(plans.length + 1).padStart(3, '0')}`
    const newPlan = {
      id: newId,
      ...planData,
      price: Number(planData.price) || 0,
      minQuantity: Number(planData.minQuantity) || 1
    }
    setPlans(prev => [newPlan, ...prev])
    return newPlan
  }

  // --- 4. DISCOUNTS (ADMIN ONLY) ---
  const addDiscount = (discData) => {
    const newId = `DISC-${String(discounts.length + 1).padStart(3, '0')}`
    const newDisc = {
      id: newId,
      ...discData,
      code: discData.code.trim().toUpperCase(),
      value: Number(discData.value) || 0,
      minAmount: Number(discData.minAmount) || 0,
      minQuantity: Number(discData.minQuantity) || 1,
      maxUsage: Number(discData.maxUsage) || 100,
      usedCount: 0,
      status: 'Active'
    }
    setDiscounts(prev => [newDisc, ...prev])
    return newDisc
  }

  const validateDiscount = (code, subtotal = 0, quantity = 1) => {
    if (!code) return { valid: false }
    const disc = discounts.find(d => d.code === code.trim().toUpperCase())
    if (!disc) return { valid: false, error: 'Discount code not recognized' }

    if (disc.status !== 'Active') return { valid: false, error: 'Discount has expired or is inactive' }
    if (disc.usedCount >= disc.maxUsage) return { valid: false, error: 'Discount maximum usage limit reached' }

    const now = new Date().toISOString().split('T')[0]
    if (disc.endDate && now > disc.endDate) return { valid: false, error: `Discount expired on ${disc.endDate}` }

    if (subtotal < disc.minAmount) {
      return { valid: false, error: `Minimum order value ₹${disc.minAmount.toLocaleString()} required for this discount` }
    }
    if (quantity < disc.minQuantity) {
      return { valid: false, error: `Minimum quantity of ${disc.minQuantity} items required` }
    }

    let discountAmount = 0
    if (disc.type === 'percentage') {
      discountAmount = Math.round((subtotal * disc.value) / 100)
    } else {
      discountAmount = Math.min(disc.value, subtotal)
    }

    return { valid: true, discount: disc, discountAmount }
  }

  // --- 5. QUOTATIONS & SUBSCRIPTIONS ---
  const createSubscription = (data) => {
    const newId = `SUB-2024-${String(subscriptions.length + 1).padStart(3, '0')}`
    const customer = customers.find(c => c.id === data.customerId) || customers[0]
    const plan = plans.find(p => p.id === data.planId) || plans[0]

    const lines = data.lines.map(line => {
      const lineSubtotal = line.unitPrice * line.quantity
      return {
        ...line,
        amount: lineSubtotal
      }
    })

    const subtotal = lines.reduce((acc, l) => acc + l.amount, 0)
    let discountAmount = 0
    if (data.discountCode) {
      const check = validateDiscount(data.discountCode, subtotal, 1)
      if (check.valid) {
        discountAmount = check.discountAmount
        // increment usage
        setDiscounts(prev => prev.map(d => d.code === data.discountCode ? { ...d, usedCount: d.usedCount + 1 } : d))
      }
    }

    const netSubtotal = Math.max(0, subtotal - discountAmount)
    const taxRate = 18 // Standard GST
    const taxTotal = Math.round((netSubtotal * taxRate) / 100)
    const recurringTotal = netSubtotal + taxTotal

    const newSub = {
      id: newId,
      customerId: customer.id,
      customerName: customer.name,
      customerCompany: customer.company,
      customerEmail: customer.email,
      planId: plan.id,
      planName: plan.name,
      billingFrequency: plan.billingFrequency,
      stage: data.stage || 'Draft', // Draft -> Quotation -> Confirmed -> Active -> Closed
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      expiryDate: data.expiryDate || '2025-12-31',
      nextBillingDate: data.startDate || new Date().toISOString().split('T')[0],
      paymentTerms: data.paymentTerms || 'Net 15',
      autoRenew: plan.autoRenew ?? true,
      lastBilledDate: null,
      lines,
      subtotal: netSubtotal,
      taxTotal,
      recurringTotal,
      discountCode: data.discountCode || ''
    }

    setSubscriptions(prev => [newSub, ...prev])
    return newSub
  }

  const updateSubscriptionStage = (subId, newStage) => {
    setSubscriptions(prev => prev.map(s => {
      if (s.id === subId) {
        return { ...s, stage: newStage }
      }
      return s
    }))
  }

  // --- 6. BILLING DAY & AUTOMATED INVOICING ENGINE ---
  const runBillingCycle = () => {
    const today = new Date().toISOString().split('T')[0]
    const createdInvoices = []
    let updatedSubs = [...subscriptions]

    // Find all active subscriptions due for billing
    updatedSubs = updatedSubs.map(sub => {
      if (sub.stage === 'Active') {
        // Anti-double-billing check: ensure not already billed for this month/cycle
        const alreadyBilledThisCycle = invoices.some(
          inv => inv.subscriptionId === sub.id && inv.issueDate === today
        )

        if (!alreadyBilledThisCycle) {
          const invId = `INV-${2049 + invoices.length + createdInvoices.length}`
          const customer = customers.find(c => c.id === sub.customerId) || {
            name: sub.customerName,
            company: sub.customerCompany,
            email: sub.customerEmail,
            address: 'Corporate Headquarters, India',
            taxId: '29AABC1234F1Z5'
          }

          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + 15)

          const invLines = sub.lines.map(l => ({
            item: `${l.productName} (${l.variantName || 'Standard'})`,
            qty: l.quantity,
            rate: l.unitPrice,
            amount: l.quantity * l.unitPrice
          }))

          if (sub.discountCode) {
            const discCheck = validateDiscount(sub.discountCode, sub.subtotal, 1)
            if (discCheck.valid) {
              invLines.push({
                item: `Applied Discount: ${sub.discountCode}`,
                qty: 1,
                rate: -discCheck.discountAmount,
                amount: -discCheck.discountAmount
              })
            }
          }

          const subtotal = invLines.reduce((acc, l) => acc + l.amount, 0)
          const taxRate = 18
          const taxAmount = Math.round((subtotal * taxRate) / 100)
          const totalAmount = subtotal + taxAmount

          const newInvoice = {
            id: invId,
            invoiceNumber: invId,
            subscriptionId: sub.id,
            customerId: sub.customerId,
            customerName: sub.customerName,
            customerCompany: sub.customerCompany,
            customerEmail: sub.customerEmail,
            customerAddress: customer.address,
            customerTaxId: customer.taxId,
            billingPeriod: `${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} Cycle`,
            issueDate: today,
            dueDate: dueDate.toISOString().split('T')[0],
            status: 'Confirmed', // Ready to send or collect
            paymentTerms: sub.paymentTerms,
            subtotal,
            discountAmount: 0,
            taxRate,
            taxAmount,
            totalAmount,
            paidAmount: 0,
            balanceDue: totalAmount,
            lines: invLines,
            auditLog: [
              { action: `Automated Billing Engine: generated from subscription ${sub.id}`, timestamp: new Date().toLocaleString() },
              { action: `Taxes computed automatically (GST 18%: ₹${taxAmount.toLocaleString()})`, timestamp: new Date().toLocaleString() },
              { action: 'Dispatched to customer billing contacts', timestamp: new Date().toLocaleString() }
            ]
          }

          createdInvoices.push(newInvoice)
          return { ...sub, lastBilledDate: today }
        }
      }
      return sub
    })

    if (createdInvoices.length > 0) {
      setInvoices(prev => [...createdInvoices, ...prev])
      setSubscriptions(updatedSubs)
    }

    return {
      count: createdInvoices.length,
      invoices: createdInvoices
    }
  }

  const createInvoiceFromSubscription = (subId) => {
    const sub = subscriptions.find(s => s.id === subId)
    if (!sub) return null

    const today = new Date().toISOString().split('T')[0]
    const invId = `INV-${2049 + invoices.length}`
    const customer = customers.find(c => c.id === sub.customerId) || {
      name: sub.customerName,
      company: sub.customerCompany,
      email: sub.customerEmail,
      address: 'Corporate Headquarters, India',
      taxId: '29AABC1234F1Z5'
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 15)

    const invLines = sub.lines.map(l => ({
      item: `${l.productName} (${l.variantName || 'Standard'})`,
      qty: l.quantity,
      rate: l.unitPrice,
      amount: l.quantity * l.unitPrice
    }))

    const subtotal = invLines.reduce((acc, l) => acc + l.amount, 0)
    const taxRate = 18
    const taxAmount = Math.round((subtotal * taxRate) / 100)
    const totalAmount = subtotal + taxAmount

    const newInvoice = {
      id: invId,
      invoiceNumber: invId,
      subscriptionId: sub.id,
      customerId: sub.customerId,
      customerName: sub.customerName,
      customerCompany: sub.customerCompany,
      customerEmail: sub.customerEmail,
      customerAddress: customer.address,
      customerTaxId: customer.taxId,
      billingPeriod: `Ad-hoc / ${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`,
      issueDate: today,
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Confirmed',
      paymentTerms: sub.paymentTerms,
      subtotal,
      discountAmount: 0,
      taxRate,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      balanceDue: totalAmount,
      lines: invLines,
      auditLog: [
        { action: `Manual invoice created from subscription ${sub.id}`, timestamp: new Date().toLocaleString() }
      ]
    }

    setInvoices(prev => [newInvoice, ...prev])
    return newInvoice
  }

  const updateInvoiceStatus = (invId, newStatus) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invId) {
        return {
          ...inv,
          status: newStatus,
          auditLog: [
            ...(inv.auditLog || []),
            { action: `Status updated to ${newStatus}`, timestamp: new Date().toLocaleString() }
          ]
        }
      }
      return inv
    }))
  }

  // --- 7. PAYMENTS & RECONCILIATION ---
  const recordPayment = ({ invoiceId, method, amount, date, reference, note }) => {
    const inv = invoices.find(i => i.id === invoiceId)
    if (!inv) return { success: false, error: 'Invoice not found' }

    const payAmount = Number(amount) || 0
    if (payAmount <= 0) return { success: false, error: 'Payment amount must be greater than zero' }

    const newPayId = `PAY-${7722 + payments.length}`
    const newPayment = {
      id: newPayId,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      company: inv.customerCompany,
      method: method || 'Bank transfer',
      amount: payAmount,
      date: date || new Date().toISOString().split('T')[0],
      reference: reference || `REF/${Date.now().toString().slice(-8)}`,
      note: note || `Payment of ₹${payAmount.toLocaleString()} applied to ${inv.invoiceNumber}`,
      status: 'Settled'
    }

    // Reconcile Invoice
    const updatedPaid = (inv.paidAmount || 0) + payAmount
    const newBalance = Math.max(0, inv.totalAmount - updatedPaid)
    const newStatus = newBalance === 0 ? 'Paid' : 'Pending'

    setInvoices(prev => prev.map(i => {
      if (i.id === invoiceId) {
        return {
          ...i,
          paidAmount: updatedPaid,
          balanceDue: newBalance,
          status: newStatus,
          auditLog: [
            ...(i.auditLog || []),
            { action: `Payment of ₹${payAmount.toLocaleString()} received via ${method} (${newPayment.reference})`, timestamp: new Date().toLocaleString() }
          ]
        }
      }
      return i
    }))

    setPayments(prev => [newPayment, ...prev])
    return { success: true, payment: newPayment, newStatus, newBalance }
  }

  // --- 8. STAFF MANAGEMENT (ADMIN ONLY) ---
  const addStaff = ({ name, email, title }) => {
    const newUserId = `USR-${String(users.length + 1).padStart(3, '0')}`
    const newStaff = {
      id: newUserId,
      name,
      email: email.trim(),
      role: 'staff',
      title: title || 'Operations Specialist',
      initials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      avatarTone: 'teal'
    }
    setUsers(prev => [...prev, newStaff])
    return newStaff
  }

  // --- 9. RESET DEMO DATA ---
  const resetToDemoData = () => {
    localStorage.clear()
    setUsers(initialUsers)
    setCurrentUser(initialUsers[0])
    setCustomers(initialCustomers)
    setProducts(initialProducts)
    setPlans(initialPlans)
    setTaxes(initialTaxes)
    setDiscounts(initialDiscounts)
    setSubscriptions(initialSubscriptions)
    setInvoices(initialInvoices)
    setPayments(initialPayments)
  }

  // --- COMPUTED FINANCIAL AGGREGATES FOR FAST DASHBOARD ---
  const activeSubs = subscriptions.filter(s => s.stage === 'Active')
  const totalMRR = activeSubs.reduce((acc, s) => {
    if (s.billingFrequency === 'Yearly') return acc + Math.round(s.recurringTotal / 12)
    return acc + s.recurringTotal
  }, 0)
  const totalARR = totalMRR * 12
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0)
  const totalOutstanding = invoices
    .filter(i => i.status !== 'Paid' && i.status !== 'Cancelled')
    .reduce((acc, i) => acc + (i.balanceDue ?? (i.totalAmount - (i.paidAmount || 0))), 0)
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue')
  const overdueTotal = overdueInvoices.reduce((acc, i) => acc + (i.balanceDue || i.totalAmount), 0)

  return (
    <SubscriptionContext.Provider
      value={{
        users,
        currentUser,
        switchUser,
        validatePasswordRules,
        signUp,
        customers,
        products,
        addProduct,
        plans,
        addPlan,
        taxes,
        discounts,
        addDiscount,
        validateDiscount,
        subscriptions,
        createSubscription,
        updateSubscriptionStage,
        invoices,
        runBillingCycle,
        createInvoiceFromSubscription,
        updateInvoiceStatus,
        payments,
        recordPayment,
        addStaff,
        resetToDemoData,
        // Computed metrics
        activeSubs,
        totalMRR,
        totalARR,
        totalCollected,
        totalOutstanding,
        overdueInvoices,
        overdueTotal
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider')
  }
  return context
}

