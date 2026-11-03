import { useCallback } from 'react'

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const CATEGORY_COLOURS = {
  person:   '#4F46E5',
  animal:   '#059669',
  vehicle:  '#D97706',
  object:   '#0284C7',
  food:     '#DC2626',
}

const ANIMALS   = new Set(['dog','cat','bird','horse','cow','sheep','elephant','bear','zebra','giraffe'])
const VEHICLES  = new Set(['bicycle','car','motorcycle','airplane','bus','train','truck','boat'])
const FOOD      = new Set(['banana','apple','sandwich','orange','broccoli','carrot','pizza','cake'])

function getColour(cls) {
  if (cls === 'person') return CATEGORY_COLOURS.person
  if (ANIMALS.has(cls))  return CATEGORY_COLOURS.animal
  if (VEHICLES.has(cls)) return CATEGORY_COLOURS.vehicle
  if (FOOD.has(cls))     return CATEGORY_COLOURS.food
  return CATEGORY_COLOURS.object
}

export default function DetectionHistory({ history, onClear }) {
  const handleClear = useCallback(() => {
    if (window.confirm('Clear all detection history?')) onClear()
  }, [onClear])

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Detection History
        </span>
        {history.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={handleClear} style={{ color: 'var(--error)' }}>
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No detections yet</div>
          <div className="empty-state-desc">
            Start AI detection to record what the camera sees
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {history.length} detection{history.length !== 1 ? 's' : ''} recorded
          </div>
          <div className="history-list">
            {history.map(item => (
              <div key={item.id} className="history-item">
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: getColour(item.class),
                  flexShrink: 0,
                }} />

                <span className="history-class">{item.class}</span>

                <span className="history-score">
                  {(item.score * 100).toFixed(0)}%
                </span>

                <span className="history-time">
                  {formatTime(item.time)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
