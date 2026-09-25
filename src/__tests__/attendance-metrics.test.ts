import { describe, it, expect } from 'vitest'

type AttendanceStatus = 'EMPTY' | 'PRESENT' | 'LATE' | 'ABSENT'

function calculateMemberMetrics(stamps: AttendanceStatus[]) {
  let present = 0
  let late = 0
  let absent = 0

  stamps.forEach((s) => {
    if (s === 'PRESENT') present++
    else if (s === 'LATE') late++
    else if (s === 'ABSENT') absent++
  })

  const totalEvaluated = present + late + absent
  const percentage =
    totalEvaluated > 0
      ? Math.round(((present + late * 0.5) / totalEvaluated) * 100)
      : 0

  return { present, late, absent, totalEvaluated, percentage }
}

function getNextStatus(current: AttendanceStatus): AttendanceStatus {
  const sequence: AttendanceStatus[] = ['EMPTY', 'PRESENT', 'LATE', 'ABSENT']
  const idx = sequence.indexOf(current)
  return sequence[(idx + 1) % sequence.length]
}

describe('Lógica de Asistencia y Cálculo de Métricas', () => {
  it('debe ciclar correctamente entre los 4 estados de sello', () => {
    expect(getNextStatus('EMPTY')).toBe('PRESENT')
    expect(getNextStatus('PRESENT')).toBe('LATE')
    expect(getNextStatus('LATE')).toBe('ABSENT')
    expect(getNextStatus('ABSENT')).toBe('EMPTY')
  })

  it('debe calcular 100% de asistencia con todas las marcas PRESENT', () => {
    const stamps: AttendanceStatus[] = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT']
    const metrics = calculateMemberMetrics(stamps)

    expect(metrics.present).toBe(4)
    expect(metrics.late).toBe(0)
    expect(metrics.absent).toBe(0)
    expect(metrics.percentage).toBe(100)
  })

  it('debe ponderar los retardos al 50% en el cálculo de porcentaje', () => {
    // 1 Presente (1.0) + 1 Retardo (0.5) sobre 2 evaluadas = 1.5 / 2 = 75%
    const stamps: AttendanceStatus[] = ['PRESENT', 'LATE']
    const metrics = calculateMemberMetrics(stamps)

    expect(metrics.present).toBe(1)
    expect(metrics.late).toBe(1)
    expect(metrics.percentage).toBe(75)
  })

  it('debe ignorar casillas EMPTY en el cálculo de porcentaje', () => {
    const stamps: AttendanceStatus[] = ['PRESENT', 'EMPTY', 'EMPTY', 'EMPTY']
    const metrics = calculateMemberMetrics(stamps)

    expect(metrics.present).toBe(1)
    expect(metrics.totalEvaluated).toBe(1)
    expect(metrics.percentage).toBe(100)
  })

  it('debe devolver 0% si todas son faltas (ABSENT)', () => {
    const stamps: AttendanceStatus[] = ['ABSENT', 'ABSENT']
    const metrics = calculateMemberMetrics(stamps)

    expect(metrics.absent).toBe(2)
    expect(metrics.percentage).toBe(0)
  })
})

