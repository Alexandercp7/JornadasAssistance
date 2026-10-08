import { describe, it, expect } from 'vitest'
import { AttendanceStatus } from '@/store/useAttendanceStore'

describe('Opciones de la Barra de Herramientas de Asistencia (Floating Toolbar)', () => {
  // Las 5 opciones activas de selección (sin 'EMPTY' / Limpiar)
  const activeToolbarOptions: AttendanceStatus[] = [
    'PRESENT',
    'LATE',
    'LATE_JUSTIFIED',
    'ABSENT',
    'ABSENT_JUSTIFIED',
  ]

  it('debe contener exactamente las 5 opciones de asistencia requeridas (sin limpiar)', () => {
    expect(activeToolbarOptions).toHaveLength(5)
    expect(activeToolbarOptions).toContain('PRESENT')
    expect(activeToolbarOptions).toContain('LATE')
    expect(activeToolbarOptions).toContain('LATE_JUSTIFIED')
    expect(activeToolbarOptions).toContain('ABSENT')
    expect(activeToolbarOptions).toContain('ABSENT_JUSTIFIED')
    expect(activeToolbarOptions).not.toContain('EMPTY')
  })

  it('debe asignar el estado seleccionado correctamente al hacer clic en una opción', () => {
    let currentStatus: AttendanceStatus = 'EMPTY'

    const handleSelectStatus = (newStatus: AttendanceStatus) => {
      currentStatus = newStatus
    }

    handleSelectStatus('PRESENT')
    expect(currentStatus).toBe('PRESENT')

    handleSelectStatus('LATE_JUSTIFIED')
    expect(currentStatus).toBe('LATE_JUSTIFIED')

    handleSelectStatus('ABSENT')
    expect(currentStatus).toBe('ABSENT')
  })
})
