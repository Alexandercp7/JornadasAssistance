'use client'

import { memo } from 'react'

export type AttendanceStatus = 'EMPTY' | 'PRESENT' | 'LATE' | 'LATE_JUSTIFIED' | 'ABSENT' | 'ABSENT_JUSTIFIED'

interface InteractiveStampProps {
  initialStatus?: AttendanceStatus
  onStatusChange?: (newStatus: AttendanceStatus, justification?: string) => void
  size?: 'sm' | 'md' | 'lg'
}

export const InteractiveStamp = memo(function InteractiveStamp({
  initialStatus = 'EMPTY',
  onStatusChange,
  size = 'md',
}: InteractiveStampProps) {
  const status = initialStatus

  const cycleStatus = () => {
    const sequence: AttendanceStatus[] = ['EMPTY', 'PRESENT', 'LATE', 'LATE_JUSTIFIED', 'ABSENT', 'ABSENT_JUSTIFIED']
    const currentIndex = sequence.indexOf(status)
    const nextStatus = sequence[(currentIndex + 1) % sequence.length]

    if (onStatusChange) onStatusChange(nextStatus)
  }

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size]

  const getTitle = () => {
    if (status === 'PRESENT') return 'Presente'
    if (status === 'LATE') return 'Retardo'
    if (status === 'LATE_JUSTIFIED') return 'Retardo Justificado (RJ)'
    if (status === 'ABSENT') return 'Falta'
    if (status === 'ABSENT_JUSTIFIED') return 'Falta Justificada (FJ)'
    return 'Sin registro (Toca para marcar)'
  }

  return (
    <button
      type="button"
      onClick={cycleStatus}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-all duration-100 outline-none select-none cursor-pointer active:scale-90 font-manrope font-extrabold text-[11px]
        ${status === 'EMPTY' ? 'bg-[#FAF2E5] border-2 border-[#E5D5BC] hover:border-[#DE9927]/60' : ''}
        ${status === 'PRESENT' ? 'bg-[#1F6B5C] border-2 border-[#1F6B5C] text-[#F3E7C8] shadow-sm' : ''}
        ${status === 'LATE' ? 'bg-[#D87532] border-2 border-[#D87532] text-[#F3E7C8] shadow-sm' : ''}
        ${status === 'LATE_JUSTIFIED' ? 'bg-[#C87D2F] border-2 border-[#C87D2F] text-[#F3E7C8] shadow-sm' : ''}
        ${status === 'ABSENT' ? 'bg-[#7A2634] border-2 border-[#7A2634] text-[#F3E7C8] shadow-sm' : ''}
        ${status === 'ABSENT_JUSTIFIED' ? 'bg-[#9E3B4D] border-2 border-[#9E3B4D] text-[#F3E7C8] shadow-sm' : ''}
      `}
      title={getTitle()}
    >
      {status === 'PRESENT' && <span className="font-manrope font-extrabold text-[11px] text-[#F3E7C8] leading-none">✓</span>}
      {status === 'LATE' && <span className="font-manrope font-extrabold text-[11px] text-[#F3E7C8] leading-none">R</span>}
      {status === 'LATE_JUSTIFIED' && <span className="font-manrope font-extrabold text-[10px] text-[#F3E7C8] leading-none">RJ</span>}
      {status === 'ABSENT' && <span className="font-manrope font-extrabold text-[11px] text-[#F3E7C8] leading-none">✗</span>}
      {status === 'ABSENT_JUSTIFIED' && <span className="font-manrope font-extrabold text-[10px] text-[#F3E7C8] leading-none">FJ</span>}
    </button>
  )
})
