import { AuditLogItem } from '@/store/useAttendanceStore'

interface ReportPreviewTableProps {
  auditLogs: AuditLogItem[]
}

export function ReportPreviewTable({ auditLogs }: ReportPreviewTableProps) {
  return (
    <div className="space-y-2 pt-2">
      <h2 className="text-lg font-bold text-[#0D356A]">Vista Previa del Reporte</h2>
      <div className="bg-[#FAF3E7] rounded-2xl border border-[#E5D5BC] shadow-sm overflow-hidden">
        <div className="bg-[#0D356A] text-white px-4 py-3 grid grid-cols-3 text-xs font-bold uppercase tracking-wider">
          <span>INTEGRANTE</span>
          <span className="text-center">ESTADO</span>
          <span className="text-right">HORA</span>
        </div>
        <div className="divide-y divide-[#E5D5BC]/60">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="px-4 py-3 grid grid-cols-3 items-center text-xs">
              <span className="font-bold text-[#0D356A] truncate pr-2">{log.name}</span>
              <div className="flex justify-center">
                {log.status === 'PRESENT' && (
                  <span className="bg-[#1F6B5C] text-[#F3E7C8] text-[10px] font-black px-2 py-0.5 rounded-md">
                    ✓ P
                  </span>
                )}
                {log.status === 'LATE' && (
                  <span className="bg-[#D87532] text-[#F3E7C8] text-[10px] font-black px-2 py-0.5 rounded-md">
                    R
                  </span>
                )}
                {log.status === 'LATE_JUSTIFIED' && (
                  <span className="bg-[#C87D2F] text-[#F3E7C8] text-[10px] font-black px-2 py-0.5 rounded-md">
                    RJ
                  </span>
                )}
                {log.status === 'ABSENT' && (
                  <span className="bg-[#7A2634] text-[#F3E7C8] text-[10px] font-black px-2 py-0.5 rounded-md">
                    ✗ F
                  </span>
                )}
                {log.status === 'ABSENT_JUSTIFIED' && (
                  <span className="bg-[#9E3B4D] text-[#F3E7C8] text-[10px] font-black px-2 py-0.5 rounded-md">
                    FJ
                  </span>
                )}
              </div>
              <span className="text-right font-bold text-[#0D356A]/90">
                {log.timestamp.slice(0, 8)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
