'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useAttendanceStore } from '@/store/useAttendanceStore'
import { useAuthStore } from '@/store/useAuthStore'

export function AttendanceLog() {
  const { auditLogs, fetchAuditLogs } = useAttendanceStore()
  const { groupId, activeRole } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')

  const currentGroupId =
    groupId || (activeRole === 'ESCUELA' ? 'grp_escuela' : 'grp_preescuela')

  useEffect(() => {
    fetchAuditLogs(currentGroupId)
  }, [currentGroupId, fetchAuditLogs])

  // Filtrado reactivo en tiempo real
  const filteredLogs = auditLogs.filter((log) =>
    log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.session.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">

      {/* Encabezado estilo Mockup */}
      <div className="pt-1">
        <h2 className="text-2xl font-black text-[#0D356A] tracking-tight">
          Bitácora de Horarios
        </h2>
        <p className="text-xs text-[#0D356A]/70 mt-0.5">
          Registro de auditoría cronológica en tiempo real.
        </p>
      </div>

      {/* Buscador Rápido estilo Mockup */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D356A]/40" />
        <input
          type="text"
          placeholder="Buscar integrante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-2xl border border-[#E5D5BC] bg-[#FAF3E7] text-xs sm:text-sm text-[#0D356A] placeholder:text-[#0D356A]/50 outline-none focus:border-[#DE9927] focus:ring-1 focus:ring-[#DE9927] transition-all shadow-xs"
        />
      </div>

      {/* Lista de Registros estilo Mockup (Tarjetas redondeadas cálidas) */}
      <div className="space-y-2.5">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-[#E5D5BC] bg-[#FAF3E7] shadow-xs hover:border-[#DE9927]/60 transition-colors"
            >
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
          ))
        ) : (
          <div className="text-center py-10 bg-[#FAF3E7] rounded-2xl border border-[#E5D5BC] p-6">
            <p className="text-xs text-[#0D356A]/60 font-medium">
              {searchTerm
                ? `No se encontraron marcas para "${searchTerm}"`
                : 'Aún no hay registros de marcas para la sesión de hoy.'}
            </p>
          </div>
        )}
      </div>

    </div>
  )
}