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

const EMPTY_EQUIPMENT = {
  head: null, torso: null, legs: null,
  feet: null, right_hand: null, left_hand: null,
}

function applyItemChanges(current, give = [], take = []) {
  const set = new Set(current)
  for (const id of give) set.add(id)
  for (const id of take) set.delete(id)
  return [...set]
}

function applyStats(current, ...changes) {
  let gold = current.gold
  let hp = current.hp
  for (const c of changes) {
    if (!c) continue
    if (c.gold) gold += c.gold
    if (c.hp) hp += c.hp
  }
  return { gold: Math.max(0, gold), hp: Math.max(0, hp) }
}

function Journey({ language = 'us', startGold = 10, startHp = 100 }) {
  const journey = useYaml(`data/journey.${language}.yaml`)
  const labels = useYaml(`data/messages.${language}.yaml`)
  const itemDefs = useItems(language)
  const [currentStepId, setCurrentStepId] = useState('1_start')
  const [inventory, setInventory] = useState([])
  const [stats, setStats] = useState({ gold: startGold, hp: startHp })
  const [equipment, setEquipment] = useState({ ...EMPTY_EQUIPMENT })

  const step = journey?.steps?.[currentStepId]
  const character = useCharacter(step?.character, language)
  const monster = useMonster(step?.monster, language)
  const [bgImage, setBgImage] = useState(null)

  const playerStats = computePlayerStats(equipment, itemDefs)

  // Track background image — keep last one if step has no image
  const stepImage = step?.image
    ? `${import.meta.env.BASE_URL}images/${step.image}`
    : null
  if (stepImage && stepImage !== bgImage) {
    setBgImage(stepImage)
  }

  useEffect(() => {
    if (bgImage) {
      document.body.style.backgroundImage = `url(${bgImage})`
    }
    return () => {
      document.body.style.backgroundImage = ''
    }
  }, [bgImage])

  if (!journey || !labels || !step) return null

  const isEnding = !step.reactions || step.reactions.length === 0
  const isCharacterLoading = step.character && !character
  const isConversation = step.character && character
  const isMonsterLoading = step.monster && !monster
  const isCombat = step.monster && monster

  const visibleReactions = (step.reactions || []).filter((r) => {
    if (r.requires && !inventory.includes(r.requires)) return false
    if (r.requires_not && inventory.includes(r.requires_not)) return false
    if (r.min_gold != null && stats.gold < r.min_gold) return false
    if (r.min_hp != null && stats.hp < r.min_hp) return false
    return true
  })

  function handleChoice(goto, changes = {}) {
    const targetStep = journey.steps[goto]

    let newInventory = applyItemChanges(
      inventory,
      changes.itemsGive,
      changes.itemsTake
    )
    newInventory = applyItemChanges(
      newInventory,
      targetStep?.items_give,
      targetStep?.items_take
    )
    setInventory(newInventory)

    const newStats = applyStats(stats, changes, targetStep)
    setStats(newStats)

    setCurrentStepId(goto)
  }

  function handleEquip(itemId) {
    const def = itemDefs[itemId]
    if (!def?.slots) return
    setEquipment((prev) => {
      const next = { ...prev }
      // Check if already equipped — unequip
      const alreadyEquipped = def.slots.every((slot) => next[slot] === itemId)
      if (alreadyEquipped) {
        for (const slot of def.slots) next[slot] = null
        return next
      }
      // Equip in all required slots
      for (const slot of def.slots) next[slot] = itemId
      return next
    })
  }

  function handleRestart() {
    setCurrentStepId('1_start')
    setInventory([])
    setStats({ gold: startGold, hp: startHp })
    setEquipment({ ...EMPTY_EQUIPMENT })
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
            onVictory={() => handleChoice(step.victory_goto)}
            onFlee={() => handleChoice(step.flee_goto)}
            onPlayerDamage={(hp) => setStats((prev) =>
              applyStats(prev, { hp })
            )}
            onDefeat={() => {
              setBgImage(`${import.meta.env.BASE_URL}images/game_over.jpg`)
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
            onExit={handleChoice}
            onItemChange={(changes) => setInventory((prev) =>
              applyItemChanges(prev, changes.itemsGive, changes.itemsTake)
            )}
            onStatsChange={(changes) => setStats((prev) =>
              applyStats(prev, changes)
            )}
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
