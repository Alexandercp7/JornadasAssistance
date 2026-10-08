'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { AttendanceLog } from '@/components/attendance/AttendanceLog'
import { useAttendanceStore } from '@/store/useAttendanceStore'
import { useAuthStore } from '@/store/useAuthStore'
import { SummaryView } from '@/components/dashboard/SummaryView'
import { ReportView } from '@/components/dashboard/ReportView'
import { AttendanceView } from '@/components/dashboard/AttendanceView'
import { useAttendanceMetrics } from '@/hooks/useAttendanceMetrics'

type ViewState = 'resumen' | 'asistencia' | 'bitacora' | 'reporte'

export default function DashboardPage() {
  const { members, sessions } = useAttendanceStore()
  const { activeRole, groupId } = useAuthStore()
  const [activeView, setActiveView] = useState<ViewState>('resumen')

  const currentGroupId =
    groupId || (activeRole === 'ESCUELA' ? 'grp_escuela' : 'grp_preescuela')

  const { metrics } = useAttendanceMetrics(members, sessions, currentGroupId)

  return (
    <div className="animate-in fade-in duration-300 pb-8">
      {activeView === 'resumen' && (
        <SummaryView metrics={metrics} onNavigate={setActiveView} />
      )}

      {activeView === 'asistencia' && (
        <AttendanceView onNavigate={setActiveView} />
      )}

      {activeView === 'bitacora' && (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          <button
            onClick={() => setActiveView('asistencia')}
            className="flex items-center gap-1.5 text-[#0D356A] font-bold text-sm hover:underline cursor-pointer"
          >
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