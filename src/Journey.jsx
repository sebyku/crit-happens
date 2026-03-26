import { useState } from 'react'
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

function Journey({ language = 'us' }) {
  const journey = useYaml(`data/journey.${language}.yaml`)
  const labels = useYaml(`data/messages.${language}.yaml`)
  const itemDefs = useItems(language)
  const [currentStepId, setCurrentStepId] = useState('1_start')
  const [history, setHistory] = useState([])
  const [inventory, setInventory] = useState([])

  const step = journey?.steps?.[currentStepId]
  const character = useCharacter(step?.character, language)

  if (!journey || !labels || !step) return null

  const isEnding = !step.reactions || step.reactions.length === 0
  const isCharacterLoading = step.character && !character
  const isConversation = step.character && character

  const visibleReactions = (step.reactions || []).filter((r) => {
    if (r.requires && !inventory.includes(r.requires)) return false
    if (r.requires_not && inventory.includes(r.requires_not)) return false
    return true
  })

  function handleChoice(goto, itemChanges = {}) {
    const targetStep = journey.steps[goto]

    setHistory((prev) => [...prev, { stepId: currentStepId, inventory: [...inventory] }])

    let newInventory = applyItemChanges(
      inventory,
      itemChanges.itemsGive,
      itemChanges.itemsTake
    )
    newInventory = applyItemChanges(
      newInventory,
      targetStep?.items_give,
      targetStep?.items_take
    )

    setInventory(newInventory)
    setCurrentStepId(goto)
  }

  function handleBack() {
    const snapshot = history[history.length - 1]
    if (!snapshot) return
    setCurrentStepId(snapshot.stepId)
    setInventory(snapshot.inventory)
    setHistory((prev) => prev.slice(0, -1))
  }

  function handleRestart() {
    setCurrentStepId('1_start')
    setHistory([])
    setInventory([])
  }

  return (
    <div className="journey">
      <h1>{journey.title}</h1>
      <Inventory items={inventory} itemDefs={itemDefs} />

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
            onExit={handleChoice}
            onItemChange={(changes) => setInventory((prev) =>
              applyItemChanges(prev, changes.itemsGive, changes.itemsTake)
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

          {history.length > 0 && !isEnding && (
            <button className="back" onClick={handleBack}>
              {labels.goBack}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Journey