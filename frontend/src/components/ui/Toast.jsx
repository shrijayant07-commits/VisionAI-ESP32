import { useEffect, useCallback } from 'react'

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  const dismiss = useCallback(() => onDismiss(toast.id), [toast.id, onDismiss])

  useEffect(() => {
    const t = setTimeout(dismiss, 4000)
    return () => clearTimeout(t)
  }, [dismiss])

  return (
    <div className={`toast toast-${toast.type}`} role="alert">
      <span className="toast-icon">{ICONS[toast.type] || 'ℹ'}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={dismiss} aria-label="Dismiss">✕</button>
    </div>
  )
}
