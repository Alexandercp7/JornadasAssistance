'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'

export type AttendanceStatus = 'EMPTY' | 'PRESENT' | 'LATE' | 'ABSENT'

interface InteractiveStampProps {
  initialStatus?: AttendanceStatus
  onStatusChange?: (newStatus: AttendanceStatus) => void
  size?: 'sm' | 'md' | 'lg'
}

export function InteractiveStamp({ initialStatus = 'EMPTY', onStatusChange, size = 'md' }: InteractiveStampProps) {
  const [status, setStatus] = useState<AttendanceStatus>(initialStatus)

  const cycleStatus = () => {
    const sequence: AttendanceStatus[] = ['EMPTY', 'PRESENT', 'LATE', 'ABSENT']
    const currentIndex = sequence.indexOf(status)
    const nextStatus = sequence[(currentIndex + 1) % sequence.length]
    
    setStatus(nextStatus)
    if (onStatusChange) onStatusChange(nextStatus)
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

  return (
    <button
      type="button"
      onClick={cycleStatus}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-all duration-150 outline-none select-none cursor-pointer active:scale-90
        ${status === 'EMPTY' ? 'bg-[#FAF2E5] border-2 border-[#E5D5BC] hover:border-[#DE9927]/60' : ''}
        ${status === 'PRESENT' ? 'bg-[#196E52] border-2 border-[#196E52] text-white shadow-sm' : ''}
        ${status === 'LATE' ? 'bg-[#C86A1D] border-2 border-[#C86A1D] text-white shadow-sm' : ''}
        ${status === 'ABSENT' ? 'bg-[#7A1E2C] border-2 border-[#7A1E2C] text-white shadow-sm' : ''}
      `}
      title={
        status === 'PRESENT'
          ? 'Presente'
          : status === 'LATE'
          ? 'Retardo'
          : status === 'ABSENT'
          ? 'Falta'
          : 'Sin registro (Toca para marcar)'
      }
    >
      {status === 'PRESENT' && <Check className={iconSizes} />}
      {status === 'LATE' && <span className="font-bold">R</span>}
      {status === 'ABSENT' && <X className={iconSizes} />}
    </button>
  )
}
