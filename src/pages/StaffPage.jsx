import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Plus, ShieldAlert, User, Mail, Briefcase, Check } from 'lucide-react'
import { useSubscriptions } from '../context/SubscriptionContext'

export default function StaffPage({ onNotify }) {
  const { users, currentUser, addStaff } = useSubscriptions()
  const isAdmin = currentUser.role === 'admin'

  const staffMembers = users.filter(u => u.role === 'admin' || u.role === 'staff')

  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('Operations Specialist')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    const newMember = addStaff({
      name: name.trim(),
      email: email.trim(),
      title: title.trim()
    })

    setShowAddModal(false)
    setName('')
    setEmail('')
    onNotify?.(`New staff member ${newMember.name} added with operational permissions.`)
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> Role-Based Access Control (RBAC)
          </div>
          <h1>Staff Management & Permissions</h1>
          <p>
            Assign operational permissions across customer billing, quotation processing, and financial reporting. Only administrators can invite new staff.
          </p>
        </div>
        <div>
          {isAdmin ? (
            <button className="primary-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={16} strokeWidth={2.5} />
              Add Staff Member
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--ink-tertiary)', background: 'var(--surface-subtle)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
              <ShieldAlert size={14} /> Only Administrators Can Provision Staff
            </div>
          )}
        </div>
      </div>

      <div className="summary-strip">
        <div>
          <span>Total Internal Users</span>
          <strong>{staffMembers.length}</strong>
        </div>
        <div>
          <span>System Administrators</span>
          <strong style={{ color: 'var(--primary)' }}>{staffMembers.filter(s => s.role === 'admin').length}</strong>
        </div>
        <div>
          <span>Operations & Staff</span>
          <strong>{staffMembers.filter(s => s.role === 'staff').length}</strong>
        </div>
        <div>
          <span>Security Audit Status</span>
          <strong className="green-text">Compliant</strong>
        </div>
      </div>

      <section className="card full-table-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h2>Authorized Staff Members</h2>
            <span className="count-pill">{staffMembers.length} users</span>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role Tier</th>
                <th>Permissions Summary</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map(staff => (
                <tr key={staff.id}>
                  <td>
                    <div className="person-cell">
                      <div className={`avatar avatar-${staff.avatarTone || 'violet'}`}>
                        {staff.initials}
                      </div>
                      <div>
                        <strong>{staff.name}</strong>
                        <span>{staff.title} · {staff.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status ${staff.role === 'admin' ? 'active' : 'paid'}`}>
                      <i /> {staff.role === 'admin' ? 'Administrator' : 'Operations Staff'}
                    </span>
                  </td>
                  <td style={{ fontSize: '11.5px', color: 'var(--ink-secondary)' }}>
                    {staff.role === 'admin' ? (
                      <span>Full system control, staff provisioning, master discount creation, tax settings</span>
                    ) : (
                      <span>Customer management, quotation preparation, billing day runs, payment recording</span>
                    )}
                  </td>
                  <td>
                    <span className="status active">
                      <i /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Staff Modal (Admin Only) */}
      {showAddModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowAddModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="modal"
            onMouseDown={e => e.stopPropagation()}
            style={{ width: 'min(480px, 100%)' }}
          >
            <div className="modal-heading">
              <div>
                <div className="eyebrow">Admin Action</div>
                <h2>Provision New Staff Member</h2>
              </div>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="form-grid" style={{ marginTop: '18px' }}>
                <label className="wide">
                  Full Name
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Rahul Sen"
                    required
                    autoFocus
                  />
                </label>

                <label className="wide">
                  Corporate Email
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="rahul@brightloop.in"
                    required
                  />
                </label>

                <label className="wide">
                  Operational Title / Role
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Billing Specialist / Customer Success"
                    required
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="outline-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <Plus size={15} /> Provision Access
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  )
}

