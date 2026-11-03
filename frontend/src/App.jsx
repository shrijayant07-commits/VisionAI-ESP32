
import { useRef, useEffect, useState } from 'react'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'
import './App.css'

function App() {
  const cameraURL = '/camera-stream'
  const cameraRef = useRef(null)
  const canvasRef = useRef(null)
  const [model, setModel] = useState(null)
  const [objectStatus, setObjectStatus] = useState('Loading AI model...')
  const [detections, setDetections] = useState([])

  useEffect(() => {
  async function loadModel() {
    try {
      setObjectStatus('Loading AI model...')

      const loadedModel = await cocoSsd.load()

      setModel(loadedModel)
      setObjectStatus('AI model ready!')

      console.log('COCO-SSD model loaded successfully!')
    } catch (error) {
      console.error('Model loading failed:', error)
      setObjectStatus('AI model failed to load')
    }
  }

  loadModel()
}, [])

  useEffect(() => {
  console.log('Camera element:', cameraRef.current)
  console.log('Canvas element:', canvasRef.current)
}, [])
  function captureFrame() {
  const camera = cameraRef.current
  const canvas = canvasRef.current

  if (!camera || !canvas || !camera.naturalWidth) return

  const context = canvas.getContext('2d')

  canvas.width = camera.naturalWidth
  canvas.height = camera.naturalHeight

  context.drawImage(camera, 0, 0)
  console.log('Frame captured successfully!')
  console.log('Frame size:', canvas.width, 'x', canvas.height)
}

async function detectObjects() {
  if (!model) {
    console.log('AI model is not ready!')
    return
  }

  const canvas = canvasRef.current

  const predictions = await model.detect(canvas, 20, 0.25)
  setDetections(predictions)

  console.log('Detected objects:', predictions)
}

  return (
    <div className="app">
      <header>
        <h1>VisionAI</h1>
        <p>ESP32-CAM Intelligent Vision System</p>
      </header>

      <main>
        <section className="camera-section">
          <h2>Live Camera Feed</h2>

          <img
            ref={cameraRef}
            src={cameraURL}
            alt="ESP32 Camera Live Stream"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <button onClick={() => {
            captureFrame()
            detectObjects()
          }}
          >
          </button>

        </section>
        

        <section className="detection-section">
          <h2>AI Detection</h2>
          <p>Object Detection: {objectStatus}</p>

            {detections.map((item, index) => (
              <p key={index}>
              {item.class} — {(item.score * 100).toFixed(1)}%
          </p>
          ))}
          <p>Face Detection: Initializing...</p>
          <p>Voice Assistant: Waiting...</p>
        </section>
      </main>
    </div>
  )
}

export default App
