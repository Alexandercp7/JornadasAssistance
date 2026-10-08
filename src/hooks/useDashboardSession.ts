'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useAttendanceStore } from '@/store/useAttendanceStore'

/**
 * Hook para gestionar la verificación y persistencia de sesión en el Dashboard.
 * Resuelve problemas de recarga (F5) esperando la hidratación del store
 * y precargando la información del grupo correspondiente sin llamadas duplicadas.
 */
export function useDashboardSession() {
  const router = useRouter()
  const {
    isAuthenticated,
    _hasHydrated,
    groupId,
    checkSession,
  } = useAuthStore()

  const { fetchGroupData } = useAttendanceStore()

  const [isVerifying, setIsVerifying] = useState(true)
  const fetchedGroupIdRef = useRef<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const verify = async () => {
      if (_hasHydrated && isAuthenticated && groupId) {
        if (isMounted) {
          if (fetchedGroupIdRef.current !== groupId) {
            fetchedGroupIdRef.current = groupId
            fetchGroupData(groupId)
          }
          setIsVerifying(false)
        }
        return
      }

      const isSessionValid = await checkSession()
      if (isMounted) {
        if (isSessionValid) {
          const authState = useAuthStore.getState()
          const currentGroupId =
            authState.groupId ||
            (authState.activeRole === 'ESCUELA' ? 'grp_escuela' : 'grp_preescuela')
          if (fetchedGroupIdRef.current !== currentGroupId) {
            fetchedGroupIdRef.current = currentGroupId
            fetchGroupData(currentGroupId)
          }
          setIsVerifying(false)
        } else {
          router.push('/')
        }
      }
    }

    verify()

    return () => {
      isMounted = false
    }
  }, [_hasHydrated, isAuthenticated, groupId, router, checkSession, fetchGroupData])

  return { isVerifying }
}
