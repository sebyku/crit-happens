import { useState } from 'react'
import './Settings.css'

function Settings({ language, onLanguageChange, onRestart, labels }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="settings">
      <button className="settings-gear" onClick={() => setOpen((v) => !v)} aria-label="Settings">
        ⚙
      </button>

      {open && (
        <div className="settings-menu">
          <div className="settings-section">
            <span className="settings-label">{labels?.language || 'Language'}</span>
            <div className="settings-options">
              <button
                className={`settings-option${language === 'us' ? ' active' : ''}`}
                onClick={() => onLanguageChange('us')}
              >
                EN
              </button>
              <button
                className={`settings-option${language === 'fr' ? ' active' : ''}`}
                onClick={() => onLanguageChange('fr')}
              >
                FR
              </button>
            </div>
          </div>

          <button className="settings-restart" onClick={() => { onRestart(); setOpen(false) }}>
            {labels?.restart || 'New Game'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Settings