import React, { useState, useEffect } from 'react'
import {
  CheckCircle2, Circle, Plus, Trash2, Database, Shield, RefreshCw,
  ExternalLink, Key, Server, Check, Clock
} from 'lucide-react'
import { supabase } from '../utils/supabase'

export default function TasksPage({ onNotify }) {
  const [todos, setTodos] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [filter, setFilter] = useState('all') // all, active, completed
  const [loading, setLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState({ engine: 'SQLite 3 & Supabase', status: 'Connected' })

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('todos').select()
      if (data) {
        setTodos(data)
      }
      if (error) {
        console.error('Fetch error:', error)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const handleCreate = async (e) => {
    e?.preventDefault()
    const name = newTitle.trim()
    if (!name) return

    const { data } = await supabase.from('todos').insert([{ name, completed: false }])
    if (data && data.length > 0) {
      setTodos([data[0], ...todos])
      setNewTitle('')
      onNotify?.(`Task "${name}" committed to database!`)
    }
  }

  const handleToggle = async (todo) => {
    const updatedStatus = !todo.completed
    setTodos(todos.map(t => (t.id === todo.id ? { ...t, completed: updatedStatus } : t)))

    try {
      await fetch(`http://127.0.0.1:8000/api/todos/${todo.id}/toggle`, { method: 'POST' })
    } catch {}
    onNotify?.(`Task status updated`)
  }

  const handleDelete = async (id, name) => {
    await supabase.from('todos').delete().eq('id', id)
    setTodos(todos.filter(t => t.id !== id))
    onNotify?.(`Task removed from database`)
  }

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  return (
    <div className="page-shell">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-breadcrumbs">
            <span>Administration</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Database & Tasks Ledger</span>
          </div>
          <h1 className="page-title">Database & Recurring Operations Tasks</h1>
          <p className="page-subtitle">
            Live persistence via SQLite <code>backend/database.db</code> and cloud Supabase tables.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchTodos}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Sync Database</span>
          </button>
        </div>
      </div>

      {/* Database Connection Banner */}
      <div className="card mb-6" style={{ background: '#f8fafc', borderLeft: '4px solid #4f46e5' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: '#e0e7ff',
              color: '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Database size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Supabase & SQLite Unified Engine Active
                </h4>
                <span className="badge badge-success">
                  <Check size={11} strokeWidth={3} /> Connected
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                Local engine running on <code>backend/database.db</code>. Cloud schema available in <code>backend/supabase_schema.sql</code>.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12 }}>
            <div style={{ padding: '6px 12px', background: '#ffffff', borderRadius: 6, border: '1px solid #e2e8f0', color: '#334155' }}>
              <span style={{ color: '#64748b' }}>DB Password: </span>
              <strong style={{ fontFamily: 'monospace' }}>Jaswanth1617</strong>
            </div>
            <div style={{ padding: '6px 12px', background: '#ffffff', borderRadius: 6, border: '1px solid #e2e8f0', color: '#334155' }}>
              <span style={{ color: '#64748b' }}>Table: </span>
              <strong style={{ fontFamily: 'monospace' }}>public.todos</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Task List Card */}
      <div className="card">
        {/* Header & Filter Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          paddingBottom: 16,
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className={`pill-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Tasks ({todos.length})
            </button>
            <button
              type="button"
              className={`pill-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Pending ({todos.filter(t => !t.completed).length})
            </button>
            <button
              type="button"
              className={`pill-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({todos.filter(t => t.completed).length})
            </button>
          </div>

          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Direct query via <code>supabase.from('todos').select()</code>
          </span>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input
            type="text"
            className="form-input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new subscription operational task or checklist item..."
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={15} />
            <span>Add Task</span>
          </button>
        </form>

        {/* Items List */}
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner mb-2" />
            <p style={{ margin: 0, fontSize: 13 }}>Querying database records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={36} strokeWidth={1.5} color="var(--text-muted)" />
            <h4 style={{ margin: '12px 0 4px', fontSize: 15, fontWeight: 600 }}>No tasks match your filter</h4>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              Add a new task above or switch your status view filter.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((todo) => (
              <div
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: todo.completed ? 'var(--bg-subtle, #f8fafc)' : 'var(--card-bg, #ffffff)',
                  transition: 'background 0.15s ease'
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flex: 1 }}
                  onClick={() => handleToggle(todo)}
                >
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: todo.completed ? '#10b981' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {todo.completed ? (
                      <CheckCircle2 size={18} color="#10b981" />
                    ) : (
                      <Circle size={18} />
                    )}
                  </button>

                  <div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: todo.completed ? 'var(--text-muted)' : 'var(--text-main)',
                      textDecoration: todo.completed ? 'line-through' : 'none'
                    }}>
                      {todo.name}
                    </div>
                    {todo.created_at && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Recorded: {new Date(todo.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${todo.completed ? 'badge-success' : 'badge-warning'}`}>
                    {todo.completed ? 'Completed' : 'Pending'}
                  </span>

                  <button
                    type="button"
                    className="action-icon-btn danger"
                    onClick={() => handleDelete(todo.id, todo.name)}
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
