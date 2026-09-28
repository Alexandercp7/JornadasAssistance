'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { toPng } from 'html-to-image'
import { X, Download, Star, Check, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemberItem, SessionItem } from '@/store/useAttendanceStore'

interface LoyaltyCardModalProps {
  isOpen: boolean
  onClose: () => void
  member: MemberItem | null
  sessions: SessionItem[]
  groupTitle?: string
  onOpenQr?: () => void
}

export function LoyaltyCardModal({
  isOpen,
  onClose,
  member,
  sessions,
  groupTitle = 'Preescuela',
  onOpenQr,
}: LoyaltyCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen || !member) return null

  // Función para exportar la tarjeta física digitalizada a PNG de alta definición
  const handleDownloadImage = async () => {
    if (cardRef.current) {
      try {
        setIsExporting(true)
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 })
        const link = document.createElement('a')
        link.download = `LoyaltyCard_${member.name.replace(/\s+/g, '_')}.png`
        link.href = dataUrl
        link.click()
      } catch (err) {
        console.error('Error al generar la imagen de la tarjeta:', err)
      } finally {
        setIsExporting(false)
      }
    }
  }

  // Obtener los sellos para las sesiones disponibles
  const stamps = sessions.map((session) => {
    const att = member.attendances?.find((a) => a.sessionId === session.id)
    return {
      sessionLabel: session.label,
      status: att ? att.status : 'EMPTY',
    }
  })

  // Asegurar al menos 8 casillas para la cuadrícula visual de fidelidad
  const paddedStamps = [...stamps]
  while (paddedStamps.length < 8) {
    paddedStamps.push({ sessionLabel: `S${paddedStamps.length + 1}`, status: 'EMPTY' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[92vh]">

        {/* Barra superior del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
          <span className="text-sm font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-gold" /> Tarjeta Digital
          </span>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5 text-primary" />
          </Button>
        </div>

        {/* Contenido Desplazable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 flex flex-col items-center">

          {/* ================================================================ */}
          {/* TARJETA FÍSICA DIGITALIZADA (LOYALTY CARD EXPORTABLE)            */}
          {/* ================================================================ */}
          <div
            ref={cardRef}
            className="w-full max-w-[340px] bg-primary text-primary-foreground rounded-3xl p-6 shadow-2xl border-2 border-accent-gold flex flex-col justify-between relative overflow-hidden"
            style={{ aspectRatio: '3/4' }}
          >
            {/* Elemento de fondo con resplandor dorado */}
            <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-accent-gold/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

            {/* Cabecera Oficial */}
            <div className="flex items-center justify-between border-b border-primary-foreground/15 pb-3 z-10">
              <div>
                <h3 className="text-lg font-black tracking-tight text-accent-gold">MJVC EA's Jesús</h3>
                <p className="text-[10px] text-primary-foreground/80 font-medium">{member.roleSubtitle}</p>
              </div>

              {/* === LOGO INTERACTIVO PARA ABRIR QR === */}
              <div
                onClick={onOpenQr}
                title="Generar Pase QR"
                className="w-10 h-10 relative rounded-full border-2 border-accent-gold bg-primary-foreground p-0.5 shadow-md shrink-0 cursor-pointer hover:scale-105 transition-transform active:scale-95"
              >
                <Image src="/logo.png" alt="Logo MJVC" fill className="object-cover rounded-full" />
              </div>
            </div>

            {/* Identificación del Integrante */}
            <div className="flex items-center gap-4 my-auto py-2 z-10">
              <div className="w-16 h-16 rounded-full border-2 border-accent-gold overflow-hidden bg-primary-foreground/10 relative shadow-inner shrink-0 flex items-center justify-center">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary-foreground/50" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-primary-foreground leading-snug">{member.name}</h4>
                {member.isAuxiliar && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black bg-accent-gold text-primary px-2.5 py-0.5 rounded-full shadow-md">
                    <Star className="w-3 h-3 fill-primary text-primary" /> AUXILIAR DESTACADO
                  </span>
                )}
              </div>
            </div>

            {/* Cuadrícula de Sellos Recientes (Loyalty Stamps Grid) */}
            <div className="space-y-2 z-10 bg-primary-foreground/5 p-3 rounded-2xl border border-primary-foreground/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-accent-gold uppercase">Historial de Sellos</span>
                <span className="text-[9px] text-primary-foreground/60">{groupTitle}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {paddedStamps.slice(0, 8).map((stamp, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative shadow-sm transition-all ${stamp.status === 'PRESENT'
                        ? 'bg-accent-gold border-accent-gold text-primary shadow-[0_0_12px_rgba(227,163,54,0.4)]'
                        : stamp.status === 'LATE'
                          ? 'bg-status-late border-status-late text-white'
                          : stamp.status === 'LATE_JUSTIFIED'
                            ? 'bg-status-late-justified border-status-late-justified text-white'
                            : stamp.status === 'ABSENT'
                              ? 'bg-status-absent border-status-absent text-white'
                              : stamp.status === 'ABSENT_JUSTIFIED'
                                ? 'bg-status-absent-justified border-status-absent-justified text-white'
                                : 'bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground/30'
                      }`}
                  >
                    <span className="text-[8px] font-bold opacity-80 mb-0.5">{stamp.sessionLabel}</span>
                    {stamp.status === 'PRESENT' && <Check className="w-4 h-4 stroke-[3]" />}
                    {stamp.status === 'LATE' && <span className="font-bold text-xs">R</span>}
                    {stamp.status === 'LATE_JUSTIFIED' && <span className="font-bold text-[10px]">RJ</span>}
                    {stamp.status === 'ABSENT' && <span className="font-bold text-xs">✗</span>}
                    {stamp.status === 'ABSENT_JUSTIFIED' && <span className="font-bold text-[10px]">FJ</span>}
                    {stamp.status === 'EMPTY' && <div className="w-2 h-2 rounded-full border border-current" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Pie de Validación Oficial */}
            <div className="pt-3 border-t border-primary-foreground/15 text-center z-10">
              <p className="text-[8px] text-primary-foreground/60 leading-tight">
                Validado por: Coordinación {groupTitle} — MJVC EA's Jesús
              </p>
            </div>

          </div>

          {/* Botón para Descargar PNG e Instrucciones QR */}
          <div className="w-full max-w-[340px] pt-2">
            <Button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="w-full bg-accent-gold text-primary hover:bg-accent-gold/90 font-bold shadow-md gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generando imagen...' : 'Descargar Tarjeta (PNG)'}
            </Button>
            <p className="text-[11px] text-center text-primary/60 mt-3 font-medium">
              Toque el logotipo superior para generar su Pase QR. Guarde esta tarjeta para uso sin conexión.
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}