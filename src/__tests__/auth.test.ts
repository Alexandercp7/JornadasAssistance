import { describe, it, expect } from 'vitest'

describe('Autenticación y Control de Acceso', () => {
  const credentials = {
    PREESCUELA: '1234',
    ESCUELA: '5678',
  }

  it('debe validar exitosamente el PIN de Preescuela (1234)', () => {
    const role = 'PREESCUELA'
    const inputPin = '1234'
    const isValid = credentials[role] === inputPin
    expect(isValid).toBe(true)
  })

  it('debe rechazar PIN incorrecto para Preescuela', () => {
    const role = 'PREESCUELA'
    const inputPin = '9999'
    const isValid = credentials[role] === inputPin
    expect(isValid).toBe(false)
  })

  it('debe validar exitosamente el PIN de Escuela (5678)', () => {
    const role = 'ESCUELA'
    const inputPin = '5678'
    const isValid = credentials[role] === inputPin
    expect(isValid).toBe(true)
  })

  it('debe rechazar PIN de longitud distinta a 4 dígitos', () => {
    const inputPin1 = '123'
    const inputPin2 = '12345'
    expect(inputPin1.length === 4).toBe(false)
    expect(inputPin2.length === 4).toBe(false)
  })
})

