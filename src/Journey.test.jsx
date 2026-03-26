import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach } from 'vitest'
import Journey from './Journey.jsx'

describe('Journey', () => {
  afterEach(cleanup)

  it('renders the title and starting step', async () => {
    render(<Journey />)
    expect(await screen.findByText('Crit Happens')).toBeInTheDocument()
    expect(screen.getByText(/dimly lit dungeon/)).toBeInTheDocument()
  })

  it('shows reaction buttons for the starting step', async () => {
    render(<Journey />)
    expect(await screen.findByText('Enter the dungeon')).toBeInTheDocument()
    expect(screen.getByText('Turn back and head to the tavern')).toBeInTheDocument()
  })

  it('does not show a back button on the first step', async () => {
    render(<Journey />)
    await screen.findByText('Crit Happens')
    expect(screen.queryByText('Go back')).not.toBeInTheDocument()
  })

  it('navigates to the next step on choice', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Enter the dungeon'))

    expect(await screen.findByText(/corridor stretches ahead/)).toBeInTheDocument()
    expect(screen.getByText('Follow the growl')).toBeInTheDocument()
    expect(screen.getByText('Chase the glimmer')).toBeInTheDocument()
    expect(screen.getByText('Retreat to the entrance')).toBeInTheDocument()
  })

  it('shows a back button after navigating', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Enter the dungeon'))

    expect(await screen.findByText('Go back')).toBeInTheDocument()
  })

  it('goes back to the previous step', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Enter the dungeon'))
    await user.click(await screen.findByText('Go back'))

    expect(await screen.findByText(/dimly lit dungeon/)).toBeInTheDocument()
    expect(screen.queryByText('Go back')).not.toBeInTheDocument()
  })

  it('navigates through multiple steps', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Turn back and head to the tavern'))
    expect(await screen.findByText(/tavern is warm and loud/)).toBeInTheDocument()

    await user.click(screen.getByText('Sit with the stranger'))
    expect(await screen.findByText(/stranger leans in and starts whispering/)).toBeInTheDocument()
  })

  it('reaches an ending and shows play again', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Enter the dungeon'))
    await user.click(await screen.findByText('Chase the glimmer'))
    await user.click(await screen.findByText('Grab the loose coins and leave'))

    expect(await screen.findByText(/pockets full of gold/)).toBeInTheDocument()
    expect(screen.getByText('Play again')).toBeInTheDocument()
    expect(screen.queryByText('Go back')).not.toBeInTheDocument()
  })

  it('restarts the game from an ending', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Enter the dungeon'))
    await user.click(await screen.findByText('Chase the glimmer'))
    await user.click(await screen.findByText('Grab the loose coins and leave'))
    await user.click(await screen.findByText('Play again'))

    expect(await screen.findByText(/dimly lit dungeon/)).toBeInTheDocument()
    expect(screen.queryByText('Go back')).not.toBeInTheDocument()
  })

  it('back button preserves full history', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Enter the dungeon'))
    await user.click(await screen.findByText('Follow the growl'))
    await user.click(await screen.findByText('Try to calm the beast'))
    expect(await screen.findByText(/beast sniffs cautiously/)).toBeInTheDocument()

    await user.click(screen.getByText('Go back'))
    expect(await screen.findByText(/wolf-like creature/)).toBeInTheDocument()

    await user.click(screen.getByText('Go back'))
    expect(await screen.findByText(/corridor stretches ahead/)).toBeInTheDocument()
  })

  it('renders in French when language is fr', async () => {
    render(<Journey language="fr" />)
    expect(await screen.findByText('Crit Happens')).toBeInTheDocument()
    expect(screen.getByText(/donjon faiblement eclaire/)).toBeInTheDocument()
    expect(screen.getByText('Entrer dans le donjon')).toBeInTheDocument()
  })

  it('uses French UI labels', async () => {
    const user = userEvent.setup()
    render(<Journey language="fr" />)

    await user.click(await screen.findByText('Entrer dans le donjon'))
    expect(await screen.findByText('Retour')).toBeInTheDocument()

    await user.click(screen.getByText(/Suivre l'eclat/))
    await user.click(await screen.findByText('Ramasser les pieces et partir'))
    expect(await screen.findByText('Rejouer')).toBeInTheDocument()
  })
})