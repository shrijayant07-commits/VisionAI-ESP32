import { useState, useRef, useCallback, useEffect } from 'react'
import { generateResponse } from '../utils/responseGenerator'
import {
  buildTamilPhrase,
  TAMIL_SYSTEM_PHRASES,
  ENGLISH_SYSTEM_PHRASES,
} from '../utils/speechUtils'

const COOLDOWN_MS    = 8000
const STORAGE_LANG   = 'visionai-voice-lang'
const STORAGE_ENABLE = 'visionai-voice-enabled'

export function useVoice() {
  const [language,     setLanguageState] = useState(
    () => localStorage.getItem(STORAGE_LANG) || 'en'
  )
  const [voiceEnabled, setVoiceEnabledState] = useState(
    () => localStorage.getItem(STORAGE_ENABLE) !== 'false'
  )
  const [availableVoices, setAvailableVoices] = useState([])
  const [tamilAvailable,  setTamilAvailable]  = useState(false)

  const lastAnnouncedRef = useRef({})

  useEffect(() => {
    if (!window.speechSynthesis) return

    const update = () => {
      const voices = window.speechSynthesis.getVoices()
      setAvailableVoices(voices)
      setTamilAvailable(voices.some(v => v.lang.startsWith('ta')))
    }

    update()
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  const speak = useCallback((text, forceLang) => {
    if (!window.speechSynthesis) return

    const lang = forceLang || language

    window.speechSynthesis.cancel()

    const utterance    = new SpeechSynthesisUtterance(text)
    utterance.lang     = lang === 'ta' ? 'ta-IN' : 'en-IN'
    utterance.rate     = lang === 'ta' ? 0.85 : 0.92
    utterance.pitch    = 1.0
    utterance.volume   = 1.0

    const voices   = window.speechSynthesis.getVoices()
    const langCode = lang === 'ta' ? 'ta' : 'en'
    const voice    = voices.find(v => v.lang.startsWith(langCode))
    if (voice) utterance.voice = voice

    window.speechSynthesis.speak(utterance)
  }, [language])

  const announceDetection = useCallback((objectClass, position = 'centre') => {
  if (!voiceEnabled) return

  const now = Date.now()
  const last = lastAnnouncedRef.current[objectClass] || 0

  if (now - last < COOLDOWN_MS) return

  lastAnnouncedRef.current[objectClass] = now

  const response = generateResponse({
    name: objectClass,
    position,
    language,
  })

  if (response) {
    speak(response)
  } else if (language === 'ta') {
    speak(buildTamilPhrase(objectClass))
  } else {
    const name = objectClass.charAt(0).toUpperCase() + objectClass.slice(1)
    speak(`${name} detected.`)
  }
}, [voiceEnabled, language, speak])

  const announceSystem = useCallback((eventKey) => {
    if (!voiceEnabled) return
    const phrases = language === 'ta' ? TAMIL_SYSTEM_PHRASES : ENGLISH_SYSTEM_PHRASES
    const text    = phrases[eventKey]
    if (text) speak(text)
  }, [voiceEnabled, language, speak])

  const testVoice = useCallback(() => {
    const phrases = language === 'ta' ? TAMIL_SYSTEM_PHRASES : ENGLISH_SYSTEM_PHRASES
    speak(phrases.testVoice)
  }, [language, speak])

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_LANG, lang)
    lastAnnouncedRef.current = {}
  }, [])

  const setVoiceEnabled = useCallback((enabled) => {
    setVoiceEnabledState(enabled)
    localStorage.setItem(STORAGE_ENABLE, String(enabled))
    if (!enabled) window.speechSynthesis?.cancel()
  }, [])

  return {
    voiceEnabled,
    setVoiceEnabled,
    language,
    setLanguage,
    availableVoices,
    tamilAvailable,
    speak,
    announceDetection,
    announceSystem,
    testVoice,
  }
}
