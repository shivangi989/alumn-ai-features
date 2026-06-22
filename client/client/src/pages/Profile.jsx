import { useState, useEffect } from 'react'
import axios from 'axios'

const groupColors = {
  'Web Development': '#3b82f6',
  'Machine Learning & AI': '#8b5cf6',
  'Finite Element Analysis': '#f97316',
  'Competitive Programming': '#10b981',
  'Data Science': '#f59e0b'
}

const SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Python', 'TensorFlow', 'ANSYS', 'FEM',
  'C++', 'SQL', 'MATLAB', 'Java', 'MongoDB', 'PyTorch',
  'SolidWorks', 'JavaScript', 'AutoCAD', 'Docker', 'Tableau'
]

export default function Profile() {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestedGroups, setSuggestedGroups] = useState([])
  const [matchedBy, setMatchedBy] = useState('')
  const [joined, setJoined] = useState([])

  // load all users for the dropdown
  useEffect(() => {
    axios.get('/api/users').then(res => setUsers(res.data))
  }, [])

  // when user is selected, load their current skills
  const handleSelectUser = (userId) => {
    setSelectedUserId(userId)
    const user = users.find(u => u._id === userId)
    setSkills(user?.skills || [])
    setJoined(Array.isArray(user?.assignedGroup) ? user.assignedGroup : [])
    setSuggestedGroups([])
  }

  const addSkill = (skill) => {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setSkillInput('')
  }

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const handleUpdateProfile = async () => {
    if (!selectedUserId) return
    setLoading(true)
    try {
      const res = await axios.put(`/api/users/${selectedUserId}/skills`, { skills })
      setSuggestedGroups(res.data.suggestedGroups)
      setMatchedBy(res.data.matchedBy)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleJoinGroup = async (groupName) => {
    try {
      await axios.post('/api/join-group', { userId: selectedUserId, groupName })
      setJoined(prev => [...prev, groupName])
      setSuggestedGroups(prev => prev.filter(g => g !== groupName))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ padding: '32px', maxWidth: '700px', margin: '0 auto' }}>

      <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#0d1b4b', marginBottom: '6px' }}>
        Update Profile — Skills
      </h1>
      <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
        Mock of ALUMNS profile update flow — add skills, get group suggestions
      </p>

      {/* User selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', color: '#555', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
          Select User Profile
        </label>
        <select
          value={selectedUserId}
          onChange={e => handleSelectUser(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '14px'
          }}
        >
          <option value="">-- Choose a user --</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.name} ({u.branch})</option>
          ))}
        </select>
      </div>

      {selectedUserId && (
        <>
          {/* Skills section */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            background: 'white'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0d1b4b', marginBottom: '12px' }}>
              Skills
            </div>

            {/* current skills as tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {skills.map(skill => (
                <span key={skill} style={{
                  background: '#eef2ff',
                  color: '#3730a3',
                  padding: '5px 10px 5px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6366f1',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* add skill input */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill(skillInput)}
                placeholder="Type a skill and press Enter"
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px'
                }}
              />
              <button
                onClick={() => addSkill(skillInput)}
                style={{
                  background: '#0d1b4b',
                  color: 'white',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Add
              </button>
            </div>

            {/* quick suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(skill => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill)}
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    color: '#6b7280',
                    padding: '4px 10px',
                    borderRadius: '14px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Update button */}
          <button
            onClick={handleUpdateProfile}
            disabled={loading || skills.length === 0}
            style={{
              width: '100%',
              background: '#0d1b4b',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1,
              marginBottom: '20px'
            }}
          >
            {loading ? 'Updating Profile...' : 'Update Profile & Get Suggestions'}
          </button>

          {/* Already joined groups */}
          {joined.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                ALREADY JOINED
              </div>
              {joined.map(group => (
                <div key={group} style={{
                  background: (groupColors[group] || '#6b7280') + '18',
                  border: `1px solid ${groupColors[group] || '#e5e7eb'}`,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: groupColors[group] || '#374151',
                  fontSize: '13px'
                }}>
                  ✓ {group}
                </div>
              ))}
            </div>
          )}

          {/* New suggestions after update */}
          {suggestedGroups.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                SUGGESTED GROUPS {matchedBy && `(via ${matchedBy})`}
              </div>
              {suggestedGroups.map(group => (
                <div key={group} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: (groupColors[group] || '#6b7280') + '12',
                  border: `1px solid ${groupColors[group] || '#e5e7eb'}`,
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}>
                  <span style={{
                    fontWeight: '600',
                    color: groupColors[group] || '#374151',
                    fontSize: '14px'
                  }}>
                    {group}
                  </span>
                  <button
                    onClick={() => handleJoinGroup(group)}
                    style={{
                      background: groupColors[group] || '#0d1b4b',
                      color: 'white',
                      border: 'none',
                      padding: '6px 18px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}