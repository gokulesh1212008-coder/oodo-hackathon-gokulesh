import React, { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'

export default function App() {
  const [todos, setTodos] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getTodos() {
      try {
        setLoading(true)
        const { data: todosList } = await supabase.from('todos').select()
        if (todosList) {
          setTodos(todosList)
        }
      } finally {
        setLoading(false)
      }
    }

    getTodos()
  }, [])

  const handleAddTodo = async (e) => {
    e?.preventDefault()
    const name = inputVal.trim()
    if (!name) return

    const { data } = await supabase.from('todos').insert([{ name, completed: false }])
    if (data && data[0]) {
      setTodos([data[0], ...todos])
      setInputVal('')
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('todos').delete().eq('id', id)
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div style={{
      maxWidth: 680,
      margin: '40px auto',
      padding: '24px 32px',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#0f172a'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' }}>
            Database Tasks & Ledger Todos
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Synced live with SQLite & Supabase table <code>todos</code>
          </p>
        </div>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          background: '#ecfdf5',
          color: '#059669',
          padding: '4px 10px',
          borderRadius: 20,
          border: '1px solid #a7f3d0'
        }}>
          Connected DB
        </span>
      </div>

      <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Add a new subscription or database task..."
          style={{
            flex: 1,
            padding: '10px 14px',
            fontSize: 14,
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 18px',
            background: '#0f172a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          Add Task
        </button>
      </form>

      {loading ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
          Loading records from database...
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {todos.length === 0 ? (
            <li style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              No tasks found in the database. Add one above!
            </li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: todo.completed ? '#10b981' : '#f59e0b',
                    display: 'inline-block'
                  }} />
                  <span style={{
                    color: todo.completed ? '#64748b' : '#1e293b',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    fontWeight: 500
                  }}>
                    {todo.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(todo.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: 16,
                    padding: '2px 8px'
                  }}
                  title="Delete todo"
                >
                  &times;
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
