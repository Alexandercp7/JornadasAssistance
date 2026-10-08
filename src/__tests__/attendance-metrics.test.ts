import { describe, it, expect } from 'vitest'

type AttendanceStatus =
  | 'EMPTY'
  | 'PRESENT'
  | 'LATE'
  | 'LATE_JUSTIFIED'
  | 'ABSENT'
  | 'ABSENT_JUSTIFIED'

function calculateMemberMetrics(stamps: AttendanceStatus[]) {
  let present = 0
  let late = 0
  let lateJustified = 0
  let absent = 0
  let absentJustified = 0

  stamps.forEach((s) => {
    if (s === 'PRESENT') present++
    else if (s === 'LATE') late++
    else if (s === 'LATE_JUSTIFIED') lateJustified++
    else if (s === 'ABSENT') absent++
    else if (s === 'ABSENT_JUSTIFIED') absentJustified++
  })

  const totalEvaluated = present + late + lateJustified + absent + absentJustified
  const score =
    present * 1 +
    late * 0.75 +
    lateJustified * 1 +
    absentJustified * 1
  const percentage =
    totalEvaluated > 0
      ? Math.round((score / totalEvaluated) * 100)
      : 0

  return { present, late, lateJustified, absent, absentJustified, totalEvaluated, percentage }
}

function getNextStatus(current: AttendanceStatus): AttendanceStatus {
  const sequence: AttendanceStatus[] = [
    'EMPTY',
    'PRESENT',
    'LATE',
    'LATE_JUSTIFIED',
    'ABSENT',
    'ABSENT_JUSTIFIED',
  ]
  const idx = sequence.indexOf(current)
  return sequence[(idx + 1) % sequence.length]
}

describe('Lógica de Asistencia y Cálculo de Métricas (6 Estados)', () => {
  it('debe ciclar correctamente entre los 6 estados de sello', () => {
    expect(getNextStatus('EMPTY')).toBe('PRESENT')
    expect(getNextStatus('PRESENT')).toBe('LATE')
    expect(getNextStatus('LATE')).toBe('LATE_JUSTIFIED')
    expect(getNextStatus('LATE_JUSTIFIED')).toBe('ABSENT')
    expect(getNextStatus('ABSENT')).toBe('ABSENT_JUSTIFIED')
    expect(getNextStatus('ABSENT_JUSTIFIED')).toBe('EMPTY')
  })

  it('debe calcular 100% de asistencia con todas las marcas PRESENT', () => {
    const stamps: AttendanceStatus[] = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT']
    const metrics = calculateMemberMetrics(stamps)

    expect(metrics.present).toBe(4)
    expect(metrics.late).toBe(0)
    expect(metrics.absent).toBe(0)
    expect(metrics.percentage).toBe(100)
  })

  it('debe ponderar los retardos al 75% en el cálculo de porcentaje', () => {
    // 1 Retardo (0.75) sobre 1 evaluada = 75%
    const stamps: AttendanceStatus[] = ['LATE']
    const metrics = calculateMemberMetrics(stamps)

    expect(metrics.late).toBe(1)
    expect(metrics.percentage).toBe(75)

    // 1 Presente (1.0) + 1 Retardo (0.75) sobre 2 evaluadas = 1.75 / 2 = 88%
    const stampsCombo: AttendanceStatus[] = ['PRESENT', 'LATE']
    const metricsCombo = calculateMemberMetrics(stampsCombo)
    expect(metricsCombo.percentage).toBe(88)
  })

  it('debe ponderar retardos justificados (100%) y faltas justificadas (100%)', () => {
    // 1 LATE_JUSTIFIED (1.0) + 1 ABSENT_JUSTIFIED (1.0) sobre 2 = 2.0 / 2 = 100%
    const stamps: AttendanceStatus[] = ['LATE_JUSTIFIED', 'ABSENT_JUSTIFIED']
    const metrics = calculateMemberMetrics(stamps)

    expect(metrics.lateJustified).toBe(1)
    expect(metrics.absentJustified).toBe(1)
    expect(metrics.percentage).toBe(100)
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

  describe('Lógica de Variación Respecto a la Semana Pasada', () => {
    function getTrendColor(diff: number) {
      if (diff < -10) return 'text-[#7A1E2C]' // Rojo
      if (diff < 0) return 'text-[#196E52]'   // Color actual
      return 'text-[#196E52]'                 // Verde
    }

    function formatTrendText(diff: number) {
      const sign = diff > 0 ? '+' : ''
      return `${sign}${diff.toFixed(1)}% respecto a la semana pasada`
    }

    it('debe asignar color rojo si la asistencia baja más del 10%', () => {
      expect(getTrendColor(-10.1)).toBe('text-[#7A1E2C]')
      expect(getTrendColor(-15)).toBe('text-[#7A1E2C]')
      expect(getTrendColor(-50)).toBe('text-[#7A1E2C]')
    })

    it('debe asignar color actual si baja menos de 10%', () => {
      expect(getTrendColor(-0.1)).toBe('text-[#196E52]')
      expect(getTrendColor(-5.0)).toBe('text-[#196E52]')
      expect(getTrendColor(-10.0)).toBe('text-[#196E52]')
    })

    it('debe asignar color verde si se mantiene o sube', () => {
      expect(getTrendColor(0)).toBe('text-[#196E52]')
      expect(getTrendColor(1.2)).toBe('text-[#196E52]')
      expect(getTrendColor(15)).toBe('text-[#196E52]')
    })

    it('debe formatear el texto sin flechitas', () => {
      const positive = formatTrendText(3.5)
      expect(positive).toBe('+3.5% respecto a la semana pasada')
      expect(positive).not.toContain('↑')
      expect(positive).not.toContain('↓')

      const negative = formatTrendText(-12.4)
      expect(negative).toBe('-12.4% respecto a la semana pasada')
      expect(negative).not.toContain('↑')
      expect(negative).not.toContain('↓')
    })
  })
})

