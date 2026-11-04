import { useState, useRef, useCallback, useEffect } from 'react'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'

const BOX_COLOURS = ['#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669']

function getLabelColour(index) {
  return BOX_COLOURS[index % BOX_COLOURS.length]
}

export function useObjectDetection({ settings = {} }) {
  const modelRef            = useRef(null)
  const isDetectingRef      = useRef(false)
  const inferenceActiveRef  = useRef(false)
  const corsBlockedRef      = useRef(false)

  const [modelStatus, setModelStatus] = useState('loading')
  const [detections,  setDetections]  = useState([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [corsBlocked, setCorsBlocked] = useState(false)

  const confidenceThreshold = settings.confidenceThreshold ?? 0.45
  const detectionInterval   = settings.detectionInterval   ?? 1500

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setModelStatus('loading')
        const model = await cocoSsd.load()
        if (!cancelled) {
          modelRef.current = model
          setModelStatus('ready')
        }
      } catch {
        if (!cancelled) setModelStatus('error')
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const detectOnce = useCallback(async (imgRef, overlayCanvasRef) => {
    if (!modelRef.current)           return []
    if (!imgRef?.current)            return []
    if (!overlayCanvasRef?.current)  return []
    if (inferenceActiveRef.current)  return []

    const img           = imgRef.current
    const overlayCanvas = overlayCanvasRef.current

    const captureCanvas = document.createElement('canvas')
    const natW = img.naturalWidth  || img.clientWidth  || 640
    const natH = img.naturalHeight || img.clientHeight || 480
    captureCanvas.width  = natW
    captureCanvas.height = natH

    const captureCtx = captureCanvas.getContext('2d')
    try {
      captureCtx.drawImage(img, 0, 0, natW, natH)
    } catch {
      return []
    }

    inferenceActiveRef.current = true
    let predictions = []
    try {
      predictions = await modelRef.current.detect(captureCanvas, 20, confidenceThreshold)
      if (corsBlockedRef.current) {
        corsBlockedRef.current = false
        setCorsBlocked(false)
      }
    } catch (err) {
      if (err.name === 'SecurityError' || String(err).includes('tainted')) {
        corsBlockedRef.current = true
        setCorsBlocked(true)
      }
    } finally {
      inferenceActiveRef.current = false
    }

    if (predictions.length === 0) {
      const octx = overlayCanvas.getContext('2d')
      octx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
      return []
    }

    const dispW = img.clientWidth
    const dispH = img.clientHeight
    overlayCanvas.width  = dispW
    overlayCanvas.height = dispH
    const octx = overlayCanvas.getContext('2d')
    octx.clearRect(0, 0, dispW, dispH)

    const scaleX = dispW / natW
    const scaleY = dispH / natH

    predictions.forEach((pred, i) => {
      const [x, y, w, h] = pred.bbox
      const sx = x * scaleX
      const sy = y * scaleY
      const sw = w * scaleX
      const sh = h * scaleY
      const colour = getLabelColour(i)
      const label  = `${pred.class} ${(pred.score * 100).toFixed(0)}%`

      octx.strokeStyle = colour
      octx.lineWidth   = 2.5
      octx.setLineDash([])
      octx.strokeRect(sx, sy, sw, sh)

      const m = 10
      octx.lineWidth = 3.5
      octx.beginPath(); octx.moveTo(sx, sy + m); octx.lineTo(sx, sy); octx.lineTo(sx + m, sy); octx.stroke()
      octx.beginPath(); octx.moveTo(sx + sw - m, sy); octx.lineTo(sx + sw, sy); octx.lineTo(sx + sw, sy + m); octx.stroke()
      octx.beginPath(); octx.moveTo(sx, sy + sh - m); octx.lineTo(sx, sy + sh); octx.lineTo(sx + m, sy + sh); octx.stroke()
      octx.beginPath(); octx.moveTo(sx + sw - m, sy + sh); octx.lineTo(sx + sw, sy + sh); octx.lineTo(sx + sw, sy + sh - m); octx.stroke()

      octx.font = 'bold 12px Inter, system-ui, sans-serif'
      octx.textBaseline = 'middle'
      const textW = octx.measureText(label).width
      const padH = 5
      const pillW = textW + padH * 2
      const pillH = 20
      const pillY = sy > pillH + 4 ? sy - pillH - 4 : sy + 4
      const pillX = sx - 1

      octx.fillStyle = colour
      octx.beginPath()
      octx.roundRect(pillX, pillY, pillW, pillH, 4)
      octx.fill()

      octx.fillStyle = '#fff'
      octx.fillText(label, pillX + padH, pillY + pillH / 2)
    })

    return predictions
  }, [confidenceThreshold])

  const startDetection = useCallback((imgRef, overlayCanvasRef, onDetection) => {
    if (isDetectingRef.current) return
    isDetectingRef.current = true
    setIsDetecting(true)
    setDetections([])

    const loop = async () => {
      if (!isDetectingRef.current) return

      const results = await detectOnce(imgRef, overlayCanvasRef)
      if (isDetectingRef.current) {
        setDetections(results)
        if (onDetection) onDetection(results)
      }

      if (isDetectingRef.current) {
        setTimeout(loop, detectionInterval)
      }
    }

    loop()
  }, [detectOnce, detectionInterval])

  const stopDetection = useCallback((overlayCanvasRef) => {
    isDetectingRef.current = false
    setIsDetecting(false)
    setDetections([])

    if (overlayCanvasRef?.current) {
      const ctx = overlayCanvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height)
    }
  }, [])

  return {
    modelStatus,
    detections,
    isDetecting,
    corsBlocked,
    detectOnce,
    startDetection,
    stopDetection,
  }
}
