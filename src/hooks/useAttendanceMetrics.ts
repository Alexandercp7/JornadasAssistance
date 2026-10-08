import { useMemo } from 'react'
import { MemberItem, SessionItem } from '@/store/useAttendanceStore'

export interface DashboardMetrics {
  activePresent: number
  activeLate: number
  activeAbsent: number
  globalAttendanceRate: string
  weeklyDiff: number
  topMemberName: string
  totalMembers: number
  totalSessions: number
  activeSessionLabel: string
}

export function useAttendanceMetrics(
  members: MemberItem[],
  sessions: SessionItem[],
  currentGroupId: string
): {
  currentMembers: MemberItem[]
  currentSessions: SessionItem[]
  sortedSessions: SessionItem[]
  metrics: DashboardMetrics
} {
  const currentSessions = useMemo(() => {
    return sessions.filter((s) => !s.groupId || s.groupId === currentGroupId)
  }, [sessions, currentGroupId])

  const currentMembers = useMemo(() => {
    return members.filter((m) => !m.groupId || m.groupId === currentGroupId)
  }, [members, currentGroupId])

  // Sesiones ordenadas cronológicamente
  const sortedSessions = useMemo(() => {
    return [...currentSessions].sort((a, b) => {
      const dateA = a.sessionDate ? new Date(a.sessionDate).getTime() : 0
      const dateB = b.sessionDate ? new Date(b.sessionDate).getTime() : 0
      return dateA - dateB
    })
  }, [currentSessions])

  // Cálculos consolidados y memorizados para evitar re-renders innecesarios
  const metrics = useMemo<DashboardMetrics>(() => {
    const activeSession = sortedSessions.length > 0 ? sortedSessions[sortedSessions.length - 1] : null

    let activePresent = 0
    let activeLate = 0
    let activeAbsent = 0
    let totalEvaluatedAll = 0
    let totalPointsAll = 0
    let maxRate = -1
    let topMemberName = 'N/A'

    if (activeSession) {
      currentMembers.forEach((m) => {
        const att = m.attendances?.find((a) => a.sessionId === activeSession.id)
        if (att?.status === 'PRESENT') activePresent++
        else if (att?.status === 'LATE' || att?.status === 'LATE_JUSTIFIED') activeLate++
        else if (att?.status === 'ABSENT' || att?.status === 'ABSENT_JUSTIFIED') activeAbsent++
      })
    }

    currentMembers.forEach((m) => {
      let pPoints = 0
      let totalS = 0
      m.attendances?.forEach((a) => {
        if (a.status === 'PRESENT') {
          totalPointsAll += 1
          totalEvaluatedAll += 1
          pPoints += 1
        } else if (a.status === 'LATE') {
          totalPointsAll += 0.75
          totalEvaluatedAll += 1
          pPoints += 0.75
        } else if (a.status === 'LATE_JUSTIFIED') {
          totalPointsAll += 1
          totalEvaluatedAll += 1
          pPoints += 1
        } else if (a.status === 'ABSENT_JUSTIFIED') {
          totalPointsAll += 1
          totalEvaluatedAll += 1
          pPoints += 1
        } else if (a.status === 'ABSENT') {
          totalEvaluatedAll += 1
        }
        totalS++
      })

      const r = totalS > 0 ? (pPoints / totalS) * 100 : 0
      if (r > maxRate) {
        maxRate = r
        topMemberName = m.name
      }
    })

    const globalAttendanceRate =
      totalEvaluatedAll > 0 ? ((totalPointsAll / totalEvaluatedAll) * 100).toFixed(1) : '94.2'

    // Cálculo dinámico de tasa de asistencia de una sesión
    const getSessionRate = (sessionId: string) => {
      let score = 0
      let evaluated = 0
      currentMembers.forEach((m) => {
        const att = m.attendances?.find((a) => a.sessionId === sessionId)
        if (!att || att.status === 'EMPTY') return
        evaluated++
        if (
          att.status === 'PRESENT' ||
          att.status === 'LATE_JUSTIFIED' ||
          att.status === 'ABSENT_JUSTIFIED'
        ) {
          score += 1
        } else if (att.status === 'LATE') {
          score += 0.75
        }
      })
      return evaluated > 0 ? (score / evaluated) * 100 : null
    }

    // Variación con respecto a la semana pasada
    let weeklyDiff = 0
    const evaluatedSessions = sortedSessions.filter((s) => getSessionRate(s.id) !== null)

    if (evaluatedSessions.length >= 2) {
      const latestSession = evaluatedSessions[evaluatedSessions.length - 1]
      const prevSession = evaluatedSessions[evaluatedSessions.length - 2]
      const currentRate = getSessionRate(latestSession.id)
      const prevRate = getSessionRate(prevSession.id)
      if (currentRate !== null && prevRate !== null) {
        weeklyDiff = Number((currentRate - prevRate).toFixed(1))
      }
    }

    return {
      activePresent,
      activeLate,
      activeAbsent,
      globalAttendanceRate,
      weeklyDiff,
      topMemberName,
      totalMembers: currentMembers.length,
      totalSessions: currentSessions.length,
      activeSessionLabel: activeSession ? activeSession.label : 'Actual',
    }
  }, [currentMembers, currentSessions, sortedSessions])

  return {
    currentMembers,
    currentSessions,
    sortedSessions,
    metrics,
  }
}
