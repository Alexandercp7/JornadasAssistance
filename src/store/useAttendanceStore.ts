import { create } from 'zustand'

export type AttendanceStatus =
  | 'EMPTY'
  | 'PRESENT'
  | 'LATE'
  | 'LATE_JUSTIFIED'
  | 'ABSENT'
  | 'ABSENT_JUSTIFIED'

export interface SessionItem {
  id: string
  groupId: string
  label: string
  sessionDate: string
}

export interface AttendanceItem {
  id: string
  memberId: string
  sessionId: string
  status: AttendanceStatus
  justification?: string | null
}

export interface MemberItem {
  id: string
  groupId: string
  name: string
  isAuxiliar: boolean
  avatarUrl: string | null
  roleSubtitle: string
  qrToken: string
  attendances: AttendanceItem[]
}

export interface AuditLogItem {
  id: string
  name: string
  session: string
  status: AttendanceStatus
  justification?: string | null
  timestamp: string
  date?: string
  coordinatorRole: string
  avatarUrl?: string | null
  isAuxiliar?: boolean
}

interface AttendanceStoreState {
  members: MemberItem[]
  sessions: SessionItem[]
  auditLogs: AuditLogItem[]
  isLoading: boolean
  error: string | null

  // Métodos de carga estrictos desde la DB
  fetchGroupData: (groupId: string) => Promise<void>
  fetchAuditLogs: (groupId?: string, search?: string) => Promise<void>

  // Métodos de miembros (CRUD)
  addMember: (data: {
    groupId: string
    name: string
    isAuxiliar: boolean
    roleSubtitle?: string
    avatarUrl?: string | null
  }) => Promise<boolean>
  updateMember: (
    id: string,
    data: { name?: string; isAuxiliar?: boolean; roleSubtitle?: string; avatarUrl?: string | null }
  ) => Promise<boolean>
  deleteMember: (id: string) => Promise<boolean>
  toggleAuxiliar: (id: string) => Promise<boolean>

  // Métodos de sesiones
  addSession: (groupId: string, label: string, sessionDate?: string) => Promise<boolean>
  deleteSession: (sessionId: string) => Promise<boolean>

  // Marcado de asistencia
  markAttendance: (
    memberId: string,
    sessionId: string,
    status: AttendanceStatus,
    coordinatorRole?: string,
    justification?: string
  ) => Promise<void>

  // Escaneo QR
  processQrScan: (
    qrToken: string,
    sessionId?: string,
    coordinatorRole?: string
  ) => Promise<{ success: boolean; message: string; memberName?: string }>
}

