
import { useState, useRef, useCallback, useEffect } from 'react'
import * as ort from 'onnxruntime-web'
import { getObjectPosition } from '../utils/responseGenerator'

const MODEL_URL = '/models/yolo11s.onnx'
const INPUT_SIZE = 640
const BOX_COLOURS = ['#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669']

// Standard YOLO COCO class names (80 classes)
const CLASS_NAMES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus',
  'train', 'truck', 'boat', 'traffic light', 'fire hydrant',
  'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog',
  'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
  'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase',
  'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
  'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
  'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife',
  'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
  'chair', 'couch', 'potted plant', 'bed', 'dining table',
  'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard',
  'cell phone', 'microwave', 'oven', 'toaster', 'sink',
  'refrigerator', 'book', 'clock', 'vase', 'scissors',
  'teddy bear', 'hair drier', 'toothbrush'
]

function getLabelColour(index) {
  return BOX_COLOURS[index % BOX_COLOURS.length]
}

function calculateIoU(a, b) {
  const x1 = Math.max(a.x1, b.x1)
  const y1 = Math.max(a.y1, b.y1)
  const x2 = Math.min(a.x2, b.x2)
  const y2 = Math.min(a.y2, b.y2)

  const intersection = Math.max(0, x2 - x1) *
                       Math.max(0, y2 - y1)

  const areaA = (a.x2 - a.x1) * (a.y2 - a.y1)
  const areaB = (b.x2 - b.x1) * (b.y2 - b.y1)

  return intersection / (areaA + areaB - intersection + 1e-6)
}

function nonMaximumSuppression(boxes, threshold = 0.45) {
  const result = []

  const sorted = [...boxes].sort((a, b) => b.score - a.score)

  while (sorted.length) {
    const best = sorted.shift()
    result.push(best)

    for (let i = sorted.length - 1; i >= 0; i--) {
      if (
        sorted[i].classId === best.classId &&
        calculateIoU(best, sorted[i]) > threshold
      ) {
        sorted.splice(i, 1)
      }
    }
  }

  return result
}

function preprocessImage(img) {
  const canvas = document.createElement('canvas')
  canvas.width = INPUT_SIZE
  canvas.height = INPUT_SIZE

  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'rgb(114,114,114)'
  ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE)

  const scale = Math.min(
    INPUT_SIZE / img.naturalWidth,
    INPUT_SIZE / img.naturalHeight
  )

  const width = img.naturalWidth * scale
  const height = img.naturalHeight * scale

  const padX = (INPUT_SIZE - width) / 2
  const padY = (INPUT_SIZE - height) / 2

  ctx.drawImage(img, padX, padY, width, height)

  const imageData = ctx.getImageData(
    0, 0, INPUT_SIZE, INPUT_SIZE
  ).data

  const input = new Float32Array(1 * 3 * INPUT_SIZE * INPUT_SIZE)

  const channelSize = INPUT_SIZE * INPUT_SIZE

  for (let i = 0; i < channelSize; i++) {
    input[i] = imageData[i * 4] / 255
    input[channelSize + i] = imageData[i * 4 + 1] / 255
    input[channelSize * 2 + i] = imageData[i * 4 + 2] / 255
  }

  return {
    tensor: new ort.Tensor(
      'float32',
      input,
      [1, 3, INPUT_SIZE, INPUT_SIZE]
    ),
    scale,
    padX,
    padY
  }
}

function decodeYOLO(output, scale, padX, padY, imgW, imgH, confidence) {
  const data = output.data
  const dims = output.dims

  if (dims.length !== 3 || dims[0] !== 1) {
    throw new Error(
      `Unexpected YOLO output shape: ${dims.join(' x ')}`
    )
  }

  // Supports [1, 84, 8400] and [1, 8400, 84]
  const channelsFirst = dims[1] < dims[2]
  const numChannels = channelsFirst ? dims[1] : dims[2]
  const numBoxes = channelsFirst ? dims[2] : dims[1]

  const numClasses = numChannels - 4

  if (numClasses <= 0) {
    throw new Error('Invalid YOLO output channel count')
  }

  const getValue = (box, channel) => {
    return channelsFirst
      ? data[channel * numBoxes + box]
      : data[box * numChannels + channel]
  }

  const boxes = []

  for (let i = 0; i < numBoxes; i++) {
    let maxScore = 0
    let classId = 0

    for (let c = 0; c < numClasses; c++) {
      const score = getValue(i, c + 4)

      if (score > maxScore) {
        maxScore = score
        classId = c
      }
    }

    if (maxScore < confidence) continue

    const cx = getValue(i, 0)
    const cy = getValue(i, 1)
    const w = getValue(i, 2)
    const h = getValue(i, 3)

    // YOLO outputs center-x, center-y, width, height
    const x1 = (cx - w / 2 - padX) / scale
    const y1 = (cy - h / 2 - padY) / scale
    const x2 = (cx + w / 2 - padX) / scale
    const y2 = (cy + h / 2 - padY) / scale

    const left = Math.max(0, Math.min(imgW, x1))
    const top = Math.max(0, Math.min(imgH, y1))
    const right = Math.max(0, Math.min(imgW, x2))
    const bottom = Math.max(0, Math.min(imgH, y2))

    if (right <= left || bottom <= top) continue

    boxes.push({
      classId,
      class: CLASS_NAMES[classId] || `class_${classId}`,
      score: maxScore,
      x1: left,
      y1: top,
      x2: right,
      y2: bottom
    })
  }

  return nonMaximumSuppression(boxes).map(box => ({
    class: box.class,
    score: box.score,
    bbox: [
      box.x1,
      box.y1,
      box.x2 - box.x1,
      box.y2 - box.y1
    ]
  }))
}

