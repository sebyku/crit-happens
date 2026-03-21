import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach, vi } from 'vitest'
import Conversation from './Conversation.jsx'

const character = {
  greetings: ['Hello, adventurer.'],
  rules: [
    {
      keyword: 'vault',
      priority: 5,
      patterns: [
        { decomposition: '.*vault(.*)', reassemblies: ['The vault is hidden.'] },
      ],
    },
    {
      keyword: '@none',
      priority: 0,
      patterns: [
        { decomposition: '.*', reassemblies: ['Interesting...'] },
      ],
    },
  ],
  reflections: {},
  exits: [
    { keyword: 'bye', goto: '2_dark_corridor' },
    { keyword: 'leave', goto: '3_tavern' },
  ],
}

const labels = {
  chatPlaceholder: 'Type something...',
  send: 'Send',
}

describe('Conversation', () => {
  afterEach(cleanup)

  it('shows the NPC greeting on mount', () => {
    render(<Conversation character={character} labels={labels} reactions={[]} onExit={() => {}} />)
    expect(screen.getByText('Hello, adventurer.')).toBeInTheDocument()
  })

  it('shows the chat input', () => {
    render(<Conversation character={character} labels={labels} reactions={[]} onExit={() => {}} />)
    expect(screen.getByPlaceholderText('Type something...')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('sends a message and gets a response', async () => {
    const user = userEvent.setup()
    render(<Conversation character={character} labels={labels} reactions={[]} onExit={() => {}} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'tell me about the vault')
    await user.click(screen.getByText('Send'))

    expect(screen.getByText('tell me about the vault')).toBeInTheDocument()
    expect(screen.getByText('The vault is hidden.')).toBeInTheDocument()
  })

  it('uses fallback for unrecognized input', async () => {
    const user = userEvent.setup()
    render(<Conversation character={character} labels={labels} reactions={[]} onExit={() => {}} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'random stuff')
    await user.click(screen.getByText('Send'))

    expect(screen.getByText('Interesting...')).toBeInTheDocument()
  })

  it('calls onExit with goto when exit keyword is typed', async () => {
    const onExit = vi.fn()
    const user = userEvent.setup()
    render(<Conversation character={character} labels={labels} reactions={[]} onExit={onExit} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'bye')
    await user.click(screen.getByText('Send'))

    expect(onExit).toHaveBeenCalledWith('2_dark_corridor', {
      itemsGive: undefined,
      itemsTake: undefined,
    })
  })

  it('renders journey reactions as action buttons', () => {
    const reactions = [
      { label: 'Take the key', goto: '2_dark_corridor' },
    ]
    render(<Conversation character={character} labels={labels} reactions={reactions} onExit={() => {}} />)
    expect(screen.getByText('Take the key')).toBeInTheDocument()
  })

  it('calls onExit when a reaction button is clicked', async () => {
    const onExit = vi.fn()
    const user = userEvent.setup()
    const reactions = [
      { label: 'Take the key', goto: '2_dark_corridor' },
    ]
    render(<Conversation character={character} labels={labels} reactions={reactions} onExit={onExit} />)

    await user.click(screen.getByText('Take the key'))
    expect(onExit).toHaveBeenCalledWith('2_dark_corridor', {
      itemsGive: undefined,
      itemsTake: undefined,
    })
  })
})
