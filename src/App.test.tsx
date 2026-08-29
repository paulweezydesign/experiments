import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('experiment dashboard', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    window.scrollTo = vi.fn()
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
  })

  it('filters experiments by search and status', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Search title, owner, tag…'), 'onboarding')
    expect(screen.getByRole('heading', { name: 'Contextual onboarding checklist' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Human-readable release notes' })).not.toBeInTheDocument()

    await user.clear(screen.getByPlaceholderText('Search title, owner, tag…'))
    await user.click(screen.getByRole('button', { name: 'Promoted' }))
    expect(screen.getByRole('heading', { name: 'Command palette navigation' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Promoted' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('group', { name: 'Filter by status' })).toBeInTheDocument()
  })

  it('opens a detail view with findings and related records', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('heading', { name: 'Human-readable release notes' }))
    expect(screen.getByText('Hypothesis')).toBeInTheDocument()
    expect(screen.getByText(/27% lift in click-through/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Linear · PAU-18/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export report/ })).toBeInTheDocument()
  })

  it('preserves registry filters and consumes detail history when returning', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Promoted' }))
    await user.click(screen.getByRole('heading', { name: 'Command palette navigation' }))
    expect(window.location.search).toBe('?experiment=EXP-005')

    await user.click(screen.getByRole('button', { name: /Back to registry/ }))

    await waitFor(() => expect(window.location.search).toBe(''))
    expect(screen.getByRole('button', { name: 'Promoted' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: 'Command palette navigation' })).toBeInTheDocument()
  })

  it('disables smooth scrolling when reduced motion is preferred', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('heading', { name: 'Human-readable release notes' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
