import { useState, useEffect } from 'react'
import { useYaml } from './useYaml.js'
import { useCharacter } from './useCharacter.js'
import { useItems } from './useItems.js'
import Conversation from './Conversation.jsx'
import Inventory from './Inventory.jsx'
import './Journey.css'

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

  const step = journey?.steps?.[currentStepId]
  const character = useCharacter(step?.character, language)
  const [bgImage, setBgImage] = useState(null)

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

  const visibleReactions = (step.reactions || []).filter((r) => {
    if (r.requires && !inventory.includes(r.requires)) return false
    if (r.requires_not && inventory.includes(r.requires_not)) return false
    if (r.min_gold != null && stats.gold < r.min_gold) return false
    if (r.min_hp != null && stats.hp < r.min_hp) return false
    return true
  })

  function handleChoice(goto, changes = {}) {
    const targetStep = journey.steps[goto]

    // Items
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

    // Stats
    const newStats = applyStats(stats, changes, targetStep)
    setStats(newStats)

    setCurrentStepId(goto)
  }

  function handleRestart() {
    setCurrentStepId('1_start')
    setInventory([])
    setStats({ gold: startGold, hp: startHp })
  }

  return (
    <div className="journey">
      <h1>{journey.title}</h1>
      <Inventory items={inventory} itemDefs={itemDefs} gold={stats.gold} hp={stats.hp} />

      {isCharacterLoading ? (
        <div className="step">
          <p className="description">{step.description}</p>
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