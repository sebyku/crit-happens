import { useState, useMemo } from 'react'
import yaml from 'js-yaml'
import journeyUsRaw from './data/journey.us.yaml?raw'
import journeyFrRaw from './data/journey.fr.yaml?raw'
import messagesUsRaw from './data/messages.us.yaml?raw'
import messagesFrRaw from './data/messages.fr.yaml?raw'
import { useCharacter } from './useCharacter.js'
import Conversation from './Conversation.jsx'
import './Journey.css'

const journeyFiles = {
  us: journeyUsRaw,
  fr: journeyFrRaw,
}

const messagesFiles = {
  us: messagesUsRaw,
  fr: messagesFrRaw,
}

function Journey({ language = 'us' }) {
  const journey = useMemo(() => yaml.load(journeyFiles[language] || journeyUsRaw), [language])
  const labels = useMemo(() => yaml.load(messagesFiles[language] || messagesUsRaw), [language])
  const [currentStepId, setCurrentStepId] = useState('1_start')
  const [history, setHistory] = useState([])

  const step = journey.steps[currentStepId]
  const isEnding = !step.reactions || step.reactions.length === 0
  const character = useCharacter(step.character, language)

  function handleChoice(goto) {
    setHistory((prev) => [...prev, currentStepId])
    setCurrentStepId(goto)
  }

  function handleBack() {
    setHistory((prev) => {
      const next = [...prev]
      const previous = next.pop()
      setCurrentStepId(previous)
      return next
    })
  }

  function handleRestart() {
    setCurrentStepId('1_start')
    setHistory([])
  }

  return (
    <div className="journey">
      <h1>{journey.title}</h1>

      {character ? (
        <div className="step">
          <p className="description">{step.description}</p>
          <Conversation
            key={currentStepId}
            character={character}
            labels={labels}
            reactions={step.reactions}
            onExit={handleChoice}
          />
        </div>
      ) : (
        <div className="step">
          <p className="description">{step.description}</p>

          <div className="reactions">
            {step.reactions.map((reaction) => (
              <button
                key={reaction.goto}
                className="reaction"
                onClick={() => handleChoice(reaction.goto)}
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
