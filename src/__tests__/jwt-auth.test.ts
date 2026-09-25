import { describe, it, expect } from 'vitest'
import { signSessionToken, verifySessionToken } from '../lib/auth'

describe('Seguridad de Sesión con JWT (jose)', () => {
  const mockPayload = {
    groupId: 'grp_preescuela',
    slug: 'PREESCUELA',
    name: 'Coordinación Preescuela',
    customTitle: 'Preescuela - Guerreros de Jesús',
  }

  it('debe firmar un token JWT válido', async () => {
    const token = await signSessionToken(mockPayload)
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3) // Header.Payload.Signature
  })

  it('debe verificar y desencriptar la carga útil (payload) del token JWT', async () => {
    const token = await signSessionToken(mockPayload)
    const verified = await verifySessionToken(token)

    expect(verified).not.toBeNull()
    expect(verified?.groupId).toBe(mockPayload.groupId)
    expect(verified?.slug).toBe(mockPayload.slug)
    expect(verified?.customTitle).toBe(mockPayload.customTitle)
  })

  it('debe rechazar tokens manipulados o corruptos', async () => {
    const token = await signSessionToken(mockPayload)
    const tamperedToken = token.slice(0, -5) + 'XXXXX'
    const verified = await verifySessionToken(tamperedToken)

    expect(verified).toBeNull()
  })
})

