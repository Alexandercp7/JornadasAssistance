'use client'

import Image from 'next/image'
import { Sparkles, School } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Role } from '@/store/useAuthStore'

interface RoleSelectionStepProps {
  onSelectRole: (role: Role) => void
}

export function RoleSelectionStep({ onSelectRole }: RoleSelectionStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Logo y Encabezado */}
      <div className="text-center flex flex-col items-center mb-8">
        <div className="relative w-24 h-24 mb-4 rounded-full shadow-[0_10px_25px_rgba(14,56,122,0.25)] border-2 border-accent-gold p-1 bg-white">
          <Image
            src="/logo.png"
            alt="Logo MJVC"
            fill
            sizes="96px"
            className="object-cover rounded-full"
            priority
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
          MJVC EA's Jesús
        </h1>
        <p className="text-xs text-accent-gold font-bold tracking-widest mt-1">
          SISTEMA DE ASISTENCIA PRIVADO
        </p>
      </div>

      <div className="mb-5">
        <h2 className="text-xl font-bold text-primary mb-1">Selección de Perfil</h2>
        <p className="text-xs text-primary/70 leading-relaxed">
          Ingrese con las credenciales asignadas para su coordinación.
        </p>
      </div>

      {/* Tarjetas de Selección de Perfil */}
      <div className="space-y-3">
        {/* Coordinación Preescuela */}
        <Card
          className="p-4 border-2 border-accent-gold cursor-pointer bg-card hover:bg-accent-gold/5 transition-all shadow-md rounded-2xl group"
          onClick={() => onSelectRole('PREESCUELA')}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-accent-gold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary mb-0.5">
                Coordinación Preescuela
              </h3>
              <p className="text-xs text-primary/70 leading-snug">
                Asistencias, auxiliares y sellos de preescuela.
              </p>
            </div>
          </div>
        </Card>

        {/* Coordinación Escuela */}
        <Card
          className="p-4 border border-primary/20 cursor-pointer bg-card hover:bg-primary/5 transition-all shadow-sm rounded-2xl group"
          onClick={() => onSelectRole('ESCUELA')}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
              <School className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary mb-0.5">
                Coordinación Escuela
              </h3>
              <p className="text-xs text-primary/70 leading-snug">
                Asistencias, auxiliares y sellos de escuela.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
