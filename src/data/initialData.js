export const initialUsers = [
  {
    id: 'USR-001',
    name: 'Priya Sharma',
    email: 'priya@brightloop.in',
    role: 'admin',
    title: 'System Administrator & Founder',
    initials: 'PS',
    avatarTone: 'violet'
  },
  {
    id: 'USR-002',
    name: 'Aman Verma',
    email: 'aman@brightloop.in',
    role: 'staff',
    title: 'Billing & Operations Lead',
    initials: 'AV',
    avatarTone: 'blue'
  },
  {
    id: 'USR-003',
    name: 'Kavya Rao',
    email: 'kavya@brightloop.in',
    role: 'staff',
    title: 'Customer Success & Accounts',
    initials: 'KR',
    avatarTone: 'teal'
  },
  {
    id: 'USR-004',
    name: 'Rohan Mehta',
    email: 'rohan@mehta.co',
    company: 'Mehta & Co.',
    role: 'customer',
    title: 'Director of Technology',
    customerId: 'CUST-001',
    initials: 'RM',
    avatarTone: 'violet'
  }
]

export const initialCustomers = [
  {
    id: 'CUST-001',
    name: 'Rohan Mehta',
    company: 'Mehta & Co.',
    email: 'rohan@mehta.co',
    phone: '+91 98200 12345',
    address: '402 Trade Centre, Nariman Point, Mumbai 400021',
    taxId: '27AABCM1234F1Z8',
    plan: 'Scale Plan',
    status: 'Active',
    joined: '12 Sep 2024',
    totalSpent: 124000,
    activeSubscriptions: 2,
    initials: 'RM',
    color: 'violet'
  },
  {
    id: 'CUST-002',
    name: 'Ananya Iyer',
    company: 'Iyer Studios',
    email: 'ananya@iyerstudios.in',
    phone: '+91 98450 67890',
    address: '88 Indiranagar 100ft Road, Bengaluru 560038',
    taxId: '29AABCI5678K1Z3',
    plan: 'Growth Plan',
    status: 'Active',
    joined: '04 Sep 2024',
    totalSpent: 86400,
    activeSubscriptions: 1,
    initials: 'AI',
    color: 'orange'
  },
  {
    id: 'CUST-003',
    name: 'Arjun Nair',
    company: 'Nair Logistics',
    email: 'arjun@nairlogistics.com',
    phone: '+91 94470 33445',
    address: '14 Willington Island, Kochi 682003',
    taxId: '32AABCN9012P1Z1',
    plan: 'Enterprise Annual',
    status: 'Active',
    joined: '28 Aug 2024',
    totalSpent: 248000,
    activeSubscriptions: 1,
    initials: 'AN',
    color: 'teal'
  },
  {
    id: 'CUST-004',
    name: 'Neha Kapoor',
    company: 'Kapoor Retail',
    email: 'neha@kapoorretail.in',
    phone: '+91 98110 55667',
    address: '19 Connaught Place, New Delhi 110001',
    taxId: '07AABCK3456L1Z4',
    plan: 'Starter Plan',
    status: 'Paused',
    joined: '19 Aug 2024',
    totalSpent: 38700,
    activeSubscriptions: 1,
    initials: 'NK',
    color: 'blue'
  },
  {
    id: 'CUST-005',
    name: 'Vikram Shah',
    company: 'Shah & Sons',
    email: 'vikram@shahandsons.in',
    phone: '+91 98250 88990',
    address: '55 Ashram Road, Ahmedabad 380009',
    taxId: '24AABCS7890N1Z2',
    plan: 'Growth Plan',
    status: 'Active',
    joined: '07 Aug 2024',
    totalSpent: 72200,
    activeSubscriptions: 1,
    initials: 'VS',
    color: 'pink'
  }
]

