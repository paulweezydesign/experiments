import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('experiment dashboard', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    window.scrollTo = vi.fn()
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
})
