'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  LogOut,
  Camera,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAttendanceStore } from '@/store/useAttendanceStore'
import { QrScannerModal } from '@/components/attendance/QrScannerModal'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const {
    isAuthenticated,
    _hasHydrated,
    groupId,
    logout,
    checkSession,
  } = useAuthStore()

  const { fetchGroupData } = useAttendanceStore()

  const [isVerifying, setIsVerifying] = useState(true)
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
  const fetchedGroupIdRef = useRef<string | null>(null)

  // Verificación de sesión segura (Resuelve el problema de recarga F5 sin duplicar llamadas)
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

  // Pantalla de carga mientras se verifica la sesión en F5
  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6ECD9] text-[#0D356A] space-y-4">
        <div className="relative w-16 h-16 rounded-full border-2 border-[#DE9927] p-1 bg-white shadow-md animate-pulse">
          <Image src="/logo.png" alt="Logo MJVC" fill priority sizes="64px" className="object-cover rounded-full" />
        </div>
        <div className="flex items-center gap-2 text-[#0D356A] text-sm font-bold">
          <Loader2 className="w-4 h-4 animate-spin text-[#DE9927]" />
          <span>Cargando sistema MJVC...</span>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6ECD9] text-[#0D356A]">

      {/* Header Superior estilo Mockup en una sola fila */}
      <header className="bg-[#0D356A] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3">

            {/* Logo y Nombre */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative rounded-full overflow-hidden bg-white/10 border-2 border-[#DE9927] p-0.5 shrink-0 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Logo MJVC"
                  fill
                  priority
                  sizes="(max-width: 640px) 32px, 40px"
                  className="object-cover rounded-full"
                />
              </div>

              <span className="font-google-sans font-bold text-[17px] sm:text-[20px] tracking-tight text-[#DE9927] leading-tight truncate">
                MJVC EA's Jesús
              </span>
            </div>

            {/* Botones de Acción Derecha: Escanear QR y Salir */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setIsQrScannerOpen(true)}
                className="bg-[#DE9927] hover:bg-[#C8841B] text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md flex items-center gap-1.5 sm:gap-2 transition-transform cursor-pointer active:scale-95"
                title="Escanear Pase QR"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Escanear</span>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 pb-24 sm:pb-8">
        {children}
      </main>

      {/* Modal del Escáner QR estilo mockup */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
      />

    </div>
  )
}