export const initialProducts = [
  {
    id: 'PROD-001',
    name: 'Brightloop CRM Core',
    type: 'Software',
    salesPrice: 2000,
    costPrice: 600,
    notes: 'Primary customer relationship & pipeline management system.',
    status: 'Active',
    variants: [
      { id: 'VAR-001', name: 'Standard Cloud Edition', priceDelta: 0 },
      { id: 'VAR-002', name: 'Odoo Brand Integrated', priceDelta: 560 }, // Directly fulfills "choosing the Odoo brand adds 560 to the price"
      { id: 'VAR-003', name: 'Enterprise Dedicated Single-Tenant', priceDelta: 1200 }
    ]
  },
  {
    id: 'PROD-002',
    name: 'Cloud ERP Suite',
    type: 'Software',
    salesPrice: 4500,
    costPrice: 1500,
    notes: 'Financial ledger, inventory tracking and recurring billing backend.',
    status: 'Active',
    variants: [
      { id: 'VAR-004', name: 'Multi-Tenant Standard', priceDelta: 0 },
      { id: 'VAR-005', name: 'High Availability Multi-Region', priceDelta: 800 }
    ]
  },
  {
    id: 'PROD-003',
    name: 'Insight Analytics Engine',
    type: 'Add-on',
    salesPrice: 1200,
    costPrice: 300,
    notes: 'Cohort retention, MRR movements and churn dynamic forecasting.',
    status: 'Active',
    variants: [
      { id: 'VAR-006', name: 'Standard Reporting Pack', priceDelta: 0 },
      { id: 'VAR-007', name: 'AI Forecast Module', priceDelta: 400 }
    ]
  },
  {
    id: 'PROD-004',
    name: 'Priority 24/7 SLA Support',
    type: 'Service',
    salesPrice: 800,
    costPrice: 250,
    notes: 'Guaranteed 1-hour ticket response and assigned technical manager.',
    status: 'Active',
    variants: [
      { id: 'VAR-008', name: 'Standard Business Hours', priceDelta: 0 },
      { id: 'VAR-009', name: '24/7 Mission-Critical SLA', priceDelta: 600 }
    ]
  },
  {
    id: 'PROD-005',
    name: 'Automated Payment Webhook Bridge',
    type: 'Add-on',
    salesPrice: 1500,
    costPrice: 400,
    notes: 'Real-time bank API integration for automated balance matching.',
    status: 'Draft',
    variants: [
      { id: 'VAR-010', name: 'Standard Webhook Rate', priceDelta: 0 }
    ]
  }
]

export const initialPlans = [
  {
    id: 'PLAN-001',
    name: 'Starter Plan',
    code: 'starter',
    price: 1200,
    billingFrequency: 'Monthly', // Daily, Weekly, Monthly, Yearly
    minQuantity: 1,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    autoCloseOnEnd: false,
    allowEarlyTermination: true,
    allowPause: true,
    autoRenew: true,
    description: 'Designed for small boutique shops needing clean subscription billing.'
  },
  {
    id: 'PLAN-002',
    name: 'Growth Plan',
    code: 'growth',
    price: 2000,
    billingFrequency: 'Monthly',
    minQuantity: 3,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    autoCloseOnEnd: false,
    allowEarlyTermination: true,
    allowPause: true,
    autoRenew: true,
    description: 'Optimal for scaling teams with multi-seat CRM and recurring add-ons.'
  },
  {
    id: 'PLAN-003',
    name: 'Scale Plan',
    code: 'scale',
    price: 5000,
    billingFrequency: 'Monthly',
    minQuantity: 5,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    autoCloseOnEnd: false,
    allowEarlyTermination: true,
    allowPause: true,
    autoRenew: true,
    description: 'Full feature access with high-capacity API limits and priority SLA.'
  },
  {
    id: 'PLAN-004',
    name: 'Enterprise Annual',
    code: 'enterprise',
    price: 48000,
    billingFrequency: 'Yearly',
    minQuantity: 10,
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    autoCloseOnEnd: true, // Closes on its own when it ends
    allowEarlyTermination: false,
    allowPause: false,
    autoRenew: false,
    description: 'Custom tailored enterprise contract with dedicated account review.'
  }
]

