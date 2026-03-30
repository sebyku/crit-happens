import { useState, useRef, useEffect } from 'react'
import { rollD20, resolveAttack } from './combat.js'
import './Combat.css'

function Combat({ monster, playerStats, playerHp, labels, onVictory, onFlee, onPlayerDamage, onDefeat }) {
  const [monsterHp, setMonsterHp] = useState(monster.hp)
  const [localPlayerHp, setLocalPlayerHp] = useState(playerHp)
  const [log, setLog] = useState([])
  const [phase, setPhase] = useState('player_turn')
  const logEndRef = useRef(null)

  useEffect(() => {
    if (logEndRef.current?.scrollIntoView) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [log])

  function addLog(text, type = 'info') {
    setLog((prev) => [...prev, { text, type }])
  }

  function handleAttack() {
    if (phase !== 'player_turn') return

    let currentPlayerHp = localPlayerHp
    let currentMonsterHp = monsterHp

    // Player attacks
    const playerRoll = rollD20()
    const playerResult = resolveAttack(playerRoll, playerStats.attack, monster.ac)

    if (playerResult.crit) {
      addLog(`🎲 ${playerRoll} — ⚔️ Critical! ${playerResult.damage} damage!`, 'crit')
    } else if (playerResult.hit) {
      addLog(`🎲 ${playerRoll} — ⚔️ Hit! ${playerResult.damage} damage`, 'hit')
    } else if (playerResult.fumble) {
      addLog(`🎲 ${playerRoll} — 💥 Fumble! ${playerResult.selfDamage} self-damage`, 'fumble')
    } else if (playerResult.stumble) {
      addLog(`🎲 ${playerRoll} — 💥 Stumble! ${playerResult.selfDamage} self-damage`, 'stumble')
    } else {
      addLog(`🎲 ${playerRoll} — Miss!`, 'miss')
    }

    // Apply player attack damage to monster
    if (playerResult.hit) {
      currentMonsterHp = Math.max(0, currentMonsterHp - playerResult.damage)
      setMonsterHp(currentMonsterHp)
    }

    // Apply self-damage to player
    if (playerResult.selfDamage) {
      currentPlayerHp = Math.max(0, currentPlayerHp - playerResult.selfDamage)
      setLocalPlayerHp(currentPlayerHp)
      onPlayerDamage(-playerResult.selfDamage)
      if (currentPlayerHp <= 0) {
        addLog(labels.combatDefeat || 'You have been defeated...', 'defeat')
        setPhase('defeat')
        return
      }
    }

    // Check monster defeated
    if (currentMonsterHp <= 0) {
      addLog(labels.combatVictory?.replace('{name}', monster.name) || `You defeated ${monster.name}!`, 'victory')
      setPhase('victory')
      return
    }

    // Monster turn
    const monsterRoll = rollD20()
    const monsterResult = resolveAttack(monsterRoll, monster.attack, playerStats.ac)

    if (monsterResult.crit) {
      addLog(`${monster.name} 🎲 ${monsterRoll} — ⚔️ Critical! ${monsterResult.damage} damage!`, 'enemy-crit')
    } else if (monsterResult.hit) {
      addLog(`${monster.name} 🎲 ${monsterRoll} — ⚔️ ${monsterResult.damage} damage`, 'enemy-hit')
    } else if (monsterResult.fumble) {
      addLog(`${monster.name} 🎲 ${monsterRoll} — 💥 Fumble!`, 'enemy-fumble')
    } else if (monsterResult.stumble) {
      addLog(`${monster.name} 🎲 ${monsterRoll} — 💥 Stumble!`, 'enemy-stumble')
    } else {
      addLog(`${monster.name} 🎲 ${monsterRoll} — Miss!`, 'enemy-miss')
    }

    if (monsterResult.hit) {
      currentPlayerHp = Math.max(0, currentPlayerHp - monsterResult.damage)
      setLocalPlayerHp(currentPlayerHp)
      onPlayerDamage(-monsterResult.damage)
      if (currentPlayerHp <= 0) {
        addLog(labels.combatDefeat || 'You have been defeated...', 'defeat')
        setPhase('defeat')
        return
      }
    }

    if (monsterResult.selfDamage) {
      currentMonsterHp = Math.max(0, currentMonsterHp - monsterResult.selfDamage)
      setMonsterHp(currentMonsterHp)
      if (currentMonsterHp <= 0) {
        addLog(labels.combatVictory?.replace('{name}', monster.name) || `You defeated ${monster.name}!`, 'victory')
        setPhase('victory')
      }
    }
  }

  const hpPercent = Math.max(0, (monsterHp / monster.hp) * 100)

  return (
    <div className="combat">
      <div className="combat-monster">
        <div className="combat-monster-name">{monster.name}</div>
        <div className="combat-hp-bar">
          <div className="combat-hp-fill" style={{ width: `${hpPercent}%` }} />
        </div>
        <div className="combat-hp-text">{monsterHp} / {monster.hp}</div>
      </div>

      <div className="combat-log" role="log" aria-live="polite">
        {log.map((entry, i) => (
          <div key={i} className={`combat-log-entry ${entry.type}`}>
            {entry.text}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {phase === 'player_turn' && (
        <div className="combat-actions">
          <button className="combat-btn attack" onClick={handleAttack}>
            {labels.combatAttack || 'Attack'}
          </button>
          <button className="combat-btn flee" onClick={onFlee}>
            {labels.combatFlee || 'Flee'}
          </button>
        </div>
      )}

      {phase === 'victory' && (
        <div className="combat-actions">
          <button className="combat-btn victory" onClick={onVictory}>
            ➤
          </button>
        </div>
      )}

      {phase === 'defeat' && (
        <div className="combat-actions">
          <button className="combat-btn defeat" onClick={onDefeat}>
            {labels.playAgain || 'Play again'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Combat
