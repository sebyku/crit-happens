import { useState, useRef, useEffect, useMemo } from 'react'
import { Eliza, preprocess } from './eliza.js'
import './Conversation.css'

function Conversation({ character, labels, reactions, onExit, onItemChange, onStatsChange, gold, inventory }) {
  const engine = useMemo(
    () => new Eliza(character.rules, character.reflections),
    [character]
  )

  const [messages, setMessages] = useState(() => {
    const list = character.greetings
    const greeting = list.length > 0
      ? list[Math.floor(Math.random() * list.length)]
      : 'Hello.'
    return [{ from: 'npc', text: greeting }]
  })
  const [input, setInput] = useState('')
  const [pendingConfirm, setPendingConfirm] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (!pendingConfirm) inputRef.current?.focus()
  }, [pendingConfirm])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function findExit(text) {
    const processed = preprocess(text)
    for (const exit of character.exits) {
      const pattern = new RegExp(`\\b${exit.keyword}\\b`)
      if (pattern.test(processed)) {
        return exit
      }
    }
    return null
  }

  function applyChanges(response) {
    if (response.items_give || response.items_take) {
      onItemChange?.({
        itemsGive: response.items_give,
        itemsTake: response.items_take,
      })
    }
    if (response.gold || response.hp) {
      onStatsChange?.({ gold: response.gold, hp: response.hp })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    // Check for exit keywords
    const exit = findExit(trimmed)
    if (exit) {
      onExit(exit.goto, {
        itemsGive: exit.items_give,
        itemsTake: exit.items_take,
        gold: exit.gold,
        hp: exit.hp,
      })
      return
    }

    const response = engine.respond(trimmed)

    // Check if items are already owned
    const alreadyOwned = response.items_give?.length > 0 &&
      response.items_give.every((id) => inventory.includes(id))

    if (alreadyOwned) {
      setMessages((prev) => [
        ...prev,
        { from: 'player', text: trimmed },
        { from: 'npc', text: labels.alreadyOwned || 'You already have that.' },
      ])
      setInput('')
      return
    }

    // Check if player can afford it
    const cost = response.gold && response.gold < 0 ? -response.gold : 0
    if (cost > 0 && gold < cost) {
      setMessages((prev) => [
        ...prev,
        { from: 'player', text: trimmed },
        { from: 'npc', text: response.text },
        { from: 'npc', text: labels.notEnoughGold || "You don't have enough gold." },
      ])
      setInput('')
      return
    }

    setMessages((prev) => [
      ...prev,
      { from: 'player', text: trimmed },
      { from: 'npc', text: response.text },
    ])
    setInput('')

    const hasChanges = response.items_give || response.items_take || response.gold || response.hp
    if (hasChanges && response.confirm) {
      setPendingConfirm(response)
    } else if (hasChanges) {
      applyChanges(response)
    }
  }

  function handleConfirmAccept() {
    if (pendingConfirm) applyChanges(pendingConfirm)
    setPendingConfirm(null)
  }

  function handleConfirmDecline() {
    setPendingConfirm(null)
  }

  return (
    <div className="conversation">
      <div className="chat-messages" role="log" aria-live="polite">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.from}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {pendingConfirm ? (
        <div className="confirm-bar">
          <span className="confirm-text">{labels.confirmPrompt || 'Accept?'}</span>
          <button className="confirm-yes" onClick={handleConfirmAccept}>
            {labels.confirmYes || 'Yes'}
          </button>
          <button className="confirm-no" onClick={handleConfirmDecline}>
            {labels.confirmNo || 'No'}
          </button>
        </div>
      ) : (
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={labels.chatPlaceholder || '...'}
          />
          <button type="submit" className="chat-send" aria-label="Send">
            ➤
          </button>
        </form>
      )}

      {reactions && reactions.length > 0 && (
        <div className="chat-reactions">
          {reactions.map((reaction, i) => (
            <button
              key={`${reaction.goto}-${i}`}
              className="reaction"
              onClick={() => onExit(reaction.goto, {
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
      )}
    </div>
  )
}

export default Conversation