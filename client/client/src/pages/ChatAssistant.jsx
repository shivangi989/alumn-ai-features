import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const suggestedQuestions = [
  'Who works in machine learning?',
  'Which group should I join for web development?',
  'Are there any jobs for Python developers?',
  'Who is from Mechanical branch?',
  'Suggest connections for competitive programming'
]

export default function ChatAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm Alma, your ALUMNS network assistant. Ask me about alumni, groups, jobs, or who to connect with!"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const messageText = text || input
    if (!messageText.trim()) return

    setMessages(prev => [...prev, { role: 'user', text: messageText }])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post('/api/chat', {
        message: messageText,
        history: history
      })

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.data.reply
      }])

      // update history for conversation context
      setHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: messageText }] },
        { role: 'model', parts: [{ text: res.data.reply }] }
      ])

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Alma is busy right now. Please try again in a moment.'
      }])
    }

    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 56px)',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
      boxSizing: 'border-box'
    }}>

      {/* Header */}
    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d1b4b', marginBottom: '4px' }}>
      Alma — ALUMNS Smart Assistant
    </h1>
    <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
      Your AI guide to the ALUMNS network
    </p>

      {/* Suggested Questions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {suggestedQuestions.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={loading}
            style={{
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {/* Avatar for assistant */}
            {msg.role === 'assistant' && (
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#0d1b4b',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 'bold',
                marginRight: '8px',
                flexShrink: 0,
                alignSelf: 'flex-end'
              }}>
                Alma
              </div>
            )}

            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user'
                ? '18px 18px 4px 18px'
                : '18px 18px 18px 4px',
              background: msg.role === 'user' ? '#0d1b4b' : 'white',
              color: msg.role === 'user' ? 'white' : '#111',
              border: msg.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
              fontSize: '14px',
              lineHeight: '1.6',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#0d1b4b',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 'bold'
            }}>
              Alma
            </div>
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '18px',
              padding: '12px 20px',
              fontSize: '18px',
              letterSpacing: '4px',
              color: '#aaa'
            }}>
              •••
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Alma anything about alumni, groups, or jobs..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            outline: 'none',
            background: loading ? '#f9fafb' : 'white'
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            background: '#0d1b4b',
            color: 'white',
            border: 'none',
            padding: '14px 24px',
            borderRadius: '12px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: loading || !input.trim() ? 0.6 : 1
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}