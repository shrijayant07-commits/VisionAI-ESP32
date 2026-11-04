import { useRef, useCallback, useState } from 'react'
import CameraStream      from '../components/camera/CameraStream'
import DetectionHistory  from '../components/detection/DetectionHistory'
import VoiceAssistant    from '../components/voice/VoiceAssistant'
import StatusBadge       from '../components/ui/StatusBadge'

export default function AIPage({
  camera,
  detection,
  faceDetection,
  voice,
  detectionHistory,
  addToHistory,
  clearHistory,
  showToast,
}) {
  const imgRef     = useRef(null)
  const overlayRef = useRef(null)

  const [faceRunning, setFaceRunning] = useState(false)

  const handleDetectionBatch = useCallback((predictions) => {
    if (predictions.length === 0) return
    addToHistory(predictions)
    const seen = new Set()
    predictions.forEach(pred => {
      if (!seen.has(pred.class)) {
        seen.add(pred.class)
        voice.announceDetection(pred.class)
      }
    })
  }, [addToHistory, voice])

  const handleStartDetection = useCallback(() => {
    if (!camera.isConnected) {
      showToast('Connect a camera first', 'warning')
      return
    }
    if (detection.modelStatus !== 'ready') {
      showToast('AI model is still loading…', 'warning')
      return
    }
    detection.startDetection(imgRef, overlayRef, handleDetectionBatch)
    voice.announceSystem('detectionStarted')
    showToast('AI detection started', 'success')
  }, [camera.isConnected, detection, imgRef, overlayRef, handleDetectionBatch, voice, showToast])

  const handleStopDetection = useCallback(() => {
    detection.stopDetection(overlayRef)
    voice.announceSystem('detectionStopped')
    showToast('Detection stopped', 'info')
  }, [detection, overlayRef, voice, showToast])

  const handleDetectOnce = useCallback(async () => {
    if (!camera.isConnected) {
      showToast('Connect a camera first', 'warning')
      return
    }
    if (detection.modelStatus !== 'ready') {
      showToast('AI model is still loading…', 'warning')
      return
    }
    const results = await detection.detectOnce(imgRef, overlayRef)
    if (results.length > 0) {
      handleDetectionBatch(results)
      showToast(`${results.length} object(s) detected`, 'success')
    } else if (detection.corsBlocked) {
      showToast('CORS blocked — see Settings for firmware fix', 'error')
    } else {
      showToast('No objects detected in this frame', 'info')
    }
  }, [camera.isConnected, detection, imgRef, overlayRef, handleDetectionBatch, showToast])

  const handleDetectFaces = useCallback(async () => {
    if (!camera.isConnected) {
      showToast('Connect a camera first', 'warning')
      return
    }
    if (faceDetection.faceStatus !== 'ready') {
      showToast('Face detection model is not ready', 'warning')
      return
    }
    setFaceRunning(true)
    const faces = await faceDetection.detectFaces(imgRef, overlayRef)
    setFaceRunning(false)

    if (faces.length > 0) {
      voice.announceSystem('faceDetected')
      showToast(`${faces.length} face(s) detected`, 'success')
    } else {
      showToast('No faces found in this frame', 'info')
    }
  }, [camera.isConnected, faceDetection, imgRef, overlayRef, voice, showToast])

  const modelLabel = {
    loading: 'Loading model…',
    ready:   'Model ready',
    error:   'Model failed',
  }[detection.modelStatus] || ''

  return (
    <div>
      <div className="page-header">
        <h1>AI Detection</h1>
        <p>Real-time object detection, face detection, and voice feedback</p>
      </div>

      <div className="ai-page-grid">
        <div className="ai-stream-col">
          <div className="card" style={{ padding: 12 }}>
            <div className="card-header" style={{ marginBottom: 10 }}>
              <span className="card-title">Live Feed</span>
              <StatusBadge
                status={camera.isConnected ? 'connected' : camera.isConnecting ? 'connecting' : 'disconnected'}
                label={camera.isConnected ? 'Connected' : camera.isConnecting ? 'Connecting…' : 'No camera'}
              />
            </div>
            <CameraStream
              streamUrl={camera.streamUrl}
              imgRef={imgRef}
              overlayRef={overlayRef}
              isConnected={camera.isConnected}
              isConnecting={camera.isConnecting}
              onLoad={camera.handleConnected}
              onError={camera.handleError}
              onStartDemo={camera.connectDemo}
              showControls={true}
            />
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
                </svg>
                Object Detection
              </span>
              <StatusBadge
                status={detection.modelStatus === 'ready' ? (detection.isDetecting ? 'active' : 'ready') : detection.modelStatus === 'loading' ? 'loading' : 'error'}
                label={detection.isDetecting ? 'Running' : modelLabel}
              />
            </div>

            {detection.corsBlocked && (
              <div className="alert alert-warning" style={{ marginBottom: 12 }}>
                <span className="alert-icon">⚠</span>
                <div className="alert-body">
                  <div className="alert-title">CORS headers required for AI</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    Go to <strong>Settings → CORS Setup</strong> for the firmware code to add.
                  </div>
                </div>
              </div>
            )}

            <div className="detection-controls">
              {!detection.isDetecting ? (
                <button
                  className="btn btn-primary"
                  onClick={handleStartDetection}
                  disabled={!camera.isConnected || detection.modelStatus !== 'ready'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Start Detection
                </button>
              ) : (
                <button
                  className="btn btn-danger"
                  onClick={handleStopDetection}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                  Stop Detection
                </button>
              )}

              <button
                className="btn btn-outline"
                onClick={handleDetectOnce}
                disabled={!camera.isConnected || detection.modelStatus !== 'ready' || detection.isDetecting}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Detect Now
              </button>

              {!camera.isConnected && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-light)' }}
                  onClick={() => camera.connectDemo()}
                >
                  🎮 Start Demo Feed
                </button>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              {detection.detections.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 12px' }}>
                  <div className="empty-state-icon" style={{ fontSize: 28 }}>🔍</div>
                  <div className="empty-state-title">
                    {detection.isDetecting ? 'Scanning…' : 'No objects detected'}
                  </div>
                  <div className="empty-state-desc">
                    {detection.isDetecting
                      ? 'Looking for objects in the camera feed'
                      : camera.isConnected
                      ? 'Tap "Start Detection" or "Detect Now"'
                      : 'Connect a camera on the Camera page first'}
                  </div>
                </div>
              ) : (
                <div className="detections-list">
                  {detection.detections.map((item, i) => (
                    <div key={i} className="detection-item">
                      <span className="detection-class">{item.class}</span>
                      <div className="detection-bar-wrap">
                        <div
                          className="detection-bar"
                          style={{ width: `${item.score * 100}%` }}
                        />
                      </div>
                      <span className="detection-score">
                        {(item.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ai-side-col">
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                </svg>
                Face Detection
              </span>
              <StatusBadge
                status={faceDetection.faceStatus === 'ready' ? 'ready' : faceDetection.faceStatus === 'loading' ? 'loading' : 'error'}
                label={faceDetection.faceStatus === 'ready' ? 'Ready' : faceDetection.faceStatus === 'loading' ? 'Loading…' : 'Error'}
              />
            </div>

            <div className="face-count-display">
              <div className="face-count-num">{faceDetection.faces.length}</div>
              <div className="face-count-info">
                <div className="face-count-label">
                  {faceDetection.faces.length === 0 ? 'No faces' : faceDetection.faces.length === 1 ? 'Face detected' : 'Faces detected'}
                </div>
                <div className="face-count-sub">MediaPipe BlazeFace</div>
              </div>
            </div>

            <button
              className="btn btn-outline btn-full"
              style={{ marginTop: 12 }}
              onClick={handleDetectFaces}
              disabled={!camera.isConnected || faceDetection.faceStatus !== 'ready' || faceRunning}
            >
              {faceRunning ? (
                <><span className="spinner" /> Detecting…</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                  </svg>
                  Detect Faces
                </>
              )}
            </button>

            {faceDetection.faceStatus === 'error' && (
              <div className="alert alert-warning" style={{ marginTop: 10 }}>
                <span className="alert-icon">⚠</span>
                <div className="alert-body" style={{ fontSize: 12 }}>
                  MediaPipe model failed to load. Requires internet access on first use.
                </div>
              </div>
            )}
          </div>

          <VoiceAssistant voice={voice} />

          <DetectionHistory history={detectionHistory} onClear={clearHistory} />
        </div>
      </div>
    </div>
  )
}