export const initialTaxes = [
  { id: 'TAX-001', name: 'GST 18% (Standard B2B)', rate: 18, isDefault: true },
  { id: 'TAX-002', name: 'Interstate IGST 18%', rate: 18, isDefault: false },
  { id: 'TAX-003', name: 'Zero Rated / SEZ Export', rate: 0, isDefault: false }
]

export const initialDiscounts = [
  {
    id: 'DISC-001',
    code: 'WELCOME20',
    type: 'percentage', // percentage or fixed
    value: 20,
    minAmount: 10000,
    minQuantity: 2,
    startDate: '2024-01-01',
    endDate: '2024-11-30',
    maxUsage: 100,
    usedCount: 84,
    scope: 'all', // all or specific_product
    status: 'Active',
    description: '20% off for new enterprise onboarding'
  },
  {
    id: 'DISC-002',
    code: 'ANNUAL10',
    type: 'percentage',
    value: 10,
    minAmount: 30000,
    minQuantity: 5,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    maxUsage: 50,
    usedCount: 32,
    scope: 'all',
    status: 'Active',
    description: '10% volume discount for annual commitments'
  },
  {
    id: 'DISC-003',
    code: 'SEATS500',
    type: 'fixed',
    value: 500,
    minAmount: 5000,
    minQuantity: 4,
    startDate: '2024-01-01',
    endDate: '2024-10-15',
    maxUsage: 100,
    usedCount: 100,
    scope: 'all',
    status: 'Expired', // Ran out of uses and passed date
    description: 'Flat ₹500 discount on team seat expansions'
  },
  {
    id: 'DISC-004',
    code: 'ODOOPROMO',
    type: 'fixed',
    value: 560,
    minAmount: 2500,
    minQuantity: 1,
    startDate: '2024-05-01',
    endDate: '2024-12-31',
    maxUsage: 200,
    usedCount: 142,
    scope: 'all',
    status: 'Active',
    description: 'Full credit for Odoo brand edition integration'
  }
]

