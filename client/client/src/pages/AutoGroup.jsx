import { useState, useEffect } from 'react'
import axios from 'axios'

const groupColors = {
  'Web Development': '#3b82f6',
  'Machine Learning & AI': '#8b5cf6',
  'Finite Element Analysis': '#f97316',
  'Competitive Programming': '#10b981',
  'Data Science': '#f59e0b'
}

export default function AutoGroup() {
  const [users, setUsers] = useState([])
  const [fetchingUsers, setFetchingUsers] = useState(true)
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})
  const [loadingAll, setLoadingAll] = useState(false)
  const [error, setError] = useState(null)

  // fetch users from backend on page load
  useEffect(() => {
    axios.get('/api/users')
      .then(res => {
        setUsers(res.data)
        setFetchingUsers(false)
      })
      .catch(err => {
        setError('Failed to load users from server')
        setFetchingUsers(false)
      })
  }, [])

  // assign one user
  const assignOne = async (userId) => {
    setLoading(prev => ({ ...prev, [userId]: true }))
    try {
      const res = await axios.post('/api/auto-group', { userId })
      setResults(prev => ({
        ...prev,
        [userId]: {
          group: res.data.assignedGroup,
          matchedBy: res.data.matchedBy
        }
      }))
    } catch (err) {
      console.error(err)
    }
    setLoading(prev => ({ ...prev, [userId]: false }))
  }

  // assign all users
  const assignAll = async () => {
    setLoadingAll(true)
    try {
      const res = await axios.post('/api/auto-group-all')
      const mapped = {}
      res.data.forEach(item => {
        mapped[item.userId] = {
          group: item.assignedGroup,
          matchedBy: item.matchedBy
        }
      })
      setResults(mapped)
    } catch (err) {
      console.error(err)
    }
    setLoadingAll(false)
  }

  // loading state
  if (fetchingUsers) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: '#666' }}>
        Loading users from server...
      </div>
    )
  }

  // error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>
        {error}
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0d1b4b' }}>
          AI Auto Grouping
        </h1>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Automatically assign alumni to domain groups based on their skills.
          Uses keyword matching first — Gemini AI for edge cases.
        </p>
        <button
          onClick={assignAll}
          disabled={loadingAll}
          style={{
            marginTop: '16px',
            background: '#0d1b4b',
            color: 'white',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '8px',
            cursor: loadingAll ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            opacity: loadingAll ? 0.7 : 1
          }}
        >
          {loadingAll ? 'Assigning All Users...' : 'Auto-Assign All Users'}
        </button>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        gap: '24px',
        marginBottom: '28px',
        padding: '16px 20px',
        background: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e5e7eb'
      }}>
        <div>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#0d1b4b' }}>
            {users.length}
          </span>
          <span style={{ color: '#888', marginLeft: '6px', fontSize: '14px' }}>Total Users</span>
        </div>
        <div>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>
            {Object.keys(results).length}
          </span>
          <span style={{ color: '#888', marginLeft: '6px', fontSize: '14px' }}>Assigned</span>
        </div>
        <div>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#8b5cf6' }}>
            {Object.values(results).filter(r => r.matchedBy === 'gemini').length}
          </span>
          <span style={{ color: '#888', marginLeft: '6px', fontSize: '14px' }}>Via Gemini</span>
        </div>
        <div>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#3b82f6' }}>
            {Object.values(results).filter(r => r.matchedBy === 'keyword' || r.matchedBy === 'keyword-matching').length}
          </span>
          <span style={{ color: '#888', marginLeft: '6px', fontSize: '14px' }}>Via Keywords</span>
        </div>
      </div>

      {/* User Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
        gap: '20px'
      }}>
        {users.map(user => {
          const result = results[user._id]
          const isLoading = loading[user._id]
          const groupColor = result ? (groupColors[result.group] || '#6b7280') : '#e5e7eb'

          return (
            <div key={user.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              borderTop: `4px solid ${groupColor}`,
              transition: 'box-shadow 0.2s'
            }}>

              {/* Avatar + Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#0d1b4b',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#111', fontSize: '15px' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    {user.branch} • Batch {user.batch}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {user.skills.map(skill => (
                  <span key={skill} style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>

              {/* Result or Assign Button */}
              {result ? (
                <div style={{
                  background: groupColor + '18',
                  border: `1px solid ${groupColor}`,
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>
                    ASSIGNED GROUP
                  </div>
                  <div style={{ fontWeight: '600', color: groupColor, fontSize: '14px' }}>
                    {result.group}
                  </div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                    matched via {result.matchedBy}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => assignOne(user._id)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    background: 'white',
                    border: '1px solid #0d1b4b',
                    color: '#0d1b4b',
                    padding: '9px',
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  {isLoading ? 'Assigning...' : 'Assign Group'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}