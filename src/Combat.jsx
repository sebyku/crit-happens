import { useState, useRef, useEffect } from 'react'
import { rollD20, resolveAttack } from './combat.js'
import './Combat.css'

function Combat({ monster, playerStats, playerHp, labels, onVictory, onFlee, onPlayerDamage, onDefeat }) {
  const [monsterHp, setMonsterHp] = useState(monster.hp)
  const [log, setLog] = useState([])
  const [phase, setPhase] = useState('player_turn')
  const logEndRef = useRef(null)
  const playerHpRef = useRef(playerHp)

  useEffect(() => {
    playerHpRef.current = playerHp
  }, [playerHp])

  useEffect(() => {
    if (logEndRef.current?.scrollIntoView) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [log])

  function addLog(text, type = 'info') {
    setLog((prev) => [...prev, { text, type }])
  }

  function applyPlayerDamage(amount) {
    onPlayerDamage(amount)
    const newHp = Math.max(0, playerHpRef.current + amount)
    if (newHp <= 0) {
      addLog(labels.combatDefeat || 'You have been defeated...', 'defeat')
      setPhase('defeat')
      return true
    }
    return false
  }

  function handleAttack() {
    if (phase !== 'player_turn') return

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
    let newMonsterHp = monsterHp
    if (playerResult.hit) {
      newMonsterHp = Math.max(0, monsterHp - playerResult.damage)
      setMonsterHp(newMonsterHp)
    }

    // Apply self-damage to player
    if (playerResult.selfDamage) {
      if (applyPlayerDamage(-playerResult.selfDamage)) return
    }

    // Check monster defeated
    if (newMonsterHp <= 0) {
      addLog(labels.combatVictory?.replace('{name}', monster.name) || `You defeated ${monster.name}!`, 'victory')
      setPhase('victory')
      return
    }

    // Monster turn
    monsterTurn()
  }

  function monsterTurn() {
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
      if (applyPlayerDamage(-monsterResult.damage)) return
    }

    if (monsterResult.selfDamage) {
      const newHp = Math.max(0, monsterHp - monsterResult.selfDamage)
      setMonsterHp(newHp)
      if (newHp <= 0) {
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

      <div className="combat-log">
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
