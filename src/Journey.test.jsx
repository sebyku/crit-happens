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

  it('navigates to the village exit and forest', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Leave the village'))
    expect(await screen.findByText(/forest looms ahead/)).toBeInTheDocument()
    expect(screen.getByText('Enter the forest')).toBeInTheDocument()

    await user.click(screen.getByText('Enter the forest'))
    expect(await screen.findByText(/Three paths diverge/)).toBeInTheDocument()
  })

  it('navigates to the tavern and barman', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Go to the tavern'))
    expect(await screen.findByText(/tavern is warm and loud/)).toBeInTheDocument()

    await user.click(screen.getByText('Talk to the barman'))
    expect(await screen.findByText(/barman wipes a glass/)).toBeInTheDocument()
  })

  it('navigates to the armorer', async () => {
    const user = userEvent.setup()
    render(<Journey />)

    await user.click(await screen.findByText('Visit the armorer'))
    expect(await screen.findByText(/armorer.*shop.*small/)).toBeInTheDocument()
  })

  it('renders in French when language is fr', async () => {
    render(<Journey language="fr" />)
    expect(await screen.findByText('Crit Happens')).toBeInTheDocument()
    expect(screen.getByText(/place d'un petit village/)).toBeInTheDocument()
    expect(screen.getByText('Aller à la taverne')).toBeInTheDocument()
  })

  it('navigates to forest in French', async () => {
    const user = userEvent.setup()
    render(<Journey language="fr" />)

    await user.click(await screen.findByText('Sortir du village'))
    expect(await screen.findByText(/forêt se dresse/)).toBeInTheDocument()

    await user.click(await screen.findByText('Entrer dans la forêt'))
    expect(await screen.findByText(/Trois chemins/)).toBeInTheDocument()
  })

  it('shows play again on game over', async () => {
    render(<Journey />)
    expect(await screen.findByText('Crit Happens')).toBeInTheDocument()
  })
})
