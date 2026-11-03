import { useState, useRef, useCallback, useEffect } from 'react'

const FACE_COLOUR = '#F59E0B'

export function useFaceDetection() {
  const detectorRef = useRef(null)

  const [faceStatus, setFaceStatus] = useState('loading')
  const [faces,      setFaces]      = useState([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setFaceStatus('loading')

        const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision')

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        )

        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU',
          },
          runningMode: 'IMAGE',
          minDetectionConfidence: 0.5,
          minSuppressionThreshold: 0.3,
        })

        if (!cancelled) {
          detectorRef.current = detector
          setFaceStatus('ready')
        }
      } catch {
        if (!cancelled) setFaceStatus('error')
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const detectFaces = useCallback(async (imgRef, overlayCanvasRef) => {
    if (!detectorRef.current) return []
    if (!imgRef?.current)     return []

    const img = imgRef.current

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width  = img.naturalWidth  || img.clientWidth  || 640
    tempCanvas.height = img.naturalHeight || img.clientHeight || 480
    const ctx = tempCanvas.getContext('2d')
    try {
      ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height)
    } catch {
      return []
    }

    let result
    try {
      result = detectorRef.current.detect(tempCanvas)
    } catch {
      return []
    }

    const detectedFaces = result?.detections ?? []
    setFaces(detectedFaces)

    if (overlayCanvasRef?.current && detectedFaces.length > 0) {
      const overlay = overlayCanvasRef.current
      const dispW   = img.clientWidth
      const dispH   = img.clientHeight
      overlay.width  = dispW
      overlay.height = dispH
      const octx = overlay.getContext('2d')

      const scaleX = dispW / tempCanvas.width
      const scaleY = dispH / tempCanvas.height

      detectedFaces.forEach(face => {
        const bb = face.boundingBox
        const x = bb.originX * scaleX
        const y = bb.originY * scaleY
        const w = bb.width   * scaleX
        const h = bb.height  * scaleY

        octx.strokeStyle = FACE_COLOUR
        octx.lineWidth   = 2.5
        octx.strokeRect(x, y, w, h)

        const label = `Face ${(face.categories?.[0]?.score * 100 || 0).toFixed(0)}%`
        octx.font      = 'bold 12px Inter, system-ui, sans-serif'
        octx.fillStyle = FACE_COLOUR
        const tw = octx.measureText(label).width
        octx.fillRect(x - 1, y - 22, tw + 12, 20)
        octx.fillStyle = '#fff'
        octx.textBaseline = 'middle'
        octx.fillText(label, x + 5, y - 12)
      })
    }

    return detectedFaces
  }, [])

  const clearFaces = useCallback(() => setFaces([]), [])

  return {
    faceStatus,
    faces,
    detectFaces,
    clearFaces,
  }
}
