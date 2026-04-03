import { useState } from 'react'
import { useConfig } from './useConfig.js'
import Journey from './Journey.jsx'
import Settings from './Settings.jsx'
import './App.css'

const SAVE_KEY = 'crit-happens-save'
const LANG_KEY = 'crit-happens-lang'

function App() {
  const config = useConfig()
  const [langOverride, setLangOverride] = useState(() => localStorage.getItem(LANG_KEY))
  const [restartKey, setRestartKey] = useState(0)

  if (!config) return null

  const language = langOverride || config.language

  function handleLanguageChange(lang) {
    localStorage.setItem(LANG_KEY, lang)
    setLangOverride(lang)
  }

  function handleRestart() {
    localStorage.removeItem(SAVE_KEY)
    setRestartKey((k) => k + 1)
  }

  return (
    <>
      <Settings
        language={language}
        onLanguageChange={handleLanguageChange}
        onRestart={handleRestart}
      />
      <Journey
        key={restartKey}
        language={language}
        startGold={config.startGold}
        startHp={config.startHp}
        onRestart={handleRestart}
      />
    </>
  )
}

export default App