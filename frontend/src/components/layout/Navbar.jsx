const NAV_ITEMS = [
  {
    id:    'dashboard',
    label: 'Dashboard',
    icon:  (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id:    'camera',
    label: 'Live Camera',
    icon:  (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    id:    'ai',
    label: 'AI Detection',
    icon:  (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3m-4.22-6.78-2.12 2.12M6.34 17.66l-2.12 2.12m0-13.56 2.12 2.12m8.48 8.48 2.12 2.12"/>
      </svg>
    ),
  },
  {
    id:    'settings',
    label: 'Settings',
    icon:  (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

export default function Navbar({ page, setPage }) {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">V</div>
          <div>
            <span className="logo-name">VisionAI</span>
            <span className="logo-tagline">ESP32-CAM Platform</span>
          </div>
        </div>
      </div>

      <ul className="sidebar-nav" role="list">
        <li className="sidebar-section-label">Navigation</li>
        {NAV_ITEMS.map(item => (
          <li key={item.id}>
            <button
              className={`sidebar-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
              aria-current={page === item.id ? 'page' : undefined}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span className="sidebar-item-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--success)',
            animation: 'pulse-green 2s infinite',
          }} />
          <span className="sidebar-version">VisionAI v1.0</span>
        </div>
      </div>
    </nav>
  )
}
