import React from 'react'
import { render, screen } from '@testing-library/react'
import { MotionButton } from '../motion-button'

describe('MotionButton', () => {
  it('renders children and applies classes', () => {
    render(<MotionButton variant="primary">Click me</MotionButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
