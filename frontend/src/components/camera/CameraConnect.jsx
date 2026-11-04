import { useState, useCallback } from 'react'
import StatusBadge from '../ui/StatusBadge'
import { validateIP } from '../../utils/cameraUtils'

export default function CameraConnect({ camera }) {
  const {
    cameraIP, setCameraIP,
    isConnected, isConnecting, connectionError,
    connect, disconnect, clearSavedIP,
  } = camera

  const [inputValue, setInputValue] = useState(cameraIP)
  const [inputError, setInputError] = useState(null)

  const handleConnect = useCallback(() => {
    const err = validateIP(inputValue)
    if (err) { setInputError(err); return }
    setInputError(null)
    connect(inputValue)
  }, [inputValue, connect])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleConnect()
  }, [handleConnect])

  const handleClear = useCallback(() => {
    setInputValue('')
    setCameraIP('')
    clearSavedIP()
  }, [setCameraIP, clearSavedIP])

  const connectionStatus = isConnected
    ? 'connected'
    : isConnecting
    ? 'connecting'
    : 'disconnected'

  const connectionLabel = isConnected
    ? 'Connected'
    : isConnecting
    ? 'Connecting…'
    : 'Disconnected'

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-title-icon">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/>
          </svg>
          Camera Connection
        </span>
        <StatusBadge status={connectionStatus} label={connectionLabel} />
      </div>

      <div className="input-group" style={{ marginBottom: 12 }}>
        <label className="input-label" htmlFor="camera-ip">
          ESP32-CAM IP Address
        </label>
        <div className="ip-input-wrap">
          <input
            id="camera-ip"
            type="text"
            className={`input-field ${inputError || connectionError ? 'error' : ''}`}
            placeholder="192.168.1.100"
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setInputError(null) }}
            onKeyDown={handleKeyDown}
            disabled={isConnected || isConnecting}
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
          />
          {inputValue && !isConnected && !isConnecting && (
            <button
              className="ip-clear-btn"
              onClick={handleClear}
              title="Clear IP"
              aria-label="Clear IP address"
            >
              ×
            </button>
          )}
        </div>
        {inputError && (
          <span className="input-error">⚠ {inputError}</span>
        )}
        <span className="input-hint">
          Enter the IP shown on your ESP32-CAM serial monitor
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        {!isConnected ? (
          <>
            <button
              className="btn btn-primary btn-full"
              onClick={handleConnect}
              disabled={isConnecting || !inputValue.trim()}
            >
              {isConnecting ? (
                <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.4)', borderRightColor: 'transparent' }} /> Connecting…</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0"/><circle cx="12" cy="20" r="1"/>
                  </svg>
                  Connect Camera
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <button
              type="button"
              className="btn btn-outline btn-full"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-light)' }}
              onClick={() => camera.connectDemo()}
            >
              🎮 Try Demo Feed (Test Without ESP32)
            </button>
          </>
        ) : (
          <button
            className="btn btn-danger btn-full"
            onClick={disconnect}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Disconnect {camera.isDemo ? '(Demo Mode)' : ''}
          </button>
        )}
      </div>

      {connectionError && !isConnected && (
        <div className="alert alert-error" style={{ marginTop: 12 }}>
          <span className="alert-icon">⚠</span>
          <div className="alert-body">
            <div className="alert-title">Cannot reach camera</div>
            <div style={{ whiteSpace: 'pre-line', marginTop: 4, fontSize: 12, lineHeight: 1.6 }}>
              {connectionError}
            </div>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="alert alert-success" style={{ marginTop: 12 }}>
          <span className="alert-icon">✓</span>
          <div className="alert-body">
            <div className="alert-title">Live stream active</div>
            <div style={{ fontSize: 12, marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              http://{cameraIP}:81/stream
            </div>
          </div>
        </div>
      )}

      {!isConnected && !isConnecting && cameraIP && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
          💾 Last used IP is pre-filled above
        </p>
      )}
    </div>
  )
}
