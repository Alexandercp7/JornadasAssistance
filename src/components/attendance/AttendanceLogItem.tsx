import { AuditLogItem } from '@/store/useAttendanceStore'

interface AttendanceLogItemProps {
  log: AuditLogItem
}

export function AttendanceLogItemCard({ log }: AttendanceLogItemProps) {
  return (
    <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-[#E5D5BC] bg-[#FAF3E7] shadow-xs hover:border-[#DE9927]/60 transition-colors">
      {/* Información Integrante y Sesión */}
      <div className="flex flex-col min-w-0 pr-2">
        <span className="font-bold text-sm text-[#0D356A] truncate">
          {log.name}
        </span>
        <span className="text-xs text-[#0D356A]/60 mt-0.5">
          Sesión: {log.session}
        </span>
      </div>

      {/* Estado y Hora en Tiempo Real */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        {log.status === 'PRESENT' && (
          <span className="text-xs font-bold text-[#1F6B5C] uppercase tracking-wide">
            ✓ PRESENTE
          </span>
        )}
        {log.status === 'LATE' && (
          <span className="text-xs font-bold text-[#D87532] uppercase tracking-wide">
            R RETARDO
          </span>
        )}
        {log.status === 'LATE_JUSTIFIED' && (
          <span className="text-xs font-bold text-[#C87D2F] uppercase tracking-wide">
            RJ RETARDO JUST.
          </span>
        )}
        {log.status === 'ABSENT' && (
          <span className="text-xs font-bold text-[#7A2634] uppercase tracking-wide">
            ✗ FALTA
          </span>
        )}
        {log.status === 'ABSENT_JUSTIFIED' && (
          <span className="text-xs font-bold text-[#9E3B4D] uppercase tracking-wide">
            FJ FALTA JUST.
          </span>
        )}

        <span className="text-xs font-bold text-[#0D356A] tracking-tight">
          {log.timestamp}
        </span>
      </div>
    </div>
  )
}
