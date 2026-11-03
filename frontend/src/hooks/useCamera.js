import { useState, useCallback } from 'react'
import { validateIP, buildStreamUrl, parseIP } from '../utils/cameraUtils'

const STORAGE_KEY = 'visionai-camera-ip'

export function useCamera({ showToast }) {
  const [cameraIP, setCameraIP] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ''
  )
  const [streamUrl, setStreamUrl]         = useState(null)
  const [isConnected, setIsConnected]     = useState(false)
  const [isConnecting, setIsConnecting]   = useState(false)
  const [isDemo, setIsDemo]               = useState(false)
  const [connectionError, setConnectionError] = useState(null)

  const connectDemo = useCallback((customUrl) => {
    const demoUrl = customUrl || '/sample-feed.png'
    setConnectionError(null)
    setIsConnecting(false)
    setIsDemo(true)
    setStreamUrl(demoUrl)
    setIsConnected(true)
    showToast('Demo simulation stream connected', 'info')
  }, [showToast])

  const connect = useCallback((ip) => {
    const error = validateIP(ip)
    if (error) {
      setConnectionError(error)
      return false
    }

    const url = buildStreamUrl(ip)
    setConnectionError(null)
    setIsConnecting(true)
    setIsConnected(false)
    setIsDemo(false)
    setStreamUrl(url)

    const cleanIP = parseIP(ip)
    setCameraIP(cleanIP)
    localStorage.setItem(STORAGE_KEY, cleanIP)

    showToast('Connecting to camera…', 'info')
    return true
  }, [showToast])

  const disconnect = useCallback(() => {
    setStreamUrl(null)
    setIsConnected(false)
    setIsConnecting(false)
    setIsDemo(false)
    setConnectionError(null)
    showToast('Camera disconnected', 'info')
  }, [showToast])

  const handleConnected = useCallback(() => {
    setIsConnected(true)
    setIsConnecting(false)
    setConnectionError(null)
    showToast('Camera connected!', 'success')
  }, [showToast])

  const handleError = useCallback(() => {
    setIsConnected(false)
    setIsConnecting(false)
    setStreamUrl(null)
    setConnectionError(
      'Cannot reach the camera. Check that:\n' +
      '• The IP address is correct\n' +
      '• ESP32-CAM is powered on\n' +
      '• Your device is on the same Wi-Fi network'
    )
    showToast('Camera connection failed', 'error')
  }, [showToast])

  const clearSavedIP = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCameraIP('')
    showToast('Saved IP cleared', 'success')
  }, [showToast])

  return {
    cameraIP,
    setCameraIP,
    streamUrl,
    isConnected,
    isConnecting,
    isDemo,
    connectionError,
    connect,
    connectDemo,
    disconnect,
    handleConnected,
    handleError,
    clearSavedIP,
  }
}
