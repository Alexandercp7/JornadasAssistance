import { describe, it, expect } from 'vitest'
import crypto from 'crypto'

function generateQrToken(): string {
  return `QR_${crypto.randomBytes(8).toString('hex').toUpperCase()}`
}

describe('Generación de Tokens QR (Pases Digitales)', () => {
  it('debe generar un token con prefijo QR_ y longitud adecuada', () => {
    const token = generateQrToken()
    expect(token.startsWith('QR_')).toBe(true)
    expect(token.length).toBe(19) // "QR_" + 16 chars hex
  })

  it('debe generar tokens únicos no colisionantes', () => {
    const tokenSet = new Set<string>()
    for (let i = 0; i < 50; i++) {
      tokenSet.add(generateQrToken())
    }
    expect(tokenSet.size).toBe(50)
  })
})

