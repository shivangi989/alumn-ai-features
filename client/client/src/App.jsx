import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import AutoGroup from './pages/AutoGroup'
import ChatAssistant from './pages/ChatAssistant'

function App() {
  return (
    <BrowserRouter>
      <nav style={{
        background: '#0d1b4b',
        padding: '16px 32px',
        display: 'flex',
        gap: '24px',
        alignItems: 'center'
      }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
          ALUMNS AI
        </span>
        <Link to="/auto-group" style={{ color: '#f97316', textDecoration: 'none' }}>
          Auto Grouping
        </Link>
        <Link to="/chat" style={{ color: '#f97316', textDecoration: 'none' }}>
          Chat Assistant
        </Link>
      </nav>

      <Routes>
        <Route path="/auto-group" element={<AutoGroup />} />
        <Route path="/chat" element={<ChatAssistant />} />
        <Route path="/" element={
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>ALUMNS AI Features</h1>
            <p>Click a link above to test the features</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App