export const initialSubscriptions = [
  {
    id: 'SUB-2024-001',
    customerId: 'CUST-001',
    customerName: 'Rohan Mehta',
    customerCompany: 'Mehta & Co.',
    customerEmail: 'rohan@mehta.co',
    planId: 'PLAN-003',
    planName: 'Scale Plan',
    billingFrequency: 'Monthly',
    stage: 'Active', // Draft -> Quotation -> Confirmed -> Active -> Closed (or Paused)
    startDate: '2024-05-01',
    expiryDate: '2025-04-30',
    nextBillingDate: '2024-10-31',
    paymentTerms: 'Net 15',
    autoRenew: true,
    lastBilledDate: '2024-09-30',
    lines: [
      {
        productId: 'PROD-001',
        productName: 'Brightloop CRM Core',
        variantName: 'Odoo Brand Integrated',
        priceDelta: 560,
        unitPrice: 2560,
        quantity: 8,
        taxRate: 18,
        discountCode: 'WELCOME20',
        amount: 16384 // (2560 * 8) - 20%
      },
      {
        productId: 'PROD-003',
        productName: 'Insight Analytics Engine',
        variantName: 'AI Forecast Module',
        priceDelta: 400,
        unitPrice: 1600,
        quantity: 2,
        taxRate: 18,
        discountCode: '',
        amount: 3200
      },
      {
        productId: 'PROD-004',
        productName: 'Priority 24/7 SLA Support',
        variantName: '24/7 Mission-Critical SLA',
        priceDelta: 600,
        unitPrice: 1400,
        quantity: 1,
        taxRate: 18,
        discountCode: '',
        amount: 1400
      }
    ],
    subtotal: 20984,
    taxTotal: 3777,
    recurringTotal: 24761
  },
  {
    id: 'SUB-2024-002',
    customerId: 'CUST-002',
    customerName: 'Ananya Iyer',
    customerCompany: 'Iyer Studios',
    customerEmail: 'ananya@iyerstudios.in',
    planId: 'PLAN-002',
    planName: 'Growth Plan',
    billingFrequency: 'Monthly',
    stage: 'Active',
    startDate: '2024-06-01',
    expiryDate: '2025-05-31',
    nextBillingDate: '2024-10-31',
    paymentTerms: 'Due on Receipt',
    autoRenew: true,
    lastBilledDate: '2024-09-30',
    lines: [
      {
        productId: 'PROD-001',
        productName: 'Brightloop CRM Core',
        variantName: 'Standard Cloud Edition',
        priceDelta: 0,
        unitPrice: 2000,
        quantity: 5,
        taxRate: 18,
        discountCode: '',
        amount: 10000
      },
      {
        productId: 'PROD-003',
        productName: 'Insight Analytics Engine',
        variantName: 'Standard Reporting Pack',
        priceDelta: 0,
        unitPrice: 1200,
        quantity: 2,
        taxRate: 18,
        discountCode: '',
        amount: 2400
      }
    ],
    subtotal: 12400,
    taxTotal: 2232,
    recurringTotal: 14632
  },
  {
    id: 'SUB-2024-003',
    customerId: 'CUST-003',
    customerName: 'Arjun Nair',
    customerCompany: 'Nair Logistics',
    customerEmail: 'arjun@nairlogistics.com',
    planId: 'PLAN-004',
    planName: 'Enterprise Annual',
    billingFrequency: 'Yearly',
    stage: 'Active',
    startDate: '2024-08-01',
    expiryDate: '2025-07-31',
    nextBillingDate: '2024-10-31',
    paymentTerms: 'Net 30',
    autoRenew: false,
    lastBilledDate: '2024-08-01',
    lines: [
      {
        productId: 'PROD-002',
        productName: 'Cloud ERP Suite',
        variantName: 'High Availability Multi-Region',
        priceDelta: 800,
        unitPrice: 5300,
        quantity: 12,
        taxRate: 18,
        discountCode: 'ANNUAL10',
        amount: 57240
      }
    ],
    subtotal: 57240,
    taxTotal: 10303,
    recurringTotal: 67543
  },
  {
    id: 'SUB-2024-004',
    customerId: 'CUST-004',
    customerName: 'Neha Kapoor',
    customerCompany: 'Kapoor Retail',
    customerEmail: 'neha@kapoorretail.in',
    planId: 'PLAN-001',
    planName: 'Starter Plan',
    billingFrequency: 'Monthly',
    stage: 'Paused',
    startDate: '2024-07-15',
    expiryDate: '2025-07-14',
    nextBillingDate: '2024-11-15',
    paymentTerms: 'Due on Receipt',
    autoRenew: true,
    lastBilledDate: '2024-08-15',
    lines: [
      {
        productId: 'PROD-001',
        productName: 'Brightloop CRM Core',
        variantName: 'Standard Cloud Edition',
        priceDelta: 0,
        unitPrice: 2000,
        quantity: 2,
        taxRate: 18,
        discountCode: '',
        amount: 4000
      }
    ],
    subtotal: 4000,
    taxTotal: 720,
    recurringTotal: 4720
  },
  {
    id: 'SUB-2024-005',
    customerId: 'CUST-005',
    customerName: 'Vikram Shah',
    customerCompany: 'Shah & Sons',
    customerEmail: 'vikram@shahandsons.in',
    planId: 'PLAN-002',
    planName: 'Growth Plan',
    billingFrequency: 'Monthly',
    stage: 'Quotation', // Moving through Draft -> Quotation -> Confirmed
    startDate: '2024-11-01',
    expiryDate: '2025-10-31',
    nextBillingDate: '2024-11-01',
    paymentTerms: 'Net 15',
    autoRenew: true,
    lastBilledDate: null,
    lines: [
      {
        productId: 'PROD-001',
        productName: 'Brightloop CRM Core',
        variantName: 'Odoo Brand Integrated',
        priceDelta: 560,
        unitPrice: 2560,
        quantity: 10,
        taxRate: 18,
        discountCode: 'ANNUAL10',
        amount: 23040
      }
    ],
    subtotal: 23040,
    taxTotal: 4147,
    recurringTotal: 27187
  }
]

