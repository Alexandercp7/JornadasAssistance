'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, History, FileText } from 'lucide-react'
import { AttendanceTable } from '@/components/attendance/AttendanceTable'
import { AttendanceLog } from '@/components/attendance/AttendanceLog'
import { useAttendanceStore } from '@/store/useAttendanceStore'
import { SummaryView } from '@/components/dashboard/SummaryView'
import { ReportView } from '@/components/dashboard/ReportView'

type ViewState = 'resumen' | 'asistencia' | 'bitacora' | 'reporte'

export default function DashboardPage() {
  const { members, sessions } = useAttendanceStore()
  const [activeView, setActiveView] = useState<ViewState>('resumen')

  // Cálculos consolidados y memorizados para evitar re-renders innecesarios
  const metrics = useMemo(() => {
    const activeSession = sessions.length > 0 ? sessions[sessions.length - 1] : null
    
    let activePresent = 0, activeLate = 0, activeAbsent = 0
    let totalEvaluatedAll = 0, totalPointsAll = 0
    let maxRate = -1, topMemberName = 'N/A'

    if (activeSession) {
      members.forEach((m) => {
        const att = m.attendances?.find((a) => a.sessionId === activeSession.id)
        if (att?.status === 'PRESENT') activePresent++
        else if (att?.status === 'LATE' || att?.status === 'LATE_JUSTIFIED') activeLate++
        else if (att?.status === 'ABSENT' || att?.status === 'ABSENT_JUSTIFIED') activeAbsent++
      })
    }

    members.forEach((m) => {
      let pPoints = 0, totalS = 0
      m.attendances?.forEach((a) => {
        if (a.status === 'PRESENT') { totalPointsAll += 1; totalEvaluatedAll += 1; pPoints += 1 } 
        else if (a.status === 'LATE') { totalPointsAll += 0.5; totalEvaluatedAll += 1; pPoints += 0.5 } 
        else if (a.status === 'LATE_JUSTIFIED') { totalPointsAll += 0.75; totalEvaluatedAll += 1; pPoints += 0.75 } 
        else if (a.status === 'ABSENT_JUSTIFIED') { totalPointsAll += 0.25; totalEvaluatedAll += 1; pPoints += 0.25 } 
        else if (a.status === 'ABSENT') { totalEvaluatedAll += 1 }
        totalS++
      })
      
      const r = totalS > 0 ? (pPoints / totalS) * 100 : 0
      if (r > maxRate) { maxRate = r; topMemberName = m.name }
    })

    const globalAttendanceRate = totalEvaluatedAll > 0 ? ((totalPointsAll / totalEvaluatedAll) * 100).toFixed(1) : '94.2'

    return {
      activePresent,
      activeLate,
      activeAbsent,
      globalAttendanceRate,
      topMemberName,
      totalMembers: members.length,
      totalSessions: sessions.length,
      activeSessionLabel: activeSession ? activeSession.label : 'Actual'
    }
  }, [members, sessions])

  return (
    <div className="animate-in fade-in duration-300 pb-8">
      
      {activeView === 'resumen' && (
        <SummaryView metrics={metrics} onNavigate={setActiveView} />
      )}

      {activeView === 'asistencia' && (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <button onClick={() => setActiveView('resumen')} className="flex items-center gap-1.5 text-[#0D356A] font-bold text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Volver al Resumen
          </button>

          <AttendanceTable />

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setActiveView('bitacora')} className="bg-[#FAF3E7] border border-[#DE9927] hover:bg-[#F3E6D0] text-[#0D356A] font-bold p-3 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5 transition-colors">
              <History className="w-5 h-5 text-[#DE9927]" /> 
              <span className="text-xs">Ver Bitácora</span>
            </button>
            <button onClick={() => setActiveView('reporte')} className="bg-[#FAF3E7] border border-[#DE9927] hover:bg-[#F3E6D0] text-[#0D356A] font-bold p-3 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5 transition-colors">
              <FileText className="w-5 h-5 text-[#DE9927]" /> 
              <span className="text-xs text-center">Reportes y Exportación</span>
            </button>
          </div>
        </div>
      )}

      {activeView === 'bitacora' && (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <button onClick={() => setActiveView('asistencia')} className="flex items-center gap-1.5 text-[#0D356A] font-bold text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Volver a Asistencia
          </button>
          <AttendanceLog />
        </div>
      )}

      {activeView === 'reporte' && (
        <ReportView metrics={metrics} onNavigate={setActiveView} />
      )}

    </div>
  )
}