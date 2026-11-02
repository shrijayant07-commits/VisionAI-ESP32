
import './App.css'

function App() {
  const cameraURL = 'http://10.19.158.145:81/stream'

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
            src={cameraURL}
            alt="ESP32 Camera Live Stream"
          />
        </section>

        <section className="detection-section">
          <h2>AI Detection</h2>
          <p>Object Detection: Initializing...</p>
          <p>Face Detection: Initializing...</p>
          <p>Voice Assistant: Waiting...</p>
        </section>
      </main>
    </div>
  )
}

export default App