export const initialInvoices = [
  {
    id: 'INV-2048',
    invoiceNumber: 'INV-2048',
    subscriptionId: 'SUB-2024-001',
    customerId: 'CUST-001',
    customerName: 'Rohan Mehta',
    customerCompany: 'Mehta & Co.',
    customerEmail: 'rohan@mehta.co',
    customerAddress: '402 Trade Centre, Nariman Point, Mumbai 400021',
    customerTaxId: '27AABCM1234F1Z8',
    billingPeriod: '01 Oct 2024 – 31 Oct 2024',
    issueDate: '2024-10-15',
    dueDate: '2024-10-31',
    status: 'Paid', // Draft, Confirmed, Paid, Cancelled, Overdue
    paymentTerms: 'Net 15',
    subtotal: 21017,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 3783,
    totalAmount: 24800,
    paidAmount: 24800,
    balanceDue: 0,
    lines: [
      { item: 'Brightloop CRM (Odoo Edition)', qty: 8, rate: 2560, amount: 20480 },
      { item: 'Insight Analytics Engine', qty: 2, rate: 1600, amount: 3200 },
      { item: 'Priority 24/7 SLA Support', qty: 1, rate: 1400, amount: 1400 },
      { item: 'Discount: WELCOME20 (20%)', qty: 1, rate: -4063, amount: -4063 }
    ],
    auditLog: [
      { action: 'Invoice created from subscription SUB-2024-001', timestamp: '15 Oct 2024, 09:30' },
      { action: 'Confirmed and sent to rohan@mehta.co', timestamp: '15 Oct 2024, 09:32' },
      { action: 'Full payment received via UPI (₹24,800)', timestamp: '31 Oct 2024, 11:20' }
    ]
  },
  {
    id: 'INV-2047',
    invoiceNumber: 'INV-2047',
    subscriptionId: 'SUB-2024-002',
    customerId: 'CUST-002',
    customerName: 'Ananya Iyer',
    customerCompany: 'Iyer Studios',
    customerEmail: 'ananya@iyerstudios.in',
    customerAddress: '88 Indiranagar 100ft Road, Bengaluru 560038',
    customerTaxId: '29AABCI5678K1Z3',
    billingPeriod: '01 Oct 2024 – 31 Oct 2024',
    issueDate: '2024-10-15',
    dueDate: '2024-10-30',
    status: 'Paid',
    paymentTerms: 'Due on Receipt',
    subtotal: 15678,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 2822,
    totalAmount: 18500,
    paidAmount: 18500,
    balanceDue: 0,
    lines: [
      { item: 'Brightloop CRM Core (Standard)', qty: 5, rate: 2000, amount: 10000 },
      { item: 'Insight Analytics Module', qty: 2, rate: 1200, amount: 2400 },
      { item: 'Custom Onboarding Service', qty: 1, rate: 3278, amount: 3278 }
    ],
    auditLog: [
      { action: 'Invoice generated automatically', timestamp: '15 Oct 2024, 09:30' },
      { action: 'Payment settled via Credit Card (₹18,500)', timestamp: '30 Oct 2024, 14:15' }
    ]
  },
  {
    id: 'INV-2046',
    invoiceNumber: 'INV-2046',
    subscriptionId: 'SUB-2024-003',
    customerId: 'CUST-003',
    customerName: 'Arjun Nair',
    customerCompany: 'Nair Logistics',
    customerEmail: 'arjun@nairlogistics.com',
    customerAddress: '14 Willington Island, Kochi 682003',
    customerTaxId: '32AABCN9012P1Z1',
    billingPeriod: '01 Oct 2024 – 31 Oct 2024',
    issueDate: '2024-10-01',
    dueDate: '2024-10-25', // Past due date -> Overdue!
    status: 'Overdue',
    paymentTerms: 'Net 15',
    subtotal: 35593,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 6407,
    totalAmount: 42000,
    paidAmount: 20000, // Partial payment recorded!
    balanceDue: 22000,
    lines: [
      { item: 'Cloud ERP Suite (High Availability)', qty: 12, rate: 3500, amount: 42000 }
    ],
    auditLog: [
      { action: 'Generated from Enterprise Annual Contract', timestamp: '01 Oct 2024, 08:00' },
      { action: 'Partial bank transfer recorded (₹20,000)', timestamp: '29 Oct 2024, 16:45' },
      { action: 'Overdue notice triggered (Balance: ₹22,000)', timestamp: '26 Oct 2024, 00:01' }
    ]
  },
  {
    id: 'INV-2045',
    invoiceNumber: 'INV-2045',
    subscriptionId: 'SUB-2024-004',
    customerId: 'CUST-004',
    customerName: 'Neha Kapoor',
    customerCompany: 'Kapoor Retail',
    customerEmail: 'neha@kapoorretail.in',
    customerAddress: '19 Connaught Place, New Delhi 110001',
    customerTaxId: '07AABCK3456L1Z4',
    billingPeriod: '01 Oct 2024 – 31 Oct 2024',
    issueDate: '2024-10-20',
    dueDate: '2024-11-05',
    status: 'Pending',
    paymentTerms: 'Net 15',
    subtotal: 10932,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 1968,
    totalAmount: 12900,
    paidAmount: 0,
    balanceDue: 12900,
    lines: [
      { item: 'Brightloop CRM Core (2 seats)', qty: 2, rate: 2000, amount: 4000 },
      { item: 'Annual Archival Storage Addon', qty: 1, rate: 6932, amount: 6932 }
    ],
    auditLog: [
      { action: 'Invoice generated from subscription SUB-2024-004', timestamp: '20 Oct 2024, 10:15' },
      { action: 'Dispatched to customer billing email', timestamp: '20 Oct 2024, 10:18' }
    ]
  }
]

