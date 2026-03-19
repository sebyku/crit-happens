import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach } from 'vitest'
import Journey from './Journey.jsx'

describe('Journey', () => {
  afterEach(cleanup)

  it('renders the title and starting step', () => {
    render(<Journey />)
    expect(screen.getByText('Crit Happens')).toBeInTheDocument()
    expect(screen.getByText(/dimly lit dungeon/)).toBeInTheDocument()
  })

  it('shows reaction buttons for the starting step', () => {
    render(<Journey />)
    expect(screen.getByText('Enter the dungeon')).toBeInTheDocument()
    expect(screen.getByText('Turn back and head to the tavern')).toBeInTheDocument()
  })

  it('does not show a back button on the first step', () => {
    render(<Journey />)
    expect(screen.queryByText('Go back')).not.toBeInTheDocument()
  })

  it('navigates to the next step on choice', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(screen.getByText('Enter the dungeon'))

    expect(screen.getByText(/corridor stretches ahead/)).toBeInTheDocument()
    expect(screen.getByText('Follow the growl')).toBeInTheDocument()
    expect(screen.getByText('Chase the glimmer')).toBeInTheDocument()
    expect(screen.getByText('Retreat to the entrance')).toBeInTheDocument()
  })

  it('shows a back button after navigating', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(screen.getByText('Enter the dungeon'))

    expect(screen.getByText('Go back')).toBeInTheDocument()
  })

  it('goes back to the previous step', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(screen.getByText('Enter the dungeon'))
    await user.click(screen.getByText('Go back'))

    expect(screen.getByText(/dimly lit dungeon/)).toBeInTheDocument()
    expect(screen.queryByText('Go back')).not.toBeInTheDocument()
  })

  it('navigates through multiple steps', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(screen.getByText('Turn back and head to the tavern'))
    expect(screen.getByText(/tavern is warm and loud/)).toBeInTheDocument()

    await user.click(screen.getByText('Sit with the stranger'))
    expect(screen.getByText(/hidden vault beneath the dungeon/)).toBeInTheDocument()
  })

  it('reaches an ending and shows play again', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    // start -> dark_corridor -> treasure_room -> ending_modest
    await user.click(screen.getByText('Enter the dungeon'))
    await user.click(screen.getByText('Chase the glimmer'))
    await user.click(screen.getByText('Grab the loose coins and leave'))

    expect(screen.getByText(/pockets full of gold/)).toBeInTheDocument()
    expect(screen.getByText('Play again')).toBeInTheDocument()
    expect(screen.queryByText('Go back')).not.toBeInTheDocument()
  })

  it('restarts the game from an ending', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(screen.getByText('Enter the dungeon'))
    await user.click(screen.getByText('Chase the glimmer'))
    await user.click(screen.getByText('Grab the loose coins and leave'))
    await user.click(screen.getByText('Play again'))

    expect(screen.getByText(/dimly lit dungeon/)).toBeInTheDocument()
    expect(screen.queryByText('Go back')).not.toBeInTheDocument()
  })

  it('back button preserves full history', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    // Navigate 3 steps deep, then back twice
    await user.click(screen.getByText('Enter the dungeon'))
    await user.click(screen.getByText('Follow the growl'))
    await user.click(screen.getByText('Try to calm the beast'))
    expect(screen.getByText(/beast sniffs cautiously/)).toBeInTheDocument()

    await user.click(screen.getByText('Go back'))
    expect(screen.getByText(/wolf-like creature/)).toBeInTheDocument()

    await user.click(screen.getByText('Go back'))
    expect(screen.getByText(/corridor stretches ahead/)).toBeInTheDocument()
  })

  it('renders in French when language is fr', () => {
    render(<Journey language="fr" />)
    expect(screen.getByText('Crit Happens')).toBeInTheDocument()
    expect(screen.getByText(/donjon faiblement eclaire/)).toBeInTheDocument()
    expect(screen.getByText('Entrer dans le donjon')).toBeInTheDocument()
  })

  it('uses French UI labels', async () => {
    const user = userEvent.setup()
    render(<Journey language="fr" />)

    await user.click(screen.getByText('Entrer dans le donjon'))
    expect(screen.getByText('Retour')).toBeInTheDocument()

    await user.click(screen.getByText(/Suivre l'eclat/))
    await user.click(screen.getByText('Ramasser les pieces et partir'))
    expect(screen.getByText('Rejouer')).toBeInTheDocument()
  })
})