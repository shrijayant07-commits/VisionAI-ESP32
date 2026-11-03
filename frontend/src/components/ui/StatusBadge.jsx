export default function StatusBadge({ status, label }) {
  const CLASS_MAP = {
    connected:    'badge-success',
    ready:        'badge-success',
    disconnected: 'badge-error',
    error:        'badge-error',
    connecting:   'badge-warning',
    loading:      'badge-warning',
    active:       'badge-accent',
    idle:         'badge-neutral',
    info:         'badge-info',
  }

  return (
    <span className={`badge ${CLASS_MAP[status] || 'badge-neutral'}`}>
      <span className="badge-dot" />
      {label}
    </span>
  )
}
