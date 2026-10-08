'use client'

import { ArrowLeft, History, FileText } from 'lucide-react'
import { AttendanceTable } from '@/components/attendance/AttendanceTable'

interface AttendanceViewProps {
  onNavigate: (view: 'resumen' | 'bitacora' | 'reporte') => void
}

export function AttendanceView({ onNavigate }: AttendanceViewProps) {
  return (
    <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
      <button
        onClick={() => onNavigate('resumen')}
        className="flex items-center gap-1.5 text-[#0D356A] font-bold text-sm hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Resumen
      </button>

      <AttendanceTable />

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('bitacora')}
          className="bg-[#FAF3E7] border border-[#DE9927] hover:bg-[#F3E6D0] text-[#0D356A] font-bold p-3 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <History className="w-5 h-5 text-[#DE9927]" />
          <span className="text-xs">Ver Bitácora</span>
        </button>
        <button
          onClick={() => onNavigate('reporte')}
          className="bg-[#FAF3E7] border border-[#DE9927] hover:bg-[#F3E6D0] text-[#0D356A] font-bold p-3 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <FileText className="w-5 h-5 text-[#DE9927]" />
          <span className="text-xs text-center">Reportes y Exportación</span>
        </button>
      </div>
    </div>
  )
}
