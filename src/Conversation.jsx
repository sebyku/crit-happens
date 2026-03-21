import { useState, useRef, useEffect, useMemo } from 'react'
import { Eliza, preprocess } from './eliza.js'
import './Conversation.css'

function Conversation({ character, labels, reactions, onExit }) {
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
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function findExit(text) {
    const processed = preprocess(text)
    for (const exit of character.exits) {
      if (processed.includes(exit.keyword)) {
        return exit
      }
    }
    return null
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
      })
      return
    }

    const response = engine.respond(trimmed)
    setMessages((prev) => [
      ...prev,
      { from: 'player', text: trimmed },
      { from: 'npc', text: response },
    ])
    setInput('')
  }

  return (
    <div className="conversation">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.from}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={labels.chatPlaceholder || '...'}
        />
        <button type="submit" className="chat-send">
          {labels.send || '>'}
        </button>
      </form>

      {reactions && reactions.length > 0 && (
        <div className="chat-reactions">
          {reactions.map((reaction) => (
            <button
              key={reaction.goto}
              className="reaction"
              onClick={() => onExit(reaction.goto, {
                itemsGive: reaction.items_give,
                itemsTake: reaction.items_take,
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
