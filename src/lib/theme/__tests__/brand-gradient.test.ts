import { describe, it, expect } from 'vitest'
import { getBrandGradient, getBrandGradientText } from '../brand-gradient'

describe('brand-gradient', () => {
  it('returns CSS gradient at 135deg by default', () => {
    expect(getBrandGradient()).toBe('linear-gradient(135deg, #223ED7 0%, #56308E 100%)')
  })

  it('accepts custom angle', () => {
    expect(getBrandGradient(90)).toBe('linear-gradient(90deg, #223ED7 0%, #56308E 100%)')
  })

  it('returns style object for text-gradient', () => {
    expect(getBrandGradientText()).toEqual({
      background: 'linear-gradient(135deg, #223ED7 0%, #56308E 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    })
  })
})