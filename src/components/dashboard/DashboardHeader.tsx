'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

interface DashboardHeaderProps {
  onOpenScanner: () => void
}

export function DashboardHeader({ onOpenScanner }: DashboardHeaderProps) {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
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
              onClick={onOpenScanner}
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
  )
}
