'use client'

import Image from 'next/image'
import { TrendingUp, ChevronRight } from 'lucide-react'

interface SummaryViewProps {
  onNavigate: (view: 'asistencia') => void
  metrics: {
    totalMembers: number
    activePresent: number
    activeLate: number
    activeAbsent: number
    globalAttendanceRate: string
  }
}

export function SummaryView({ onNavigate, metrics }: SummaryViewProps) {
  return (
    <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
      <div className="pt-1">
        <h1 className="text-2xl font-black text-[#0D356A] tracking-tight">
          Resumen de Hoy
        </h1>
      </div>

      <div className="bg-[#FAF3E7] rounded-3xl p-5 border-2 border-[#DE9927] shadow-sm relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-xs font-bold tracking-wider text-[#0D356A]/70 uppercase block">
            ASISTENCIA GLOBAL
          </span>
          <div className="flex items-center gap-1 text-xs text-[#196E52] font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+1.2% respecto a la semana pasada</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-4xl sm:text-5xl font-black text-[#DE9927] leading-none">
            {metrics.globalAttendanceRate}%
          </div>
          <span className="text-xs font-bold text-[#DE9927] mt-1 block">Óptimo</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-[#E5D5BC] shadow-sm flex flex-col justify-between min-h-[105px]">
          <span className="text-xs font-medium text-[#0D356A]/70">Total Integrantes</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-[#0D356A]">{metrics.totalMembers}</span>
            <span className="bg-[#DDE7F5] text-[#0D356A] text-[10px] font-bold px-2 py-0.5 rounded-full">Activos</span>
          </div>
        </div>

        <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-[#E5D5BC] shadow-sm flex flex-col justify-between min-h-[105px]">
          <span className="text-xs font-medium text-[#0D356A]/70">Presentes Hoy</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-[#196E52]">{metrics.activePresent}</span>
            <span className="text-[#196E52] text-[11px] font-bold">Asistencia</span>
          </div>
        </div>

        <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-[#E5D5BC] shadow-sm flex flex-col justify-between min-h-[105px]">
          <span className="text-xs font-medium text-[#0D356A]/70">Retardos</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-[#C86A1D]">{metrics.activeLate}</span>
            <span className="text-[#C86A1D] text-[11px] font-bold">Atención</span>
          </div>
        </div>

        <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-[#E5D5BC] shadow-sm flex flex-col justify-between min-h-[105px]">
          <span className="text-xs font-medium text-[#0D356A]/70">Faltas</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-[#7A1E2C]">{metrics.activeAbsent}</span>
            <span className="text-[#7A1E2C] text-[11px] font-bold">Crítico</span>
          </div>
        </div>
      </div>

      <div
        onClick={() => onNavigate('asistencia')}
        className="bg-[#0D356A] text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 cursor-pointer hover:bg-[#09264D] transition-colors group mt-2"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#DE9927] p-1 flex items-center justify-center shrink-0">
            <div className="relative w-full h-full">
              <Image src="/logo.png" alt="Crest" fill className="object-contain" />
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-[#DE9927] group-hover:text-white transition-colors truncate">
              Lista de asistencia
            </h4>
            <p className="text-xs text-white/80 truncate">
              ver todas las tarjetas de asistencias
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#DE9927] group-hover:translate-x-1 transition-transform shrink-0" />
      </div>
    </div>
  )
}