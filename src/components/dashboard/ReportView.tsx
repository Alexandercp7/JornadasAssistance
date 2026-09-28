'use client'

import { FileSpreadsheet, MessageSquare, Download, Share2, ArrowLeft } from 'lucide-react'
import { useAttendanceStore } from '@/store/useAttendanceStore'
import { useAuthStore } from '@/store/useAuthStore'

interface ReportViewProps {
  onNavigate: (view: 'asistencia') => void
  metrics: {
    totalSessions: number
    globalAttendanceRate: string
    topMemberName: string
    activePresent: number
    activeLate: number
    activeAbsent: number
    activeSessionLabel: string
  }
}

export function ReportView({ onNavigate, metrics }: ReportViewProps) {
  const { auditLogs } = useAttendanceStore()
  const { customTitle, groupName, groupId, activeRole } = useAuthStore()

  const currentGroupId =
    groupId || (activeRole === 'ESCUELA' ? 'grp_escuela' : 'grp_preescuela')

  const handleExportExcel = () => {
    window.open(`/api/export/excel?groupId=${currentGroupId}`, '_blank')
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📊 *Reporte de Asistencia MJVC EA's Jesús*\n` +
      `Grupo: ${customTitle || groupName}\n` +
      `Sesión: ${metrics.activeSessionLabel}\n` +
      `---------------------------------\n` +
      `✅ Presentes: ${metrics.activePresent}\n` +
      `⏳ Retardos: ${metrics.activeLate}\n` +
      `❌ Faltas: ${metrics.activeAbsent}\n` +
      `⭐ Asistencia Global: ${metrics.globalAttendanceRate}%\n` +
      `---------------------------------\n` +
      `Generado en el Sistema MJVC.`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
      <button 
        onClick={() => onNavigate('asistencia')}
        className="flex items-center gap-1.5 text-[#0D356A] font-bold text-sm hover:underline mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a Asistencia
      </button>

      <div>
        <h1 className="text-2xl font-black text-[#0D356A] tracking-tight">Reporte y Exportación</h1>
        <p className="text-xs text-[#0D356A]/70 mt-0.5">Genere extractos completos y resúmenes de asistencia.</p>
      </div>

      <div className="bg-[#0D356A] text-white rounded-3xl p-5 shadow-md space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">TOTAL SESIONES</span>
            <span className="text-2xl font-black text-[#DE9927]">{metrics.totalSessions} Activas</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">ASISTENCIA MEDIA</span>
            <span className="text-2xl font-black text-[#DE9927]">{metrics.globalAttendanceRate}%</span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs">
          <span className="text-white/80">
            Asistencia Destacada: <span className="font-bold text-white">{metrics.topMemberName}</span>
          </span>
          <span className="font-bold text-[#DE9927]">Óptimo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-[#E5D5BC] shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DE9927]/15 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-[#DE9927]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0D356A]">Exportar a Excel</h3>
              <p className="text-xs text-[#0D356A]/70">Matriz de asistencia + Historial</p>
            </div>
          </div>
          <button onClick={handleExportExcel} className="w-full bg-[#DE9927] hover:bg-[#C8841B] text-white font-bold text-sm py-3 rounded-xl shadow gap-2 flex items-center justify-center active:scale-98">
            <Download className="w-4 h-4" /> Descargar Reporte
          </button>
        </div>

        <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-[#E5D5BC] shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D356A]/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-[#0D356A]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0D356A]">Compartir Resumen</h3>
              <p className="text-xs text-[#0D356A]/70">Enviar por WhatsApp</p>
            </div>
          </div>
          <button onClick={handleShareWhatsApp} className="w-full bg-transparent border-2 border-[#0D356A] text-[#0D356A] font-bold text-sm py-2.5 rounded-xl gap-2 flex items-center justify-center active:scale-98">
            <Share2 className="w-4 h-4" /> Enviar por WhatsApp
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <h2 className="text-lg font-bold text-[#0D356A]">Vista Previa del Reporte</h2>
        <div className="bg-[#FAF3E7] rounded-2xl border border-[#E5D5BC] shadow-sm overflow-hidden">
          <div className="bg-[#0D356A] text-white px-4 py-3 grid grid-cols-3 text-xs font-bold uppercase tracking-wider">
            <span>INTEGRANTE</span><span className="text-center">ESTADO</span><span className="text-right">HORA</span>
          </div>
          <div className="divide-y divide-[#E5D5BC]/60">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="px-4 py-3 grid grid-cols-3 items-center text-xs">
                <span className="font-bold text-[#0D356A] truncate pr-2">{log.name}</span>
                <div className="flex justify-center">
                  {log.status === 'PRESENT' && <span className="bg-[#1F6B5C] text-[#F3E7C8] text-[10px] font-black px-2 py-0.5 rounded-md">✓ P</span>}
                  {log.status === 'LATE' && <span className="bg-[#D87532] text-[#F3E7C8] text-[10px] font-black px-2 py-0.5 rounded-md">R</span>}
                  {log.status === 'LATE_JUSTIFIED' && <span className="bg-[#C87D2F] text-[#F3E7C8] text-[10px] font-black px-2 py-0.5 rounded-md">RJ</span>}
                  {log.status === 'ABSENT' && <span className="bg-[#7A2634] text-[#F3E7C8] text-[10px] font-black px-2 py-0.5 rounded-md">✗ F</span>}
                  {log.status === 'ABSENT_JUSTIFIED' && <span className="bg-[#9E3B4D] text-[#F3E7C8] text-[10px] font-black px-2 py-0.5 rounded-md">FJ</span>}
                </div>
                <span className="text-right font-bold text-[#0D356A]/90">{log.timestamp.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}