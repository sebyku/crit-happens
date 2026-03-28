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
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument() // aria-label
  })

  it('sends a message and gets a response', async () => {
    const user = userEvent.setup()
    render(<Conversation character={character} labels={labels} reactions={[]} onExit={() => {}} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'tell me about the vault')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('tell me about the vault')).toBeInTheDocument()
    expect(screen.getByText('The vault is hidden.')).toBeInTheDocument()
  })

  it('uses fallback for unrecognized input', async () => {
    const user = userEvent.setup()
    render(<Conversation character={character} labels={labels} reactions={[]} onExit={() => {}} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'random stuff')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('Interesting...')).toBeInTheDocument()
  })

  it('calls onExit with goto when exit keyword is typed', async () => {
    const onExit = vi.fn()
    const user = userEvent.setup()
    render(<Conversation character={character} labels={labels} reactions={[]} onExit={onExit} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'bye')
    await user.click(screen.getByRole('button', { name: 'Send' }))

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

  it('calls onItemChange when engine rule has items_give', async () => {
    const onItemChange = vi.fn()
    const charWithItems = {
      ...character,
      rules: [
        {
          keyword: 'key',
          priority: 5,
          items_give: ['rusted_key'],
          patterns: [
            { decomposition: '.*key(.*)', reassemblies: ['Here, take this key.'] },
          ],
        },
        ...character.rules,
      ],
    }
    const user = userEvent.setup()
    render(<Conversation character={charWithItems} labels={labels} reactions={[]} onExit={() => {}} onItemChange={onItemChange} gold={100} inventory={[]} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'tell me about the key')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('Here, take this key.')).toBeInTheDocument()
    expect(onItemChange).toHaveBeenCalledWith({
      itemsGive: ['rusted_key'],
      itemsTake: undefined,
    })
  })

  it('shows confirmation when rule has confirm: true', async () => {
    const onItemChange = vi.fn()
    const onStatsChange = vi.fn()
    const shopChar = {
      ...character,
      rules: [
        {
          keyword: 'sword',
          priority: 5,
          confirm: true,
          gold: -8,
          items_give: ['iron_sword'],
          patterns: [
            { decomposition: '.*sword(.*)', reassemblies: ['A fine sword. 8 gold.'] },
          ],
        },
        ...character.rules,
      ],
    }
    const user = userEvent.setup()
    render(<Conversation character={shopChar} labels={{ ...labels, confirmPrompt: 'Accept?', confirmYes: 'Yes', confirmNo: 'No' }} reactions={[]} onExit={() => {}} onItemChange={onItemChange} onStatsChange={onStatsChange} gold={20} inventory={[]} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'show me a sword')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('A fine sword. 8 gold.')).toBeInTheDocument()
    expect(screen.getByText('Accept?')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
    // Not applied yet
    expect(onItemChange).not.toHaveBeenCalled()
    expect(onStatsChange).not.toHaveBeenCalled()
  })

  it('applies changes when confirmation is accepted', async () => {
    const onItemChange = vi.fn()
    const onStatsChange = vi.fn()
    const shopChar = {
      ...character,
      rules: [
        {
          keyword: 'sword',
          priority: 5,
          confirm: true,
          gold: -8,
          items_give: ['iron_sword'],
          patterns: [
            { decomposition: '.*sword(.*)', reassemblies: ['A fine sword. 8 gold.'] },
          ],
        },
        ...character.rules,
      ],
    }
    const user = userEvent.setup()
    render(<Conversation character={shopChar} labels={{ ...labels, confirmYes: 'Yes', confirmNo: 'No' }} reactions={[]} onExit={() => {}} onItemChange={onItemChange} onStatsChange={onStatsChange} gold={20} inventory={[]} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'sword')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    await user.click(screen.getByText('Yes'))

    expect(onItemChange).toHaveBeenCalledWith({
      itemsGive: ['iron_sword'],
      itemsTake: undefined,
    })
    expect(onStatsChange).toHaveBeenCalledWith({ gold: -8, hp: undefined })
  })

  it('does not apply changes when confirmation is declined', async () => {
    const onItemChange = vi.fn()
    const onStatsChange = vi.fn()
    const shopChar = {
      ...character,
      rules: [
        {
          keyword: 'sword',
          priority: 5,
          confirm: true,
          gold: -8,
          items_give: ['iron_sword'],
          patterns: [
            { decomposition: '.*sword(.*)', reassemblies: ['A fine sword. 8 gold.'] },
          ],
        },
        ...character.rules,
      ],
    }
    const user = userEvent.setup()
    render(<Conversation character={shopChar} labels={{ ...labels, confirmYes: 'Yes', confirmNo: 'No' }} reactions={[]} onExit={() => {}} onItemChange={onItemChange} onStatsChange={onStatsChange} gold={20} inventory={[]} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'sword')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    await user.click(screen.getByText('No'))

    expect(onItemChange).not.toHaveBeenCalled()
    expect(onStatsChange).not.toHaveBeenCalled()
    // Input should be back
    expect(screen.getByPlaceholderText('Type something...')).toBeInTheDocument()
  })

  it('shows not enough gold message when player cannot afford', async () => {
    const onItemChange = vi.fn()
    const shopChar = {
      ...character,
      rules: [
        {
          keyword: 'sword',
          priority: 5,
          confirm: true,
          gold: -8,
          items_give: ['iron_sword'],
          patterns: [
            { decomposition: '.*sword(.*)', reassemblies: ['A fine sword. 8 gold.'] },
          ],
        },
        ...character.rules,
      ],
    }
    const user = userEvent.setup()
    render(<Conversation character={shopChar} labels={{ ...labels, notEnoughGold: 'Not enough gold!' }} reactions={[]} onExit={() => {}} onItemChange={onItemChange} gold={3} inventory={[]} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'sword')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('A fine sword. 8 gold.')).toBeInTheDocument()
    expect(screen.getByText('Not enough gold!')).toBeInTheDocument()
    expect(onItemChange).not.toHaveBeenCalled()
  })

  it('shows already owned message when player has the item', async () => {
    const onItemChange = vi.fn()
    const shopChar = {
      ...character,
      rules: [
        {
          keyword: 'sword',
          priority: 5,
          confirm: true,
          gold: -8,
          items_give: ['iron_sword'],
          patterns: [
            { decomposition: '.*sword(.*)', reassemblies: ['A fine sword. 8 gold.'] },
          ],
        },
        ...character.rules,
      ],
    }
    const user = userEvent.setup()
    render(<Conversation character={shopChar} labels={{ ...labels, alreadyOwned: 'You already have that.' }} reactions={[]} onExit={() => {}} onItemChange={onItemChange} gold={20} inventory={['iron_sword']} />)

    const input = screen.getByPlaceholderText('Type something...')
    await user.type(input, 'sword')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('You already have that.')).toBeInTheDocument()
    expect(screen.queryByText('A fine sword. 8 gold.')).not.toBeInTheDocument()
    expect(onItemChange).not.toHaveBeenCalled()
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
