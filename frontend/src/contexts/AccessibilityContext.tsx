import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactElement,
} from 'react'

import {
  applyAccessibilitySettings,
  DEFAULT_PREFS,
  loadPrefs,
  savePrefs,
  speakText,
  type AccessibilityPrefs,
} from '@/utils/accessibility'

interface AccessibilityContextValue {
  prefs: AccessibilityPrefs
  updatePref: <K extends keyof AccessibilityPrefs>(key: K, value: AccessibilityPrefs[K]) => void
  resetPrefs: () => void
  announce: (text: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

export function AccessibilityProvider({ children }: PropsWithChildren): ReactElement {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(loadPrefs)

  useEffect(() => {
    applyAccessibilitySettings(prefs)
    savePrefs(prefs)
  }, [prefs])

  const updatePref = useCallback(
    <K extends keyof AccessibilityPrefs>(key: K, value: AccessibilityPrefs[K]) => {
      setPrefs((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const resetPrefs = useCallback(() => {
    setPrefs({ ...DEFAULT_PREFS })
  }, [])

  const announce = useCallback(
    (text: string) => {
      if (prefs.voiceReadout) speakText(text)
    },
    [prefs.voiceReadout],
  )

  const value = useMemo(
    () => ({ prefs, updatePref, resetPrefs, announce }),
    [prefs, updatePref, resetPrefs, announce],
  )

  return (
    <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
  )
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider')
  return ctx
}
