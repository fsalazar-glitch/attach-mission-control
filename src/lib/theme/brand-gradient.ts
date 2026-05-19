/* attach-os override — Brand gradient helper for inline use */
import { brandGradient } from '@/styles/design-tokens'

export function getBrandGradient(angle: number = brandGradient.angle): string {
  return `linear-gradient(${angle}deg, ${brandGradient.from} 0%, ${brandGradient.to} 100%)`
}

export function getBrandGradientText(): {
  background: string
  WebkitBackgroundClip: 'text'
  backgroundClip: 'text'
  WebkitTextFillColor: string
} {
  return {
    background: getBrandGradient(),
    WebkitBackgroundClip: 'text' as const,
    backgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent',
  }
}