export const useAttendanceStore = create<AttendanceStoreState>((set, get) => ({
  members: [],
  sessions: [],
  auditLogs: [],
  isLoading: false,
  error: null,

  fetchGroupData: async (groupId: string) => {
    set({ isLoading: true, error: null })
    try {
      const [membersRes, sessionsRes] = await Promise.all([
        fetch(`/api/members?groupId=${groupId}`),
        fetch(`/api/sessions?groupId=${groupId}`),
      ])

      if (membersRes.ok && sessionsRes.ok) {
        const membersData = await membersRes.json()
        const sessionsData = await sessionsRes.json()

        set({
          members: Array.isArray(membersData) ? membersData : [],
          sessions: Array.isArray(sessionsData) ? sessionsData : [],
          isLoading: false,
        })
        get().fetchAuditLogs(groupId)
        return
      } else {
        set({ error: 'Error al consultar datos de la base de datos', isLoading: false })
      }
    } catch (e) {
      console.error('Error al conectar con la base de datos:', e)
      set({ error: 'No se pudo conectar con la base de datos', isLoading: false })
    }

    get().fetchAuditLogs(groupId)
  },

  fetchAuditLogs: async (groupId?: string, search?: string) => {
    try {
      const url = new URL('/api/audit-logs', window.location.origin)
      if (groupId) url.searchParams.set('groupId', groupId)
      if (search) url.searchParams.set('search', search)

      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        set({ auditLogs: Array.isArray(data) ? data : [] })
      }
    } catch (e) {
      console.error('Error al cargar bitácora desde la base de datos:', e)
    }
  },

  addMember: async (data) => {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const newMember = await res.json()
        set((state) => ({ members: [newMember, ...state.members] }))
        return true
      }
    } catch (e) {
      console.error('Error al registrar integrante en base de datos:', e)
    }
    return false
  },

  updateMember: async (id, data) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const updated = await res.json()
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...updated } : m)),
        }))
        return true
      }
    } catch (e) {
      console.error('Error al actualizar integrante en base de datos:', e)
    }
    return false
  },

  deleteMember: async (id) => {
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
      if (res.ok) {
        set((state) => ({ members: state.members.filter((m) => m.id !== id) }))
        return true
      }
    } catch (e) {
      console.error('Error al eliminar integrante de la base de datos:', e)
    }
    return false
  },

  toggleAuxiliar: async (id) => {
    const member = get().members.find((m) => m.id === id)
    if (!member) return false

    const newIsAuxiliar = !member.isAuxiliar
    const newSubtitle = newIsAuxiliar ? 'Auxiliares y Guías' : 'Integrantes'

    return get().updateMember(id, {
      isAuxiliar: newIsAuxiliar,
      roleSubtitle: newSubtitle,
    })
  },

  addSession: async (groupId, label, sessionDate) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, label, sessionDate }),
      })

      if (res.ok) {
        const newSession = await res.json()
        set((state) => ({ sessions: [...state.sessions, newSession] }))
        // Refrescar datos para sincronizar celdas de asistencia
        get().fetchGroupData(groupId)
        return true
      }
    } catch (e) {
      console.error('Error al crear sesión en base de datos:', e)
    }
    return false
  },

  deleteSession: async (sessionId) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
      if (res.ok) {
        set((state) => ({ sessions: state.sessions.filter((s) => s.id !== sessionId) }))
        return true
      }
    } catch (e) {
      console.error('Error al eliminar sesión de la base de datos:', e)
    }
    return false
  },

  markAttendance: async (memberId, sessionId, status, coordinatorRole = 'PREESCUELA', justification) => {
    // 1. Actualización optimista en el estado
    set((state) => ({
      members: state.members.map((m) => {
        if (m.id !== memberId) return m

        const existingAtt = m.attendances.find((a) => a.sessionId === sessionId)
        let newAttendances: AttendanceItem[]

        if (existingAtt) {
          newAttendances = m.attendances.map((a) =>
            a.sessionId === sessionId ? { ...a, status, justification } : a
          )
        } else {
          newAttendances = [
            ...m.attendances,
            { id: `att_${Date.now()}`, memberId, sessionId, status, justification },
          ]
        }

        return { ...m, attendances: newAttendances }
      }),
    }))

    // 2. Persistir en la base de datos MySQL / Supabase
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, sessionId, status, coordinatorRole, justification }),
      })

      if (res.ok) {
        // Recargar bitácora real de la base de datos
        const member = get().members.find((m) => m.id === memberId)
        if (member) {
          get().fetchAuditLogs(member.groupId)
        }
      } else {
        const errorData = await res.json()
        console.error('Error del servidor:', errorData)
        // Podríamos revertir el estado optimista si falla
      }
    } catch (e) {
      console.error('Error al guardar asistencia en MySQL:', e)
    }
  },

  processQrScan: async (qrToken, sessionId, coordinatorRole) => {
    try {
      const res = await fetch('/api/attendance/scan-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken, sessionId, coordinatorRole }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.member && data.session) {
          // Refrescar datos reales del grupo desde la base de datos
          const currentMember = get().members.find((m) => m.qrToken === qrToken)
          if (currentMember) {
            get().fetchGroupData(currentMember.groupId)
          }
        }
        return { success: true, message: data.message, memberName: data.member?.name }
      } else {
        const errorData = await res.json()
        return { success: false, message: errorData.error || 'Código QR no reconocido' }
      }
    } catch (e) {
      console.error('Error al procesar escaneo QR en base de datos:', e)
      return { success: false, message: 'Error de conexión con la base de datos' }
    }
  },
}))
