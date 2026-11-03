import { useState, useCallback } from 'react'

import Navbar    from './components/layout/Navbar'
import BottomNav from './components/layout/BottomNav'
import Toast     from './components/ui/Toast'

import Dashboard    from './pages/Dashboard'
import CameraPage   from './pages/CameraPage'
import AIPage       from './pages/AIPage'
import SettingsPage from './pages/SettingsPage'

import { useCamera }          from './hooks/useCamera'
import { useObjectDetection } from './hooks/useObjectDetection'
import { useFaceDetection }   from './hooks/useFaceDetection'
import { useVoice }           from './hooks/useVoice'

import './index.css'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('visionai-history') || '[]') }
  catch { return [] }
}

function loadSettings() {
  try { return JSON.parse(localStorage.getItem('visionai-settings') || '{}') }
  catch { return {} }
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const [detectionHistory, setDetectionHistory] = useState(loadHistory)
  const [settings,         setSettingsState]    = useState(loadSettings)

  const camera      = useCamera({ showToast })
  const detection   = useObjectDetection({ settings })
  const faceDetect  = useFaceDetection()
  const voice       = useVoice()

  const addToHistory = useCallback((predictions) => {
    if (!predictions.length) return
    const now     = Date.now()
    const entries = predictions.map((p, i) => ({
      id:    now + i,
      class: p.class,
      score: p.score,
      time:  now,
    }))
    setDetectionHistory(prev => {
      const updated = [...entries, ...prev].slice(0, 150)
      localStorage.setItem('visionai-history', JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setDetectionHistory([])
    localStorage.removeItem('visionai-history')
    showToast('Detection history cleared', 'success')
  }, [showToast])

  const updateSettings = useCallback((patch) => {
    setSettingsState(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem('visionai-settings', JSON.stringify(next))
      return next
    })
  }, [])

  const pages = {
    dashboard: (
      <Dashboard
        camera={camera}
        detection={detection}
        faceDetection={faceDetect}
        detectionHistory={detectionHistory}
        setPage={setPage}
      />
    ),
    camera: (
      <CameraPage
        camera={camera}
        showToast={showToast}
      />
    ),
    ai: (
      <AIPage
        camera={camera}
        detection={detection}
        faceDetection={faceDetect}
        voice={voice}
        detectionHistory={detectionHistory}
        addToHistory={addToHistory}
        clearHistory={clearHistory}
        settings={settings}
        showToast={showToast}
      />
    ),
    settings: (
      <SettingsPage
        camera={camera}
        voice={voice}
        settings={settings}
        updateSettings={updateSettings}
        clearHistory={clearHistory}
        showToast={showToast}
      />
    ),
  }

  return (
    <div className="app-shell">
      <Navbar page={page} setPage={setPage} />

      <div className="app-body">
        <div className="mobile-topbar">
          <div className="sidebar-logo">
            <div className="logo-icon" style={{ width: 30, height: 30, fontSize: 14 }}>V</div>
            <span className="logo-name" style={{ fontSize: 15 }}>VisionAI</span>
          </div>
          {camera.isConnected && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: 'var(--success)',
              background: 'var(--success-light)',
              border: '1px solid var(--success-border)',
              padding: '3px 9px',
              borderRadius: 'var(--r-full)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse-green 2s infinite' }} />
              LIVE
            </span>
          )}
        </div>

        <main className="app-main">
          <div className="page-content">
            {pages[page] ?? pages.dashboard}
          </div>
        </main>
      </div>

      <BottomNav page={page} setPage={setPage} />
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
