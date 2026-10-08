'use client'

import { SessionItem } from '@/store/useAttendanceStore'

interface SessionHeaderCellProps {
  session: SessionItem
  onClick: () => void
}

// Separar día encima del mes sin "/"
function parseSessionHeader(label: string, sessionDate?: string) {
  if (label && label.includes('/')) {
    const [dayPart, ...monthParts] = label.split('/')
    return { day: dayPart.trim(), month: monthParts.join('').trim() }
  }
  const match = label?.trim().match(/^(\d+)\s*[-_ /]?\s*([a-zA-ZáéíóúÁÉÍÓÚ]+)$/)
  if (match) {
    return { day: match[1], month: match[2] }
  }
  if (sessionDate) {
    try {
      const d = new Date(sessionDate)
      if (!isNaN(d.getTime())) {
        const day = d.getUTCDate().toString().padStart(2, '0')
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const month = months[d.getUTCMonth()]
        return { day, month }
      }
    } catch {
      // Fallback
    }
  }
  return { day: label, month: '' }
}

export function SessionHeaderCell({ session, onClick }: SessionHeaderCellProps) {
  const { day, month } = parseSessionHeader(session.label, session.sessionDate)

  return (
    <th
      onClick={onClick}
      className="px-3 py-2.5 text-center min-w-[65px] group relative cursor-pointer hover:bg-white/15 transition-all select-none sticky top-0 bg-[#0D356A] z-30 border-b border-[#09264D]"
      title="Clic para configurar fecha o activar/desactivar retardo"
    >
      <div className="flex flex-col items-center justify-center leading-none">
        {/* Día encima */}
        <span className="text-white text-[12px] font-manrope font-bold">
          {day}
        </span>
        {/* Mes debajo sin barra "/" */}
        {month ? (
          <span className="text-white/85 text-[9px] font-manrope font-bold uppercase tracking-wider mt-0.5">
            {month}
          </span>
        ) : null}
      </div>
    </th>
  )
}
