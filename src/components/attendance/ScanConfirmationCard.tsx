import React from 'react'
import { Check, Star } from 'lucide-react'

export interface ScanConfirmationCardProps {
  /** Nombre completo del integrante registrado */
  memberName?: string
  /** Rol o subtítulo (ej: AUXILIAR PREESCUELA) */
  memberRole?: string
  /** Hora del escaneo (ej: 09:15:23 AM) */
  timestamp?: string
  /** Texto del estado inferior (por defecto: Presente registrado) */
  statusText?: string
  /** Letra inicial o avatar personalizada */
  initial?: string
  /** Clases CSS adicionales para el contenedor */
  className?: string
}

/**
 * Icono de estrella de cuatro puntas (destello / sparkle) delineado
 */
export function SparkleFourOutline({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3C12 7.97 7.97 12 3 12C7.97 12 12 16.03 12 21C12 16.03 16.03 12 21 12C16.03 12 12 7.97 12 3Z" />
    </svg>
  )
}

/**
 * Tarjeta de confirmación / notificación de escaneo exitoso
 * Diseñada según las especificaciones de diseño con tonos crema, mostaza, verde oscuro y azul marino.
 */
export function ScanConfirmationCard({
  memberName,
  memberRole,
  timestamp,
  statusText = 'Presente registrado',
  initial,
  className = '',
}: ScanConfirmationCardProps) {
  const safeName = memberName?.trim() || 'María García'
  // Limpiar el rol de cualquier símbolo previo (como estrellas de texto)
  const safeRole = memberRole?.trim() || 'AUXILIAR PREESCUELA'
  const cleanRole = safeRole.replace(/^[★\s*-]+/, '').trim() || 'AUXILIAR PREESCUELA'

  // Letra inicial aislada (por defecto la primera letra del nombre o "M")
  const displayInitial =
    initial || (safeName.length > 0 ? safeName.charAt(0).toUpperCase() : 'M')

  const displayTime =
    timestamp ||
    new Date().toLocaleTimeString('es-MX', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full bg-[#FAF3E7] border border-[#DE9927] rounded-3xl p-5 shadow-[0_8px_24px_-6px_rgba(13,53,106,0.12)] transition-all animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 ${className}`}
    >
      {/* Sección Superior: Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#196E52]">
          <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wider uppercase">
            ESCANEO EXITOSO
          </span>
        </div>

        {/* Icono de destello de 4 puntas delineado en la esquina superior derecha */}
        <div className="text-[#DE9927] p-0.5">
          <SparkleFourOutline className="w-4 h-4" />
        </div>
      </div>

      {/* Sección Central: Información del Usuario */}
      <div className="flex items-center gap-3.5 my-3.5">
        {/* Avatar / Inicial aislada a la izquierda */}
        <span
          className="text-2xl font-normal text-[#DE9927] select-none shrink-0 w-8 text-center"
          aria-hidden="true"
        >
          {displayInitial}
        </span>

        {/* Bloque de Texto (Derecha del Avatar) */}
        <div className="min-w-0 flex-1">
          <h4 className="text-base sm:text-lg font-bold text-[#0D356A] leading-tight truncate">
            {safeName}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Star className="w-3 h-3 fill-[#64748B] text-[#64748B] shrink-0" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide truncate">
              {cleanRole}
            </span>
          </div>
        </div>
      </div>

      {/* Línea Divisoria muy fina y sutil */}
      <hr className="border-t border-[#E2E8F0] my-2.5" />

      {/* Sección Inferior: Estado y Hora */}
      <div className="flex items-center justify-between text-xs">
        {/* Texto Izquierdo: Check + Presente registrado */}
        <div className="flex items-center gap-1.5 text-[#196E52] font-medium">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
          <span>{statusText}</span>
        </div>

        {/* Texto Derecho: Hora */}
        <span className="font-semibold sm:font-bold text-[#0D356A] text-[11px] sm:text-xs">
          {displayTime}
        </span>
      </div>
    </div>
  )
}

export default ScanConfirmationCard
