import StatusBadge from '../components/ui/StatusBadge'

function StatCard({ icon, label, value, sub, iconClass }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-icon-wrap ${iconClass}`}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub" title={sub}>{sub}</div>}
    </div>
  )
}

export default function Dashboard({ camera, detection, faceDetection, detectionHistory, setPage }) {
  const { isConnected, isConnecting, cameraIP } = camera
  const { modelStatus, detections, isDetecting } = detection

  const cameraStatus  = isConnected ? 'connected' : isConnecting ? 'connecting' : 'disconnected'
  const cameraLabel   = isConnected ? 'Connected'  : isConnecting ? 'Connecting…' : 'Offline'
  const modelLabel    = modelStatus === 'ready' ? 'Ready' : modelStatus === 'loading' ? 'Loading…' : 'Error'

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>ESP32-CAM real-time monitoring &amp; AI vision platform</p>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isConnected ? '#059669' : isConnecting ? '#D97706' : '#DC2626'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/>
            </svg>
          }
          label="Camera Status"
          value={cameraLabel}
          sub={isConnected ? cameraIP : 'No device'}
          iconClass={isConnected ? 'stat-icon-green' : isConnecting ? 'stat-icon-yellow' : 'stat-icon-red'}
        />

        <StatCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={modelStatus === 'ready' ? '#059669' : modelStatus === 'loading' ? '#D97706' : '#DC2626'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
            </svg>
          }
          label="AI Model"
          value={modelLabel}
          sub="COCO-SSD v2.2"
          iconClass={modelStatus === 'ready' ? 'stat-icon-green' : modelStatus === 'loading' ? 'stat-icon-yellow' : 'stat-icon-red'}
        />

        <StatCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            </svg>
          }
          label="Active Detections"
          value={detections.length}
          sub={isDetecting ? 'Detection running' : 'Detection stopped'}
          iconClass="stat-icon-blue"
        />

        <StatCard
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          }
          label="History Events"
          value={detectionHistory.length}
          sub="Total recorded"
          iconClass="stat-icon-purple"
        />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">🚀 Quick Start</span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Connect your ESP32-CAM and start AI-powered object detection in 3 steps.
          </p>

          <div className="quick-start-steps">
            <div className="step">
              <div className="step-num">1</div>
              <div>
                <strong>Connect Camera</strong>
                <p>Enter your ESP32-CAM IP address and tap Connect</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div>
                <strong>View Live Stream</strong>
                <p>See the MJPEG stream from your camera in real time</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div>
                <strong>Start AI Detection</strong>
                <p>Run object &amp; face detection with Tamil / English voice</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <button
              className="btn btn-primary"
              onClick={() => setPage('camera')}
            >
              {isConnected ? '📷 View Camera' : '🔌 Connect Camera'}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setPage('ai')}
            >
              🤖 AI Detection
            </button>
            {!isConnected && (
              <button
                className="btn btn-outline"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-light)' }}
                onClick={() => { camera.connectDemo(); setPage('ai'); }}
              >
                🎮 Try Demo Feed
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">⚙ System Status</span>
          </div>
          <div className="status-list">
            <div className="status-row">
              <span>Camera</span>
              <StatusBadge status={cameraStatus} label={cameraLabel} />
            </div>
            <div className="status-row">
              <span>COCO-SSD Model</span>
              <StatusBadge
                status={modelStatus === 'ready' ? 'ready' : modelStatus === 'loading' ? 'loading' : 'error'}
                label={modelLabel}
              />
            </div>
            <div className="status-row">
              <span>Face Detection</span>
              <StatusBadge
                status={faceDetection.faceStatus === 'ready' ? 'ready' : faceDetection.faceStatus === 'loading' ? 'loading' : 'error'}
                label={faceDetection.faceStatus === 'ready' ? 'Ready' : faceDetection.faceStatus === 'loading' ? 'Loading…' : 'Unavailable'}
              />
            </div>
            <div className="status-row">
              <span>AI Detection Loop</span>
              <StatusBadge
                status={isDetecting ? 'active' : 'idle'}
                label={isDetecting ? 'Running' : 'Stopped'}
              />
            </div>
            <div className="status-row">
              <span>Speech API</span>
              <StatusBadge
                status={typeof window !== 'undefined' && window.speechSynthesis ? 'ready' : 'error'}
                label={typeof window !== 'undefined' && window.speechSynthesis ? 'Available' : 'Unavailable'}
              />
            </div>
          </div>
        </div>
      </div>

      {detectionHistory.length > 0 && (
        <div className="card" style={{ marginTop: 0 }}>
          <div className="card-header">
            <span className="card-title">📋 Recent Detections</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage('ai')}
              style={{ color: 'var(--accent)', fontWeight: 600 }}
            >
              View all →
            </button>
          </div>
          <div className="recent-list">
            {detectionHistory.slice(0, 6).map(item => (
              <div key={item.id} className="recent-item">
                <span className="recent-class">{item.class}</span>
                <span className="recent-confidence">{(item.score * 100).toFixed(0)}%</span>
                <span className="recent-time">{new Date(item.time).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
