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

export function speakText(text: string): void {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'hr-HR'
  utterance.rate = 0.95
  window.speechSynthesis.speak(utterance)
}

export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window
}
