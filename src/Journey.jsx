import { useState, useEffect } from 'react'
import { useYaml } from './useYaml.js'
import { useCharacter } from './useCharacter.js'
import { useItems } from './useItems.js'
import { useMonster } from './useMonster.js'
import { computePlayerStats } from './combat.js'
import Conversation from './Conversation.jsx'
import Combat from './Combat.jsx'
import Inventory from './Inventory.jsx'
import './Journey.css'

const SAVE_KEY = 'crit-happens-save'

const EMPTY_EQUIPMENT = {
  head: null, torso: null, legs: null,
  feet: null, right_hand: null, left_hand: null,
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function applyItemChanges(current, give = [], take = [], itemDefs = {}) {
  const next = { ...current }
  for (const id of give) {
    const max = itemDefs[id]?.max ?? 1
    next[id] = Math.min((next[id] || 0) + 1, max)
  }
  for (const id of take) {
    if (next[id]) {
      next[id] -= 1
      if (next[id] <= 0) delete next[id]
    }
  }
  return next
}

function hasItem(inventory, itemId) {
  return (inventory[itemId] || 0) > 0
}

function applyStats(current, maxHp, ...changes) {
  let gold = current.gold
  let hp = current.hp
  for (const c of changes) {
    if (!c) continue
    if (c.gold != null) gold += c.gold
    if (c.hp != null) hp += c.hp
  }
  return { gold: Math.max(0, gold), hp: Math.max(0, Math.min(hp, maxHp)) }
}

function cleanEquipment(inv, equip) {
  const cleaned = { ...equip }
  let changed = false
  for (const [slot, itemId] of Object.entries(cleaned)) {
    if (itemId && !hasItem(inv, itemId)) {
      cleaned[slot] = null
      changed = true
    }
  }
  return changed ? cleaned : equip
}

function Journey({ language = 'us', startGold = 10, startHp = 100, onRestart }) {
  const journey = useYaml(`data/journey.${language}.yaml`)
  const labels = useYaml(`data/messages.${language}.yaml`)
  const itemDefs = useItems(language)

  const save = loadSave()
  const [currentStepId, setCurrentStepId] = useState(save?.currentStepId || '1_start')
  const [inventory, setInventory] = useState(save?.inventory || {})
  const [stats, setStats] = useState(save?.stats || { gold: startGold, hp: startHp })
  const [equipment, setEquipment] = useState(save?.equipment || { ...EMPTY_EQUIPMENT })
  const [buffs, setBuffs] = useState(save?.buffs || {})

  const step = journey?.steps?.[currentStepId]
  const character = useCharacter(step?.character, language)
  const monster = useMonster(step?.monster, language)
  const playerStats = computePlayerStats(equipment, itemDefs, buffs)

  // Save game state to localStorage on every change
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      currentStepId, inventory, stats, equipment, buffs,
    }))
  }, [currentStepId, inventory, stats, equipment, buffs])

  const stepImage = step?.image
    ? `${import.meta.env.BASE_URL}images/${step.image}`
    : null

  useEffect(() => {
    if (stepImage) {
      document.body.style.backgroundImage = `url(${stepImage})`
    }
  }, [stepImage])

  useEffect(() => {
    return () => { document.body.style.backgroundImage = '' }
  }, [])

  if (!journey || !labels || !step) return null

  const isEnding = !step.reactions || step.reactions.length === 0
  const isCharacterLoading = step.character && !character
  const isConversation = step.character && character
  const isMonsterLoading = step.monster && !monster
  const isCombat = step.monster && monster

  const visibleReactions = (step.reactions || []).filter((r) => {
    if (r.requires && !hasItem(inventory, r.requires)) return false
    if (r.requires_not && hasItem(inventory, r.requires_not)) return false
    if (r.requires_equipped && !Object.values(equipment).includes(r.requires_equipped)) return false
    if (r.requires_not_equipped && Object.values(equipment).includes(r.requires_not_equipped)) return false
    if (r.min_gold != null && stats.gold < r.min_gold) return false
    if (r.min_hp != null && stats.hp < r.min_hp) return false
    return true
  })

  function handleChoice(goto, changes = {}) {
    const targetStep = journey.steps[goto]

    setInventory((prevInv) => {
      let newInv = applyItemChanges(prevInv, changes.itemsGive, changes.itemsTake, itemDefs)
      newInv = applyItemChanges(newInv, targetStep?.items_give, targetStep?.items_take, itemDefs)
      setEquipment((prevEquip) => cleanEquipment(newInv, prevEquip))
      return newInv
    })

    setStats((prev) => applyStats(prev, startHp, changes, targetStep))
    setCurrentStepId(goto)
  }

  function handleEquip(itemId) {
    const def = itemDefs[itemId]
    if (!def?.slots) return
    setEquipment((prev) => {
      const next = { ...prev }
      const alreadyEquipped = def.slots.every((slot) => next[slot] === itemId)
      if (alreadyEquipped) {
        for (const slot of def.slots) next[slot] = null
        return next
      }
      for (const slot of def.slots) next[slot] = itemId
      return next
    })
  }

  function handleRestart() {
    localStorage.removeItem(SAVE_KEY)
    setCurrentStepId('1_start')
    setInventory({})
    setStats({ gold: startGold, hp: startHp })
    setEquipment({ ...EMPTY_EQUIPMENT })
    setBuffs({})
    onRestart?.()
  }

  return (
    <div className="journey">
      <h1>{journey.title}</h1>
      <Inventory
        items={inventory}
        itemDefs={itemDefs}
        gold={stats.gold}
        hp={stats.hp}
        playerAc={playerStats.ac}
        playerAttack={playerStats.attack}
        equipment={equipment}
        onEquip={handleEquip}
        labels={labels}
      />

      {isMonsterLoading || isCharacterLoading ? (
        <div className="step">
          <p className="description">{step.description}</p>
        </div>
      ) : isCombat ? (
        <div className="step">
          <p className="description">{step.description}</p>
          <Combat
            key={currentStepId}
            monster={monster}
            playerStats={playerStats}
            playerHp={stats.hp}
            labels={labels}
            inventory={inventory}
            itemDefs={itemDefs}
            onVictory={() => { setBuffs({}); handleChoice(step.victory_goto) }}
            onFlee={() => { setBuffs({}); handleChoice(step.flee_goto) }}
            onPlayerDamage={(damage) => setStats((prev) =>
              applyStats(prev, startHp, { hp: -damage })
            )}
            onUseItem={(itemId) => setInventory((prev) =>
              applyItemChanges(prev, [], [itemId], itemDefs)
            )}
            onDefeat={() => {
              setBuffs({})
              document.body.style.backgroundImage = `url(${import.meta.env.BASE_URL}images/game_over.jpg)`
              setCurrentStepId('game_over')
            }}
          />
        </div>
      ) : isConversation ? (
        <div className="step">
          <p className="description">{step.description}</p>
          <Conversation
            key={currentStepId}
            character={character}
            labels={labels}
            reactions={visibleReactions}
            gold={stats.gold}
            inventory={inventory}
            itemDefs={itemDefs}
            onExit={handleChoice}
            onItemChange={(changes) => {
              setInventory((prevInv) => {
                const newInv = applyItemChanges(prevInv, changes.itemsGive, changes.itemsTake, itemDefs)
                setEquipment((prevEquip) => cleanEquipment(newInv, prevEquip))
                return newInv
              })
            }}
            onStatsChange={(changes) => setStats((prev) =>
              applyStats(prev, startHp, changes)
            )}
            onBuff={(buff) => setBuffs((prev) => ({
              attack: (prev.attack || 0) + (buff.attack || 0),
              ac: (prev.ac || 0) + (buff.ac || 0),
            }))}
          />
        </div>
      ) : (
        <div className="step">
          <p className="description">{step.description}</p>

          <div className="reactions">
            {visibleReactions.map((reaction, i) => (
              <button
                key={`${reaction.goto}-${i}`}
                className="reaction"
                onClick={() => handleChoice(reaction.goto, {
                  itemsGive: reaction.items_give,
                  itemsTake: reaction.items_take,
                  gold: reaction.gold,
                  hp: reaction.hp,
                })}
              >
                {reaction.label}
              </button>
            ))}
          </div>

          {isEnding && (
            <button className="reaction restart" onClick={handleRestart}>
              {labels.playAgain}
            </button>
          )}

        </div>
      )}
    </div>
  )
}

export default Journey