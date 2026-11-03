import { useState } from 'react'
import VoiceAssistant from '../components/voice/VoiceAssistant'
import { validateIP } from '../utils/cameraUtils'

export default function SettingsPage({
  camera, voice, settings, updateSettings,
  clearHistory, showToast,
}) {
  const [ipInput, setIpInput] = useState(camera.cameraIP)
  const [ipError, setIpError] = useState(null)
  const [port,    setPort]    = useState(settings.port    || '81')
  const [path,    setPath]    = useState(settings.path    || '/stream')

  const handleSaveCameraSettings = () => {
    const err = validateIP(ipInput)
    if (err && ipInput) { setIpError(err); return }
    setIpError(null)
    camera.setCameraIP(ipInput)
    if (ipInput) localStorage.setItem('visionai-camera-ip', ipInput)
    updateSettings({ port, path })
    showToast('Camera settings saved', 'success')
  }

  const handleClearHistory = () => {
    if (window.confirm('Clear all detection history? This cannot be undone.')) {
      clearHistory()
    }
  }

  const threshold = settings.confidenceThreshold ?? 0.45
  const interval  = settings.detectionInterval   ?? 1500

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure camera, AI detection, and voice preferences</p>
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="settings-section-title">📷 Camera</div>

          <div className="input-group" style={{ marginBottom: 12 }}>
            <label className="input-label">IP Address</label>
            <input
              type="text"
              className={`input-field ${ipError ? 'error' : ''}`}
              placeholder="192.168.1.100"
              value={ipInput}
              onChange={e => { setIpInput(e.target.value); setIpError(null) }}
              inputMode="numeric"
              spellCheck={false}
            />
            {ipError && <span className="input-error">⚠ {ipError}</span>}
          </div>

          <div className="input-group" style={{ marginBottom: 12 }}>
            <label className="input-label">Stream Port</label>
            <input
              type="text"
              className="input-field"
              value={port}
              onChange={e => setPort(e.target.value)}
              placeholder="81"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <span className="input-hint">Default: 81 (ESP32-CAM standard)</span>
          </div>

          <div className="input-group" style={{ marginBottom: 14 }}>
            <label className="input-label">Stream Path</label>
            <input
              type="text"
              className="input-field"
              value={path}
              onChange={e => setPath(e.target.value)}
              placeholder="/stream"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <span className="input-hint">Default: /stream</span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSaveCameraSettings}>
              Save Settings
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                camera.clearSavedIP()
                setIpInput('')
              }}
            >
              Clear Saved IP
            </button>
          </div>
        </div>

        <div className="card">
          <div className="settings-section-title">🤖 AI Detection</div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="input-label">Confidence Threshold</label>
              <span className="range-value">{Math.round(threshold * 100)}%</span>
            </div>
            <input
              type="range"
              className="range-input"
              min="0.1" max="0.95" step="0.05"
              value={threshold}
              onChange={e => updateSettings({ confidenceThreshold: parseFloat(e.target.value) })}
            />
            <div className="range-labels">
              <span>10% (more detections)</span>
              <span>95% (fewer, confident)</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Only show detections above this confidence. Lower = more objects detected but more false positives.
            </p>
          </div>

          <div className="settings-divider" />

          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="input-label">Detection Interval</label>
              <span className="range-value">{interval}ms</span>
            </div>
            <input
              type="range"
              className="range-input"
              min="500" max="5000" step="250"
              value={interval}
              onChange={e => updateSettings({ detectionInterval: parseInt(e.target.value) })}
            />
            <div className="range-labels">
              <span>500ms (faster)</span>
              <span>5000ms (battery-friendly)</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Time between each detection run. Faster = more responsive but uses more CPU.
            </p>
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <VoiceAssistant voice={voice} />
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="settings-section-title">🔧 CORS Setup for AI Detection</div>

          <div className="alert alert-info" style={{ marginBottom: 14 }}>
            <span className="alert-icon">ℹ</span>
            <div className="alert-body">
              <div className="alert-title">Why CORS headers are needed</div>
              <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.7 }}>
                Your browser allows the camera stream to <em>display</em> without CORS headers.
                However, to run AI on the frames (read pixel data from the canvas), the browser
                requires the ESP32 to send <code style={{ background: 'var(--info-light)', padding: '1px 4px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>Access-Control-Allow-Origin: *</code>.
              </div>
            </div>
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Add this to your ESP32-CAM firmware (CameraWebServer.ino):
          </p>

          <div className="code-block">
            <span className="fn">httpd_resp_set_hdr</span>(<span className="str">req</span>, <span className="str">"Access-Control-Allow-Origin"</span>, <span className="str">"*"</span>);<br/>
            <span className="fn">httpd_resp_set_hdr</span>(<span className="str">req</span>, <span className="str">"Access-Control-Allow-Methods"</span>, <span className="str">"GET, OPTIONS"</span>);<br/>
            <span className="fn">httpd_resp_set_hdr</span>(<span className="str">req</span>, <span className="str">"Access-Control-Allow-Headers"</span>, <span className="str">"*"</span>);<br/><br/>
            <span className="kw">static</span> <span className="fn">esp_err_t</span> cors_handler(<span className="fn">httpd_req_t</span> *req) {'{'}<br/>
            {'  '}<span className="fn">httpd_resp_set_hdr</span>(req, <span className="str">"Access-Control-Allow-Origin"</span>, <span className="str">"*"</span>);<br/>
            {'  '}<span className="kw">return</span> <span className="fn">httpd_resp_send</span>(req, <span className="str">NULL</span>, 0);<br/>
            {'}'}
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
            After flashing the updated firmware, the camera stream, AI object detection, and face detection will all work together.
          </p>
        </div>

        <div className="card danger-zone" style={{ gridColumn: '1 / -1' }}>
          <div className="settings-section-title" style={{ color: 'var(--error)' }}>⚠ Danger Zone</div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Clear Detection History
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Permanently removes all recorded detection events
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleClearHistory}>
              Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
