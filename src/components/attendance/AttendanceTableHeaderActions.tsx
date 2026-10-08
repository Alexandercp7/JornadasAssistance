'use client'

import { Plus, Calendar } from 'lucide-react'

interface AttendanceTableHeaderActionsProps {
  onAddMember: () => void
  onAddSession: () => void
}

export function AttendanceTableHeaderActions({
  onAddMember,
  onAddSession,
}: AttendanceTableHeaderActionsProps) {
  return (
    <div className="flex items-center justify-between gap-2 pt-1">
      <div>
        <h2 className="font-fraunces font-bold text-[20px] text-[#0D356A] tracking-tight">
          Lista de Asistencia
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Botón + Miembro */}
        <button
          onClick={onAddMember}
          className="bg-[#0D356A] hover:bg-[#09264D] text-white font-manrope font-semibold text-[11px] px-3 py-2 rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Miembro</span>
        </button>

        {/* Botón Fecha */}
        <button
          onClick={onAddSession}
          className="border-2 border-[#0D356A] text-[#0D356A] hover:bg-[#0D356A]/5 bg-transparent font-manrope font-semibold text-[11px] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Fecha</span>
        </button>
      </div>
    </div>
  )
}
