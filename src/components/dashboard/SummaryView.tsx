'use client'

import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { SummaryMetricCard } from './SummaryMetricCard'

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

  const getTrendColor = (val: number) => {
    if (val < -10) return 'text-[#7A1E2C]'
    if (val < 0) return 'text-[#196E52]'
    return 'text-[#196E52]'
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
          <span className="font-manrope font-bold text-[10px] text-[#DE9927] mt-1 block">
            Óptimo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <SummaryMetricCard
          label="Total Integrantes"
          value={metrics.totalMembers}
          badgeText="Activos"
          valueColor="text-[#0D356A]"
          badgeClassName="bg-[#DDE7F5] text-[#0D356A] font-manrope font-bold text-[9px] px-2 py-0.5 rounded-full"
        />

        <SummaryMetricCard
          label="Presentes Hoy"
          value={metrics.activePresent}
          badgeText="Asistencia"
          valueColor="text-[#196E52]"
          badgeClassName="text-[#196E52] font-manrope font-bold text-[9px]"
        />

        <SummaryMetricCard
          label="Retardos"
          value={metrics.activeLate}
          badgeText="Atención"
          valueColor="text-[#C86A1D]"
          badgeClassName="text-[#C86A1D] font-manrope font-bold text-[9px]"
        />

        <SummaryMetricCard
          label="Faltas"
          value={metrics.activeAbsent}
          badgeText="Crítico"
          valueColor="text-[#7A1E2C]"
          badgeClassName="text-[#7A1E2C] font-manrope font-bold text-[9px]"
        />
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