export function useObjectDetection({ settings = {} }) {
  const modelRef = useRef(null)
  const isDetectingRef = useRef(false)
  const inferenceActiveRef = useRef(false)
  const corsBlockedRef = useRef(false)

  const [modelStatus, setModelStatus] = useState('loading')
  const [detections, setDetections] = useState([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [corsBlocked, setCorsBlocked] = useState(false)

  const confidenceThreshold = settings.confidenceThreshold ?? 0.45
  const detectionInterval = settings.detectionInterval ?? 1500

  // Load YOLOv11 ONNX model
  useEffect(() => {
    let cancelled = false

    async function loadModel() {
      try {
        setModelStatus('loading')

        const session = await ort.InferenceSession.create(
          MODEL_URL,
          {
            executionProviders: ['wasm']
          }
        )

        if (!cancelled) {
          modelRef.current = session
          setModelStatus('ready')
          console.log('YOLOv11 model loaded successfully!')
          console.log('Input:', session.inputNames)
          console.log('Output:', session.outputNames)
        } else {
          await session.release()
        }
      } catch (error) {
        console.error('YOLOv11 loading error:', error)
        if (!cancelled) setModelStatus('error')
      }
    }

    loadModel()

    return () => {
      cancelled = true
      if (modelRef.current) {
        modelRef.current.release()
        modelRef.current = null
      }
    }
  }, [])

  const detectOnce = useCallback(async (imgRef, overlayCanvasRef) => {
    if (!modelRef.current || !imgRef?.current ||
        !overlayCanvasRef?.current ||
        inferenceActiveRef.current) {
      return []
    }

    const img = imgRef.current
    const overlayCanvas = overlayCanvasRef.current

    if (!img.naturalWidth || !img.naturalHeight) return []

    inferenceActiveRef.current = true

    try {
      const { tensor, scale, padX, padY } = preprocessImage(img)

      const feeds = {
        [modelRef.current.inputNames[0]]: tensor
      }

      const results = await modelRef.current.run(feeds)

      const output = results[modelRef.current.outputNames[0]]

      const decodedPredictions = decodeYOLO(
  output,
  scale,
  padX,
  padY,
  img.naturalWidth,
  img.naturalHeight,
  confidenceThreshold
)

const predictions = decodedPredictions.map(pred => ({
  ...pred,
  position: getObjectPosition(
    pred.bbox,
    img.naturalWidth
  )
}))

      if (corsBlockedRef.current) {
        corsBlockedRef.current = false
        setCorsBlocked(false)
      }

      // Draw bounding boxes
      const dispW = img.clientWidth
      const dispH = img.clientHeight

      overlayCanvas.width = dispW
      overlayCanvas.height = dispH

      const ctx = overlayCanvas.getContext('2d')
      ctx.clearRect(0, 0, dispW, dispH)

      const scaleX = dispW / img.naturalWidth
      const scaleY = dispH / img.naturalHeight

      predictions.forEach((pred, i) => {
        const [x, y, w, h] = pred.bbox

        const sx = x * scaleX
        const sy = y * scaleY
        const sw = w * scaleX
        const sh = h * scaleY

        const colour = getLabelColour(i)
        const label = `${pred.class} ${(pred.score * 100).toFixed(0)}%`

        ctx.strokeStyle = colour
        ctx.lineWidth = 2.5
        ctx.strokeRect(sx, sy, sw, sh)

        ctx.font = 'bold 12px Inter, system-ui, sans-serif'
        ctx.textBaseline = 'middle'

        const textW = ctx.measureText(label).width
        const pad = 5
        const pillW = textW + pad * 2
        const pillH = 20
        const pillY = sy > 24 ? sy - 24 : sy + 4

        ctx.fillStyle = colour
        ctx.beginPath()
        ctx.roundRect(sx, pillY, pillW, pillH, 4)
        ctx.fill()

        ctx.fillStyle = '#fff'
        ctx.fillText(label, sx + pad, pillY + pillH / 2)
      })

      return predictions

    } catch (error) {
      console.error('YOLO detection error:', error)

      if (
        error.name === 'SecurityError' ||
        String(error).includes('tainted')
      ) {
        corsBlockedRef.current = true
        setCorsBlocked(true)
      }

      return []
    } finally {
      inferenceActiveRef.current = false
    }
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

        if (results.length > 0 && onDetection) {
          onDetection(results)
        }
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
      if (ctx) {
        ctx.clearRect(
          0, 0,
          overlayCanvasRef.current.width,
          overlayCanvasRef.current.height
        )
      }
    }
  }, [])

  return {
    modelStatus,
    detections,
    isDetecting,
    corsBlocked,
    detectOnce,
    startDetection,
    stopDetection
  }
}
