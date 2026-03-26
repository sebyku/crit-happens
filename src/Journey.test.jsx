import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach } from 'vitest'
import Journey from './Journey.jsx'

describe('Journey', () => {
  afterEach(cleanup)

  it('renders the title and starting step', async () => {
    render(<Journey />)
    expect(await screen.findByText('Crit Happens')).toBeInTheDocument()
    expect(screen.getByText(/square of a small village/)).toBeInTheDocument()
  })

  it('shows reaction buttons for the starting step', async () => {
    render(<Journey />)
    expect(await screen.findByText('Go to the tavern')).toBeInTheDocument()
    expect(screen.getByText('Visit the armorer')).toBeInTheDocument()
    expect(screen.getByText('Enter the church')).toBeInTheDocument()
    expect(screen.getByText('Leave the village')).toBeInTheDocument()
  })

  it('does not show a back button on the first step', async () => {
    render(<Journey />)
    await screen.findByText('Crit Happens')
    expect(screen.queryByText('Go back')).not.toBeInTheDocument()
  })

  it('navigates to the village exit', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Leave the village'))

    expect(await screen.findByText(/dark entrance of a dungeon/)).toBeInTheDocument()
    expect(screen.getByText('Enter the dungeon')).toBeInTheDocument()
    expect(screen.getByText('Go back to the village')).toBeInTheDocument()
  })

  it('shows a back button after navigating', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Leave the village'))

    expect(await screen.findByText('Go back')).toBeInTheDocument()
  })

  it('goes back to the previous step', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Leave the village'))
    await user.click(await screen.findByText('Go back'))

    expect(await screen.findByText(/square of a small village/)).toBeInTheDocument()
    expect(screen.queryByText('Go back')).not.toBeInTheDocument()
  })

  it('navigates through multiple steps to the tavern', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Go to the tavern'))
    expect(await screen.findByText(/tavern is warm and loud/)).toBeInTheDocument()

    await user.click(screen.getByText('Sit with the stranger'))
    expect(await screen.findByText(/stranger leans in and starts whispering/)).toBeInTheDocument()
  })

  it('reaches an ending and shows play again', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Leave the village'))
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

    await user.click(await screen.findByText('Leave the village'))
    await user.click(await screen.findByText('Enter the dungeon'))
    await user.click(await screen.findByText('Chase the glimmer'))
    await user.click(await screen.findByText('Grab the loose coins and leave'))
    await user.click(await screen.findByText('Play again'))

    expect(await screen.findByText(/square of a small village/)).toBeInTheDocument()
    expect(screen.queryByText('Go back')).not.toBeInTheDocument()
  })

  it('back button preserves full history', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Leave the village'))
    await user.click(await screen.findByText('Enter the dungeon'))
    await user.click(await screen.findByText('Follow the growl'))
    expect(await screen.findByText(/wolf-like creature/)).toBeInTheDocument()

    await user.click(screen.getByText('Go back'))
    expect(await screen.findByText(/corridor stretches ahead/)).toBeInTheDocument()

    await user.click(screen.getByText('Go back'))
    expect(await screen.findByText(/dark entrance of a dungeon/)).toBeInTheDocument()
  })

  it('renders in French when language is fr', async () => {
    render(<Journey language="fr" />)
    expect(await screen.findByText('Crit Happens')).toBeInTheDocument()
    expect(screen.getByText(/place d'un petit village/)).toBeInTheDocument()
    expect(screen.getByText('Aller à la taverne')).toBeInTheDocument()
  })

  it('uses French UI labels', async () => {
    const user = userEvent.setup()
    render(<Journey language="fr" />)

    await user.click(await screen.findByText('Sortir du village'))
    expect(await screen.findByText('Retour')).toBeInTheDocument()

    await user.click(await screen.findByText('Entrer dans le donjon'))
    await user.click(await screen.findByText(/Suivre l'éclat/))
    await user.click(await screen.findByText('Ramasser les pièces et partir'))
    expect(await screen.findByText('Rejouer')).toBeInTheDocument()
  })
})