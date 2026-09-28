'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  LogOut,
  Pencil,
  Camera,
  Loader2,
  Check,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAttendanceStore } from '@/store/useAttendanceStore'
import { QrScannerModal } from '@/components/attendance/QrScannerModal'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const {
    isAuthenticated,
    _hasHydrated,
    activeRole,
    groupId,
    groupName,
    customTitle,
    logout,
    checkSession,
    updateCustomTitle,
  } = useAuthStore()

  const { fetchGroupData } = useAttendanceStore()

  const [isVerifying, setIsVerifying] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [tempTitle, setTempTitle] = useState('')
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
  const fetchedGroupIdRef = useRef<string | null>(null)

  // Verificación de sesión segura (Resuelve el problema de recarga F5 sin duplicar llamadas)
  useEffect(() => {
    let isMounted = true

    const verify = async () => {
      if (_hasHydrated && isAuthenticated && groupId) {
        if (isMounted) {
          setTempTitle(customTitle || groupName)
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
          setTempTitle(authState.customTitle || authState.groupName)
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

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      updateCustomTitle(tempTitle.trim())
    }
    setIsEditing(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const formattedRole = activeRole === 'PREESCUELA' ? 'Coord. Preescuela' : activeRole === 'ESCUELA' ? 'Coord. Escuela' : activeRole || 'Coordinación'

  return (
    <div className="min-h-screen flex flex-col bg-[#F6ECD9] text-[#0D356A]">

      {/* Header Superior estilo Mockup */}
      <header className="bg-[#0D356A] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col gap-3">

            {/* FILA 1: Logo, MJVC y Sesión en la misma línea */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Crest Logo Circular */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 relative rounded-full overflow-hidden bg-white/10 border-2 border-[#DE9927] p-0.5 shrink-0 shadow-sm">
                <Image src="/logo.png" alt="Logo MJVC" fill priority sizes="(max-width: 640px) 36px, 40px" className="object-cover rounded-full" />
              </div>

              {/* Título y Badge de Sesión alineados estrictamente a la derecha */}
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <span className="font-google-sans font-bold text-[18px] sm:text-[20px] tracking-tight text-[#DE9927] leading-tight truncate">
                  MJVC EA's Jesús
                </span>
                <span className="font-manrope font-semibold text-[10px] text-[#F3E7C8] bg-white/10 px-2 py-0.5 rounded border border-white/15 whitespace-nowrap shrink-0">
                  [Sesión: {formattedRole}]
                </span>
              </div>
            </div>

            {/* FILA 2: Grupo Editable a la izquierda, Cámara y Salir a la derecha */}
            <div className="flex items-center justify-between gap-3 sm:pl-[52px]">

              {/* Edición del Grupo */}
              <div className="flex items-center min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="h-8 font-manrope font-medium text-sm bg-white/10 border border-[#DE9927] rounded-lg px-2.5 text-[#F3E7C8] outline-none w-44 sm:w-64 placeholder-[#F3E7C8]/50 focus:bg-white/20 transition-colors"
                      autoFocus
                      onBlur={handleSaveTitle}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    />
                    <button onClick={handleSaveTitle} className="p-1.5 bg-[#DE9927]/20 rounded-lg text-[#DE9927] hover:bg-[#DE9927] hover:text-white transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/5 py-1.5 px-2 -ml-2 rounded-lg transition-colors text-[#F3E7C8]"
                    title="Clic para editar nombre del grupo"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#DE9927] shrink-0" />
                    <span className="font-manrope font-medium text-sm text-[#F3E7C8] truncate max-w-[180px] sm:max-w-[350px]">
                      Grupo: {customTitle || groupName}
                    </span>
                  </div>
                )}
              </div>

              {/* Botones de Acción Derecha: Escanear QR y Salir */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Botón Escanear Pase QR */}
                <button
                  onClick={() => setIsQrScannerOpen(true)}
                  className="bg-[#DE9927] hover:bg-[#C8841B] text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md flex items-center gap-2 transition-transform cursor-pointer active:scale-95"
                  title="Escanear Pase QR"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Escanear</span>
                </button>

                {/* Botón Salir */}
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