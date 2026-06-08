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
  const [suggestions, setSuggestions] = useState({})   // { userId: [group1, group2] }
  const [loading, setLoading] = useState({})
  const [joined, setJoined] = useState({})              // { userId: groupName }
  const [rejected, setRejected] = useState({})          // { userId: [group1, group2] }
  const [loadingAll, setLoadingAll] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('/api/users')
      .then(res => {
        setUsers(res.data)
        setFetchingUsers(false)
        // pre-fill joined state from DB
        const joinedMap = {}
        res.data.forEach(u => {
          if (u.assignedGroup) joinedMap[u._id] = u.assignedGroup
        })
        setJoined(joinedMap)
      })
      .catch(() => {
        setError('Failed to load users')
        setFetchingUsers(false)
      })
  }, [])

  // suggest for one user
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

  // suggest for all users at once
  const suggestAll = async () => {
    setLoadingAll(true)
    try {
      const allSuggestions = {}
      for (const user of users) {
        if (!joined[user._id]) {  // skip already joined users
          const res = await axios.post('/api/suggest-group', { userId: user._id })
          allSuggestions[user._id] = res.data.suggestions
        }
      }
      setSuggestions(prev => ({ ...prev, ...allSuggestions }))
    } catch (err) {
      console.error(err)
    }
    setLoadingAll(false)
  }

  // user joins a group
  const handleJoin = async (userId, groupName) => {
    try {
      await axios.post('/api/join-group', { userId, groupName })
      setJoined(prev => ({ ...prev, [userId]: groupName }))
      setSuggestions(prev => ({ ...prev, [userId]: null }))
    } catch (err) {
      console.error(err)
    }
  }

  // user rejects all suggestions
  const handleReject = (userId) => {
    setRejected(prev => ({ ...prev, [userId]: true }))
    setSuggestions(prev => ({ ...prev, [userId]: null }))
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
            {Object.keys(joined).length}
          </span>
          <span style={{ color: '#888', marginLeft: '6px', fontSize: '14px' }}>Joined a Group</span>
        </div>
        <div>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#f97316' }}>
            {users.length - Object.keys(joined).length}
          </span>
          <span style={{ color: '#888', marginLeft: '6px', fontSize: '14px' }}>Not Grouped</span>
        </div>
      </div>

      {/* User Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {users.map(user => {
          const userSuggestions = suggestions[user._id]
          const isLoading = loading[user._id]
          const joinedGroup = joined[user._id]
          const isRejected = rejected[user._id]
          const groupColor = joinedGroup ? (groupColors[joinedGroup] || '#6b7280') : '#e5e7eb'

          return (
            <div key={user._id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              borderTop: `4px solid ${joinedGroup ? groupColor : '#e5e7eb'}`
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

              {/* Bottom section */}
              {joinedGroup ? (
                // Already joined a group
                <div style={{
                  background: groupColor + '18',
                  border: `1px solid ${groupColor}`,
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>
                    JOINED GROUP
                  </div>
                  <div style={{ fontWeight: '600', color: groupColor, fontSize: '14px' }}>
                    ✓ {joinedGroup}
                  </div>
                </div>

              ) : userSuggestions && userSuggestions.length > 0 ? (
                // Show suggestions with join/reject
                <div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                    SUGGESTED GROUPS
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
                  {/* Reject button */}
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
                    Skip suggestions
                  </button>
                </div>

              ) : isRejected ? (
                // Rejected suggestions
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
                // Default — suggest button
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
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}