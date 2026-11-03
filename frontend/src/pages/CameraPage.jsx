import { useRef } from 'react'
import CameraConnect from '../components/camera/CameraConnect'
import CameraStream  from '../components/camera/CameraStream'

export default function CameraPage({ camera }) {
  const imgRef     = useRef(null)
  const overlayRef = useRef(null)

  return (
    <div>
      <div className="page-header">
        <h1>Live Camera</h1>
        <p>Connect to your ESP32-CAM and view the live MJPEG stream</p>
      </div>

      <div className="camera-page-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CameraConnect camera={camera} />

          <div className="card" style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              📡 How the stream works
            </p>
            <ul style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 16, listStyle: 'disc' }}>
              <li>Stream URL: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-surface-2)', padding: '1px 4px', borderRadius: 4 }}>http://IP:81/stream</code></li>
              <li>Format: MJPEG multipart (camera streams continuously)</li>
              <li>AI inference requires CORS headers on the ESP32</li>
              <li>See <strong>Settings → CORS Setup</strong> for firmware fix</li>
            </ul>
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 12 }}>
            <div className="card-header" style={{ marginBottom: 10 }}>
              <span className="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                Live Stream
              </span>
            </div>
            <CameraStream
              streamUrl={camera.streamUrl}
              imgRef={imgRef}
              overlayRef={overlayRef}
              isConnected={camera.isConnected}
              isConnecting={camera.isConnecting}
              onLoad={camera.handleConnected}
              onError={camera.handleError}
              showControls={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
