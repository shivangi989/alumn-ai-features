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
  const [suggestions, setSuggestions] = useState({})
  const [loading, setLoading] = useState({})
  const [joined, setJoined] = useState({})
  const [rejected, setRejected] = useState({})
  const [loadingAll, setLoadingAll] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('/api/users')
      .then(res => {
        setUsers(res.data)
        setFetchingUsers(false)
        const joinedMap = {}
        res.data.forEach(u => {
          if (u.assignedGroup && u.assignedGroup.length > 0) {
            joinedMap[u._id] = Array.isArray(u.assignedGroup)
              ? u.assignedGroup
              : [u.assignedGroup]
          }
        })
        setJoined(joinedMap)
      })
      .catch(() => {
        setError('Failed to load users')
        setFetchingUsers(false)
      })
  }, [])

  const suggestOne = async (userId) => {
    setLoading(prev => ({ ...prev, [userId]: true }))
    try {
      const res = await axios.post('/api/suggest-group', { userId })
      setSuggestions(prev => ({ ...prev, [userId]: res.data.suggestions }))
    } catch (err) {
      console.error(err)
    }
    setLoading(prev => ({ ...prev, [userId]: false }))
  }

  const suggestAll = async () => {
    setLoadingAll(true)
    try {
      const allSuggestions = {}
      for (const user of users) {
        const res = await axios.post('/api/suggest-group', { userId: user._id })
        allSuggestions[user._id] = res.data.suggestions
      }
      setSuggestions(prev => ({ ...prev, ...allSuggestions }))
    } catch (err) {
      console.error(err)
    }
    setLoadingAll(false)
  }

  const handleJoin = async (userId, groupName) => {
    try {
      await axios.post('/api/join-group', { userId, groupName })
      setJoined(prev => ({
        ...prev,
        [userId]: [...(prev[userId] || []), groupName]
      }))
      setSuggestions(prev => ({
        ...prev,
        [userId]: prev[userId]?.filter(g => g !== groupName) || []
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = (userId) => {
    setRejected(prev => ({ ...prev, [userId]: true }))
    setSuggestions(prev => ({ ...prev, [userId]: [] }))
  }

  if (fetchingUsers) return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: '#666' }}>
      Loading users...
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>
      {error}
    </div>
  )

  const totalGroupsJoined = Object.values(joined).reduce(
    (total, groups) => total + (groups?.length || 0), 0
  )

  return (
    <div style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0d1b4b' }}>
          Group Suggestions
        </h1>
        <p style={{ color: '#666', marginTop: '6px' }}>
          AI suggests domain groups based on each alumni's skills.
          Alumni can choose to join or skip.
        </p>
        <button
          onClick={suggestAll}
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
          {loadingAll ? 'Generating Suggestions...' : 'Suggest Groups for All'}
        </button>
      </div>

      {/* Stats */}
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
          <span style={{ color: '#888', marginLeft: '6px', fontSize: '14px' }}>Total Alumni</span>
        </div>
        <div>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>
            {totalGroupsJoined}
          </span>
          <span style={{ color: '#888', marginLeft: '6px', fontSize: '14px' }}>Groups Joined</span>
        </div>
        <div>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#f97316' }}>
            {users.length - Object.keys(joined).length}
          </span>
          <span style={{ color: '#888', marginLeft: '6px', fontSize: '14px' }}>Not Grouped Yet</span>
        </div>
      </div>

      {/* User Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {users.map(user => {
          const userSuggestions = suggestions[user._id] || []
          const isLoading = loading[user._id]
          const joinedGroups = joined[user._id] || []
          const isRejected = rejected[user._id]
          const topColor = joinedGroups.length > 0
            ? (groupColors[joinedGroups[0]] || '#6b7280')
            : '#e5e7eb'

          return (
            <div key={user._id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              borderTop: `4px solid ${topColor}`
            }}>

              {/* Avatar + Name */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '14px'
              }}>
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
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '16px'
              }}>
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

              {/* Bottom section */}
              <div>

                {/* Joined groups — always show if any */}
                {joinedGroups.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{
                      fontSize: '11px',
                      color: '#888',
                      marginBottom: '6px',
                      letterSpacing: '0.5px'
                    }}>
                      JOINED GROUPS
                    </div>
                    {joinedGroups.map(group => (
                      <div key={group} style={{
                        background: (groupColors[group] || '#6b7280') + '18',
                        border: `1px solid ${groupColors[group] || '#e5e7eb'}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        marginBottom: '6px',
                        fontWeight: '600',
                        color: groupColors[group] || '#374151',
                        fontSize: '13px'
                      }}>
                        ✓ {group}
                      </div>
                    ))}
                  </div>
                )}

                {/* Remaining suggestions — show alongside joined */}
                {userSuggestions.length > 0 && (
                  <div>
                    <div style={{
                      fontSize: '11px',
                      color: '#888',
                      marginBottom: '6px',
                      letterSpacing: '0.5px'
                    }}>
                      {joinedGroups.length > 0 ? 'MORE SUGGESTIONS' : 'SUGGESTED GROUPS'}
                    </div>
                    {userSuggestions.map(group => (
                      <div key={group} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: (groupColors[group] || '#6b7280') + '12',
                        border: `1px solid ${groupColors[group] || '#e5e7eb'}`,
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontWeight: '600',
                          color: groupColors[group] || '#374151',
                          fontSize: '13px'
                        }}>
                          {group}
                        </span>
                        <button
                          onClick={() => handleJoin(user._id, group)}
                          style={{
                            background: groupColors[group] || '#0d1b4b',
                            color: 'white',
                            border: 'none',
                            padding: '4px 14px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          Join
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleReject(user._id)}
                      style={{
                        width: '100%',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        color: '#9ca3af',
                        padding: '7px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginTop: '4px'
                      }}
                    >
                      Skip remaining
                    </button>
                  </div>
                )}

                {/* No suggestions, not joined anything */}
                {joinedGroups.length === 0 && userSuggestions.length === 0 && (
                  isRejected ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '12px',
                      color: '#9ca3af',
                      fontSize: '13px',
                      border: '1px dashed #e5e7eb',
                      borderRadius: '8px'
                    }}>
                      Skipped
                      <button
                        onClick={() => {
                          setRejected(prev => ({ ...prev, [user._id]: false }))
                          suggestOne(user._id)
                        }}
                        style={{
                          display: 'block',
                          margin: '6px auto 0',
                          background: 'none',
                          border: 'none',
                          color: '#0d1b4b',
                          cursor: 'pointer',
                          fontSize: '12px',
                          textDecoration: 'underline'
                        }}
                      >
                        Show again
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => suggestOne(user._id)}
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
                      {isLoading ? 'Finding groups...' : 'Suggest Groups'}
                    </button>
                  )
                )}

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}