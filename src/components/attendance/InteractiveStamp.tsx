'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

export type AttendanceStatus = 'EMPTY' | 'PRESENT' | 'LATE' | 'LATE_JUSTIFIED' | 'ABSENT' | 'ABSENT_JUSTIFIED'

interface InteractiveStampProps {
  initialStatus?: AttendanceStatus
  onStatusChange?: (newStatus: AttendanceStatus, justification?: string) => void
  size?: 'sm' | 'md' | 'lg'
}

export function InteractiveStamp({ initialStatus = 'EMPTY', onStatusChange, size = 'md' }: InteractiveStampProps) {
  const [status, setStatus] = useState<AttendanceStatus>(initialStatus)

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  const cycleStatus = () => {
    const sequence: AttendanceStatus[] = ['EMPTY', 'PRESENT', 'LATE', 'LATE_JUSTIFIED', 'ABSENT', 'ABSENT_JUSTIFIED']
    const currentIndex = sequence.indexOf(status)
    const nextStatus = sequence[(currentIndex + 1) % sequence.length]
    
    let justification: string | undefined = undefined

    if (nextStatus === 'LATE_JUSTIFIED' || nextStatus === 'ABSENT_JUSTIFIED') {
      const reason = window.prompt(`Ingrese el motivo para ${nextStatus === 'LATE_JUSTIFIED' ? 'Retardo Justificado' : 'Falta Justificada'}:`)
      if (!reason || reason.trim() === '') {
        // Si cancela o lo deja vacío, no hacemos nada, se queda en el estado actual
        // El usuario puede volver a hacer clic para intentar de nuevo o pasar al siguiente
        return
      }
      justification = reason.trim()
    }

    setStatus(nextStatus)
    if (onStatusChange) onStatusChange(nextStatus, justification)
  }

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size]

  const iconSizes = {
    sm: 'w-3.5 h-3.5 stroke-[2.5]',
    md: 'w-4 h-4 stroke-[2.5]',
    lg: 'w-5 h-5 stroke-[2.5]',
  }[size]

  const getTitle = () => {
    if (status === 'PRESENT') return 'Presente'
    if (status === 'LATE') return 'Retardo'
    if (status === 'LATE_JUSTIFIED') return 'Retardo Justificado'
    if (status === 'ABSENT') return 'Falta'
    if (status === 'ABSENT_JUSTIFIED') return 'Falta Justificada'
    return 'Sin registro (Toca para marcar)'
  }

  return (
    <button
      type="button"
      onClick={cycleStatus}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-all duration-150 outline-none select-none cursor-pointer active:scale-90
        ${status === 'EMPTY' ? 'bg-[#FAF2E5] border-2 border-[#E5D5BC] hover:border-[#DE9927]/60' : ''}
        ${status === 'PRESENT' ? 'bg-[#196E52] border-2 border-[#196E52] text-white shadow-sm' : ''}
        ${status === 'LATE' ? 'bg-[#C86A1D] border-2 border-[#C86A1D] text-white shadow-sm' : ''}
        ${status === 'LATE_JUSTIFIED' ? 'bg-[#D98A44] border-2 border-[#D98A44] text-white shadow-sm' : ''}
        ${status === 'ABSENT' ? 'bg-[#7A1E2C] border-2 border-[#7A1E2C] text-white shadow-sm' : ''}
        ${status === 'ABSENT_JUSTIFIED' ? 'bg-[#9C4250] border-2 border-[#9C4250] text-white shadow-sm' : ''}
      `}
      title={getTitle()}
    >
      {status === 'PRESENT' && <Check className={iconSizes} />}
      {status === 'LATE' && <span className="font-bold">R</span>}
      {status === 'LATE_JUSTIFIED' && <span className="font-bold text-[10px]">RJ</span>}
      {status === 'ABSENT' && <X className={iconSizes} />}
      {status === 'ABSENT_JUSTIFIED' && <span className="font-bold text-[10px]">FJ</span>}
    </button>
  )
}
