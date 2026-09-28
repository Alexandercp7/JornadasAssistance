import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAttendanceStore } from './useAttendanceStore'

export type Role = 'PREESCUELA' | 'ESCUELA' | null

interface AuthState {
  isAuthenticated: boolean
  _hasHydrated: boolean
  activeRole: Role
  groupId: string
  groupSlug: Role
  groupName: string
  customTitle: string
  login: (role: Role, pin: string) => Promise<boolean>
  logout: () => Promise<void>
  checkSession: () => Promise<boolean>
  updateCustomTitle: (newTitle: string) => Promise<void>
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      _hasHydrated: false,
      activeRole: null,
      groupId: '',
      groupSlug: null,
      groupName: '',
      customTitle: '',

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state })
      },

      checkSession: async () => {
        try {
          const res = await fetch('/api/auth/me')
          if (res.ok) {
            const data = await res.json()
            if (data.authenticated && data.group) {
              set({
                isAuthenticated: true,
                activeRole: data.group.slug as Role,
                groupId: data.group.groupId,
                groupSlug: data.group.slug as Role,
                groupName: data.group.name,
                customTitle: data.group.customTitle,
                _hasHydrated: true,
              })
              return true
            }
          }
        } catch (e) {
          console.error('Error al verificar sesión en servidor:', e)
        }

        const { isAuthenticated } = get()
        set({ _hasHydrated: true })
        return isAuthenticated
      },

      login: async (role, pin) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, pin }),
          })

          if (res.ok) {
            const data = await res.json()
            set({
              isAuthenticated: true,
              _hasHydrated: true,
              activeRole: role,
              groupId: data.group.groupId || data.group.id,
              groupSlug: data.group.slug,
              groupName: data.group.name,
              customTitle: data.group.customTitle,
            })
            return true
          }
        } catch (error) {
          console.error('Error al autenticar con el servidor:', error)
        }

        return false
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch (e) {
          console.error('Error al limpiar cookie de sesión:', e)
        }

        try {
          useAttendanceStore.getState().resetGroupData()
        } catch (e) {
          console.error('Error al reiniciar store de asistencia:', e)
        }

        set({
          isAuthenticated: false,
          activeRole: null,
          groupId: '',
          groupSlug: null,
          groupName: '',
          customTitle: '',
        })
      },

      updateCustomTitle: async (newTitle: string) => {
        const { groupId } = get()
        set({ customTitle: newTitle })

        if (groupId) {
          try {
            await fetch(`/api/groups/${groupId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customTitle: newTitle }),
            })
          } catch (e) {
            console.error('Error al guardar título en base de datos:', e)
          }
        }
      },
    }),
    {
      name: 'mjvc_auth_storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)