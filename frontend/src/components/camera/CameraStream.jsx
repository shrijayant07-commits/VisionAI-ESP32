import { useCallback } from 'react'

export default function CameraStream({
  streamUrl,
  imgRef,
  overlayRef,
  isConnected,
  isConnecting,
  onLoad,
  onError,
  showControls = true,
}) {
  const handleRefresh = useCallback(() => {
    if (imgRef?.current) {
      const url = imgRef.current.src
      imgRef.current.src = ''
      setTimeout(() => { if (imgRef.current) imgRef.current.src = url }, 100)
    }
  }, [imgRef])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="camera-stream-wrap" style={{ minHeight: 200 }}>
        {streamUrl ? (
          <>
            <img
              ref={imgRef}
              src={streamUrl}
              alt="ESP32-CAM live stream"
              className="camera-stream-img"
              crossOrigin="anonymous"
              onLoad={onLoad}
              onError={onError}
              draggable={false}
              style={{ display: isConnected ? 'block' : 'none' }}
            />

            <canvas
              ref={overlayRef}
              className="camera-overlay-canvas"
              style={{ display: isConnected ? 'block' : 'none' }}
              aria-hidden="true"
            />

            {isConnected && (
              <div className="live-badge">
                <span className="live-dot" />
                LIVE
              </div>
            )}

            {isConnecting && !isConnected && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 12, color: '#94A3B8',
              }}>
                <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                <p style={{ fontSize: 14, fontWeight: 500 }}>Connecting to camera…</p>
              </div>
            )}

            {isConnected && showControls && (
              <div className="camera-controls-bar">
                <button
                  className="ctrl-btn"
                  onClick={handleRefresh}
                  title="Refresh stream"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  Refresh
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="camera-placeholder">
            <svg className="camera-placeholder-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <p style={{ fontSize: 14, fontWeight: 500 }}>No camera connected</p>
            <p style={{ fontSize: 12 }}>Enter your ESP32-CAM IP address to start</p>
          </div>
        )}
      </div>

      {isConnected && streamUrl && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', padding: '0 2px',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {streamUrl}
        </div>
      )}
    </div>
  )
}
