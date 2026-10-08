'use client'

import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

interface SummaryViewProps {
  onNavigate: (view: 'asistencia') => void
  metrics: {
    totalMembers: number
    activePresent: number
    activeLate: number
    activeAbsent: number
    globalAttendanceRate: string
    weeklyDiff?: number
  }
}

export function SummaryView({ onNavigate, metrics }: SummaryViewProps) {
  const diff = metrics.weeklyDiff ?? 0
  const sign = diff > 0 ? '+' : ''
  const trendText = `${sign}${diff.toFixed(1)}% respecto a la semana pasada`

  // Reglas de color:
  // - Si baja más del 10% (< -10%): Rojo (#7A1E2C)
  // - Si baja menos de 10% (-10% <= diff < 0%): Color actual (#196E52)
  // - Si se mantiene o sube (>= 0%): Verde que se viene manejando (#196E52)
  const getTrendColor = (val: number) => {
    if (val < -10) return 'text-[#7A1E2C]' // Rojo (baja más del 10%)
    if (val < 0) return 'text-[#196E52]'   // Color actual (baja menos del 10%)
    return 'text-[#196E52]'                 // Verde que se viene manejando (se mantiene o sube)
  }

  const trendColor = getTrendColor(diff)

  return (
    <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
      <div className="pt-1">
        <h1 className="font-google-sans font-bold text-[22px] text-[#1A2536] tracking-tight">
          Resumen de Hoy
        </h1>
      </div>

      <div className="bg-[#FAF3E7] rounded-3xl p-5 border-2 border-[#DE9927] shadow-sm relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="font-manrope font-bold text-[12px] text-[#5C6B7C] tracking-wider uppercase block">
            ASISTENCIA GLOBAL
          </span>
          <div className={`flex items-center gap-1.5 font-manrope font-normal text-[13px] ${trendColor}`}>
            <span>{trendText}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="font-google-sans font-black text-[36px] text-[#DE9927] leading-none">
            {metrics.globalAttendanceRate}%
          </div>
          <span className="font-manrope font-bold text-[10px] text-[#DE9927] mt-1 block">Óptimo</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-[#E5D5BC] shadow-sm flex flex-col justify-between min-h-[105px]">
          <span className="font-manrope font-semibold text-[11px] text-[#5C6B7C]">Total Integrantes</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-google-sans font-black text-[24px] text-[#0D356A]">{metrics.totalMembers}</span>
            <span className="bg-[#DDE7F5] text-[#0D356A] font-manrope font-bold text-[9px] px-2 py-0.5 rounded-full">Activos</span>
          </div>
        </div>

        <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-[#E5D5BC] shadow-sm flex flex-col justify-between min-h-[105px]">
          <span className="font-manrope font-semibold text-[11px] text-[#5C6B7C]">Presentes Hoy</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-google-sans font-black text-[24px] text-[#196E52]">{metrics.activePresent}</span>
            <span className="text-[#196E52] font-manrope font-bold text-[9px]">Asistencia</span>
          </div>
        </div>

        <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-[#E5D5BC] shadow-sm flex flex-col justify-between min-h-[105px]">
          <span className="font-manrope font-semibold text-[11px] text-[#5C6B7C]">Retardos</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-google-sans font-black text-[24px] text-[#C86A1D]">{metrics.activeLate}</span>
            <span className="text-[#C86A1D] font-manrope font-bold text-[9px]">Atención</span>
          </div>
        </div>

        <div className="bg-[#FAF3E7] rounded-2xl p-4 border border-[#E5D5BC] shadow-sm flex flex-col justify-between min-h-[105px]">
          <span className="font-manrope font-semibold text-[11px] text-[#5C6B7C]">Faltas</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-google-sans font-black text-[24px] text-[#7A1E2C]">{metrics.activeAbsent}</span>
            <span className="text-[#7A1E2C] font-manrope font-bold text-[9px]">Crítico</span>
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
              <Image src="/vector.png" alt="Crest" fill sizes="40px" className="object-contain" />
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="font-google-sans font-bold text-[15px] text-[#DE9927] group-hover:text-white transition-colors truncate">
              Tarjetas de Asistencia
            </h4>
            <p className="font-manrope font-normal text-[11px] text-white/80 truncate">
              Cada integrante cuenta con un pase QR.
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#DE9927] group-hover:translate-x-1 transition-transform shrink-0" />
      </div>
    </div>
  )
}