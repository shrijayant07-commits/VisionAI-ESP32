export default function VoiceAssistant({ voice }) {
  const {
    voiceEnabled, setVoiceEnabled,
    language, setLanguage,
    tamilAvailable,
    testVoice,
  } = voice

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          Voice Assistant
        </span>
        <label className="toggle" title={voiceEnabled ? 'Disable voice' : 'Enable voice'}>
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={e => setVoiceEnabled(e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
        Select feedback language:
      </p>

      <div className="voice-lang-grid">
        <button
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
          disabled={!voiceEnabled}
        >
          <span className="lang-flag">🇬🇧</span>
          <span className="lang-name">English</span>
          <span className="lang-locale">en-IN</span>
        </button>

        <button
          className={`lang-btn ${language === 'ta' ? 'active' : ''}`}
          onClick={() => setLanguage('ta')}
          disabled={!voiceEnabled}
        >
          <span className="lang-flag">🇮🇳</span>
          <span className="lang-name">தமிழ்</span>
          <span className="lang-locale">ta-IN</span>
        </button>
      </div>

      {language === 'ta' && !tamilAvailable && (
        <div className="alert alert-warning" style={{ marginTop: 10 }}>
          <span className="alert-icon">⚠</span>
          <div className="alert-body">
            <div className="alert-title">Tamil voice not available</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>
              Your browser/OS does not have a Tamil (ta-IN) voice installed.
              On <strong>Windows</strong>: install the Tamil language pack in Settings → Time &amp; Language.
              On <strong>Android</strong>: install Google TTS and enable Tamil. Falling back to English audio.
            </div>
          </div>
        </div>
      )}

      <div className="voice-actions">
        <button
          className="btn btn-outline btn-sm"
          onClick={testVoice}
          disabled={!voiceEnabled}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Test Voice
        </button>

        {!voiceEnabled && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
            Voice is muted — AI detection still runs
          </p>
        )}
      </div>

      {voiceEnabled && (
        <div style={{
          marginTop: 12, padding: '10px 12px',
          background: 'var(--bg-surface-2)',
          borderRadius: 'var(--r-md)',
          fontSize: 12, color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--text-secondary)' }}>How it works:</strong> Each detected
          object is announced once. The same object won't be repeated for 8 seconds.
          {language === 'ta' && tamilAvailable && (
            <span> 🎉 Tamil voice is available on your device!</span>
          )}
        </div>
      )}
    </div>
  )
}
