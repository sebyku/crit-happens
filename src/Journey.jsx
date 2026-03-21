import { useState, useMemo } from 'react'
import yaml from 'js-yaml'
import journeyUsRaw from './data/journey.us.yaml?raw'
import journeyFrRaw from './data/journey.fr.yaml?raw'
import messagesUsRaw from './data/messages.us.yaml?raw'
import messagesFrRaw from './data/messages.fr.yaml?raw'
import { useCharacter } from './useCharacter.js'
import { useItems } from './useItems.js'
import Conversation from './Conversation.jsx'
import Inventory from './Inventory.jsx'
import './Journey.css'

const journeyFiles = {
  us: journeyUsRaw,
  fr: journeyFrRaw,
}

const messagesFiles = {
  us: messagesUsRaw,
  fr: messagesFrRaw,
}

function applyItemChanges(current, give = [], take = []) {
  const set = new Set(current)
  for (const id of give) set.add(id)
  for (const id of take) set.delete(id)
  return [...set]
}

function Journey({ language = 'us' }) {
  const journey = useMemo(() => yaml.load(journeyFiles[language] || journeyUsRaw), [language])
  const labels = useMemo(() => yaml.load(messagesFiles[language] || messagesUsRaw), [language])
  const itemDefs = useItems(language)
  const [currentStepId, setCurrentStepId] = useState('1_start')
  const [history, setHistory] = useState([])
  const [inventory, setInventory] = useState([])

  const step = journey.steps[currentStepId]
  const isEnding = !step.reactions || step.reactions.length === 0
  const character = useCharacter(step.character, language)

  const visibleReactions = (step.reactions || []).filter((r) => {
    if (r.requires && !inventory.includes(r.requires)) return false
    if (r.requires_not && inventory.includes(r.requires_not)) return false
    return true
  })

  function handleChoice(goto, itemChanges = {}) {
    const targetStep = journey.steps[goto]

    setHistory((prev) => [...prev, { stepId: currentStepId, inventory: [...inventory] }])

    // Apply reaction-level changes, then step-level changes on arrival
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
    setHistory((prev) => {
      const next = [...prev]
      const snapshot = next.pop()
      setCurrentStepId(snapshot.stepId)
      setInventory(snapshot.inventory)
      return next
    })
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

      {character ? (
        <div className="step">
          <p className="description">{step.description}</p>
          <Conversation
            key={currentStepId}
            character={character}
            labels={labels}
            reactions={visibleReactions}
            onExit={handleChoice}
          />
        </div>
      ) : (
        <div className="step">
          <p className="description">{step.description}</p>

          <div className="reactions">
            {visibleReactions.map((reaction) => (
              <button
                key={reaction.goto}
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