export const initialPayments = [
  {
    id: 'PAY-7721',
    invoiceId: 'INV-2048',
    invoiceNumber: 'INV-2048',
    customerId: 'CUST-001',
    customerName: 'Rohan Mehta',
    company: 'Mehta & Co.',
    method: 'UPI',
    amount: 24800,
    date: '2024-10-31',
    reference: 'UPI/AXIS/893104812301',
    note: 'Settled in full for October cycle',
    status: 'Settled'
  },
  {
    id: 'PAY-7720',
    invoiceId: 'INV-2047',
    invoiceNumber: 'INV-2047',
    customerId: 'CUST-002',
    customerName: 'Ananya Iyer',
    company: 'Iyer Studios',
    method: 'Credit card',
    amount: 18500,
    date: '2024-10-30',
    reference: 'STRIPE_CH_3N9A1B2C8',
    note: 'Auto-charged through stored corporate Visa card',
    status: 'Settled'
  },
  {
    id: 'PAY-7719',
    invoiceId: 'INV-2046',
    invoiceNumber: 'INV-2046',
    customerId: 'CUST-003',
    customerName: 'Arjun Nair',
    company: 'Nair Logistics',
    method: 'Bank transfer',
    amount: 20000,
    date: '2024-10-29',
    reference: 'NEFT/HDFC0000123/99812',
    note: 'Partial payment on invoice INV-2046 (Remaining: ₹22,000)',
    status: 'Settled'
  }
]

