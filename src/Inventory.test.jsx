import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach } from 'vitest'
import Inventory from './Inventory.jsx'

const itemDefs = {
  rusted_key: {
    name: 'Rusted Key',
    description: 'An old key given by a mysterious stranger.',
    iconUrl: '/items/rusted_key.svg',
  },
  crystal_shard: {
    name: 'Crystal Shard',
    description: 'A fragment pulsing with ancient energy.',
    iconUrl: '/items/crystal_shard.svg',
  },
}

const emptyEquipment = {
  head: null, torso: null, legs: null,
  feet: null, right_hand: null, left_hand: null,
}

const defaultProps = {
  itemDefs,
  gold: 10,
  hp: 100,
  playerAc: 10,
  playerAttack: 1,
  equipment: emptyEquipment,
  onEquip: () => {},
  labels: {},
}

describe('Inventory', () => {
  afterEach(cleanup)

  it('renders an empty bar when no items', () => {
    const { container } = render(<Inventory items={[]} {...defaultProps} />)
    expect(container.querySelector('.inventory-bar')).toBeInTheDocument()
    expect(container.querySelectorAll('.inventory-slot')).toHaveLength(0)
  })

  it('renders item slots for each item in inventory', () => {
    const { container } = render(
      <Inventory items={['rusted_key', 'crystal_shard']} {...defaultProps} />
    )
    expect(container.querySelectorAll('.inventory-slot')).toHaveLength(2)
  })

  it('shows item icon with alt text', () => {
    render(<Inventory items={['rusted_key']} {...defaultProps} />)
    const img = screen.getByAltText('Rusted Key')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/items/rusted_key.svg')
  })

  it('shows item description popover on click', async () => {
    const user = userEvent.setup()
    render(<Inventory items={['rusted_key']} {...defaultProps} />)

    await user.click(screen.getByTitle('Rusted Key'))

    expect(screen.getByText('Rusted Key')).toBeInTheDocument()
    expect(screen.getByText('An old key given by a mysterious stranger.')).toBeInTheDocument()
  })

  it('hides popover on second click', async () => {
    const user = userEvent.setup()
    render(<Inventory items={['rusted_key']} {...defaultProps} />)

    await user.click(screen.getByTitle('Rusted Key'))
    expect(screen.getByText('An old key given by a mysterious stranger.')).toBeInTheDocument()

    await user.click(screen.getByTitle('Rusted Key'))
    expect(screen.queryByText('An old key given by a mysterious stranger.')).not.toBeInTheDocument()
  })

  it('switches popover when clicking a different item', async () => {
    const user = userEvent.setup()
    render(
      <Inventory items={['rusted_key', 'crystal_shard']} {...defaultProps} />
    )

    await user.click(screen.getByTitle('Rusted Key'))
    expect(screen.getByText('An old key given by a mysterious stranger.')).toBeInTheDocument()

    await user.click(screen.getByTitle('Crystal Shard'))
    expect(screen.queryByText('An old key given by a mysterious stranger.')).not.toBeInTheDocument()
    expect(screen.getByText('A fragment pulsing with ancient energy.')).toBeInTheDocument()
  })
})
