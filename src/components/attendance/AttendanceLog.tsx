'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useAttendanceStore } from '@/store/useAttendanceStore'
import { useAuthStore } from '@/store/useAuthStore'
import { AttendanceLogItemCard } from './AttendanceLogItem'

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
      {/* Encabezado */}
      <div className="pt-1">
        <h2 className="text-2xl font-black text-[#0D356A] tracking-tight">
          Bitácora de Horarios
        </h2>
        <p className="text-xs text-[#0D356A]/70 mt-0.5">
          Registro de auditoría cronológica en tiempo real.
        </p>
      </div>

      {/* Buscador Rápido */}
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

      {/* Lista de Registros */}
      <div className="space-y-2.5">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <AttendanceLogItemCard key={log.id} log={log} />
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