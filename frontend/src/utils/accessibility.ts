export interface AccessibilityPrefs {
  fontSize: 'normal' | 'large' | 'xl'
  highContrast: boolean
  simplifiedView: boolean
  voiceReadout: boolean
}

export const DEFAULT_PREFS: AccessibilityPrefs = {
  fontSize: 'normal',
  highContrast: false,
  simplifiedView: false,
  voiceReadout: false,
}

const LS_KEY = 'accessibility_prefs'

export function loadPrefs(): AccessibilityPrefs {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<AccessibilityPrefs>) }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function savePrefs(prefs: AccessibilityPrefs): void {
  localStorage.setItem(LS_KEY, JSON.stringify(prefs))
}

export function applyAccessibilitySettings(prefs: AccessibilityPrefs): void {
  const html = document.documentElement

  html.classList.remove('font-size-large', 'font-size-xl')
  if (prefs.fontSize === 'large') html.classList.add('font-size-large')
  else if (prefs.fontSize === 'xl') html.classList.add('font-size-xl')

  html.classList.toggle('high-contrast', prefs.highContrast)
  html.classList.toggle('simplified-view', prefs.simplifiedView)
}

function pickCroatianVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === 'hr-HR') ??
    voices.find((v) => v.lang.startsWith('hr')) ??
    null
  )
}

function buildUtterance(text: string): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'hr-HR'
  utterance.rate = 0.95
  const voice = pickCroatianVoice()
  if (voice) utterance.voice = voice
  return utterance
}

export function speakText(text: string): void {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()

  // Chrome populates getVoices() asynchronously; wait for the list if empty.
  if (window.speechSynthesis.getVoices().length > 0) {
    window.speechSynthesis.speak(buildUtterance(text))
  } else {
    window.speechSynthesis.addEventListener(
      'voiceschanged',
      () => { window.speechSynthesis.speak(buildUtterance(text)) },
      { once: true },
    )
  }
}

export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window
}

/** Returns true once the voice list is populated and a Croatian voice exists. */
export function hasCroatianVoice(): boolean {
  if (!isSpeechSupported()) return false
  return pickCroatianVoice() !== null
}
