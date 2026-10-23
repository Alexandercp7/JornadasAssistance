'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { QRCodeSVG } from 'qrcode.react'
import { X, Download, Check, Sparkles, User, Edit2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemberItem, SessionItem } from '@/store/useAttendanceStore'

interface LoyaltyCardModalProps {
  isOpen: boolean
  onClose: () => void
  member: MemberItem | null
  sessions: SessionItem[]
  groupTitle?: string
  onOpenQr?: () => void
  onEditMember?: () => void
}

// Función auxiliar para exportar a PNG de alta definición
async function generateCardPng(cardElement: HTMLDivElement): Promise<string> {
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready
  }
  return await toPng(cardElement, { cacheBust: true, pixelRatio: 3, skipFonts: true })
}

export function LoyaltyCardModal({
  isOpen,
  onClose,
  member,
  sessions,
  groupTitle = 'Preescuela',
  onOpenQr,
  onEditMember,
}: LoyaltyCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const qrPassRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen || !member) return null

  // Función para descargar la imagen directamente
  const handleDownloadImage = async () => {
    if (!cardRef.current) return
    try {
      setIsExporting(true)
      const dataUrl = await generateCardPng(cardRef.current)
      const link = document.createElement('a')
      const formattedName = member.name.trim().replace(/\s+/g, ' ').replace(/[\\/:*?"<>|]/g, '')
      link.download = `${formattedName} Asistencia.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Error al generar la imagen de la tarjeta:', err)
    } finally {
      setIsExporting(false)
    }
  }

  // Compartir la tarjeta de asistencia y el pase QR por WhatsApp
  const handleShareWhatsApp = async () => {
    if (!cardRef.current) return
    try {
      setIsExporting(true)
      const formattedName = member.name.trim().replace(/\s+/g, ' ').replace(/[\\/:*?"<>|]/g, '')
      const cardFileName = `${formattedName} Asistencia.png`
      const qrFileName = `Pase_QR_${formattedName.replace(/\s+/g, '_')}.png`

      // 1. Generar PNG de la tarjeta de asistencia
      const cardDataUrl = await generateCardPng(cardRef.current)
      const cardRes = await fetch(cardDataUrl)
      const cardBlob = await cardRes.blob()
      const cardFile = new File([cardBlob], cardFileName, { type: 'image/png' })

      const filesToShare: File[] = [cardFile]
      let qrDataUrl: string | null = null

      // 2. Generar PNG del pase QR si está disponible
      if (qrPassRef.current && member.qrToken) {
        try {
          qrDataUrl = await generateCardPng(qrPassRef.current)
          const qrRes = await fetch(qrDataUrl)
          const qrBlob = await qrRes.blob()
          const qrFile = new File([qrBlob], qrFileName, { type: 'image/png' })
          filesToShare.push(qrFile)
        } catch (qrErr) {
          console.error('Error al generar la imagen del pase QR:', qrErr)
        }
      }

      // 3. Web Share API (WhatsApp y apps compatibles en móviles)
      if (typeof navigator !== 'undefined' && navigator.canShare) {
        if (navigator.canShare({ files: filesToShare })) {
          await navigator.share({
            files: filesToShare,
            title: `${member.name} - Asistencia y Pase QR`,
          })
          return
        } else if (navigator.canShare({ files: [cardFile] })) {
          await navigator.share({
            files: [cardFile],
            title: `${member.name} - Asistencia`,
          })
          if (qrDataUrl) {
            const link = document.createElement('a')
            link.download = qrFileName
            link.href = qrDataUrl
            link.click()
          }
          return
        }
      }

      // 4. Fallback para navegadores de escritorio: descarga directa de ambos archivos
      const linkCard = document.createElement('a')
      linkCard.download = cardFileName
      linkCard.href = cardDataUrl
      linkCard.click()

      if (qrDataUrl) {
        setTimeout(() => {
          const linkQr = document.createElement('a')
          linkQr.download = qrFileName
          linkQr.href = qrDataUrl
          linkQr.click()
        }, 300)
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Error al compartir por WhatsApp:', err)
      }
    } finally {
      setIsExporting(false)
    }
  }

  // Obtener las últimas 8 sesiones (o todas si hay 8 o menos)
  const recentSessions = sessions.length > 8 ? sessions.slice(-8) : sessions

  // Obtener los sellos para las sesiones más recientes
  const stamps = recentSessions.map((session) => {
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
            style={{
              aspectRatio: '3/4',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {/* Elemento de fondo con resplandor dorado */}
            <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-accent-gold/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

            {/* Cabecera Oficial */}
            <div className="flex items-center justify-between border-b border-primary-foreground/15 pb-3 z-10 gap-2">
              <div className="flex flex-col min-w-0">
                <h3 className="text-[17px] font-black tracking-tight text-accent-gold whitespace-nowrap leading-tight">
                  MJVC EA's Jesús
                </h3>
                <p className="text-[10px] text-primary-foreground/80 font-medium leading-tight mt-0.5">
                  {groupTitle}
                </p>
              </div>

              {/* === LOGO INTERACTIVO PARA ABRIR QR === */}
              <div
                onClick={onOpenQr}
                title="Generar Pase QR"
                className="w-10 h-10 rounded-full overflow-hidden shadow-md shrink-0 cursor-pointer hover:scale-105 transition-transform active:scale-95 flex items-center justify-center"
              >
                <img
                  src="/logo.png"
                  alt="Logo MJVC"
                  className="w-full h-full object-cover scale-[1.08] block"
                />
              </div>
            </div>

            {/* Identificación del Integrante */}
            <div className="flex items-center gap-4 my-auto py-2 z-10">
              <div
                onClick={onEditMember}
                title="Haga clic para editar"
                className={`w-16 h-16 rounded-full border-2 border-accent-gold overflow-hidden bg-primary-foreground/10 relative shadow-inner shrink-0 flex items-center justify-center ${onEditMember ? 'cursor-pointer hover:scale-105 hover:border-white transition-all group/avatar' : ''
                  }`}
              >
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary-foreground/50" />
                )}
                {!isExporting && onEditMember && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                    <Edit2 className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-primary-foreground leading-snug">{member.name}</h4>
              </div>
            </div>

            {/* Cuadrícula de Sellos Recientes (Loyalty Stamps Grid) */}
            <div className="space-y-2 z-10 bg-primary-foreground/5 p-3 rounded-2xl border border-primary-foreground/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-accent-gold uppercase">Historial de Sellos</span>
                <span className="text-[9px] text-primary-foreground/60">{groupTitle}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {stamps.slice(0, 8).map((stamp, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 relative shadow-sm transition-all gap-1 ${stamp.status === 'PRESENT'
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
                    <span className="text-[8.5px] font-bold opacity-90 leading-none whitespace-nowrap select-none tracking-tight">
                      {stamp.sessionLabel}
                    </span>
                    <div className="flex items-center justify-center shrink-0 w-4 h-4">
                      {stamp.status === 'PRESENT' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      {stamp.status === 'LATE' && <span className="font-bold text-xs leading-none">R</span>}
                      {stamp.status === 'LATE_JUSTIFIED' && <span className="font-bold text-[10px] leading-none">RJ</span>}
                      {stamp.status === 'ABSENT' && <span className="font-bold text-xs leading-none">✗</span>}
                      {stamp.status === 'ABSENT_JUSTIFIED' && <span className="font-bold text-[10px] leading-none">FJ</span>}
                      {stamp.status === 'EMPTY' && <div className="w-2 h-2 rounded-full border border-current" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Botones de Acción: Enviar por WhatsApp y Descargar PNG */}
          <div className="w-full max-w-[340px] pt-1 space-y-2">
            <Button
              onClick={handleShareWhatsApp}
              disabled={isExporting}
              className="w-full bg-[#0D356A] hover:bg-[#09264D] text-white font-bold shadow-md gap-2 h-11 text-sm rounded-2xl transition-all cursor-pointer active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4 text-[#DE9927]" />
              {isExporting ? 'Preparando tarjeta y QR...' : 'Enviar por WhatsApp'}
            </Button>

            <Button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="w-full bg-[#DE9927] hover:bg-[#C8841B] text-white font-bold shadow-xs gap-2 h-10 text-xs rounded-xl cursor-pointer transition-all active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Generando...' : 'Descargar Tarjeta (PNG)'}
            </Button>

            <p className="text-[11px] text-center text-primary/60 pt-0.5 font-medium leading-relaxed">
              Al enviar por WhatsApp se comparten la tarjeta de sellos y el pase QR.
            </p>
          </div>

        </div>

        {/* Contenedor fuera de pantalla para renderizar y exportar el Pase QR */}
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: '0',
            width: '320px',
            pointerEvents: 'none',
            zIndex: -50,
          }}
          aria-hidden="true"
        >
          <div
            ref={qrPassRef}
            className="w-[320px] bg-primary text-primary-foreground rounded-2xl p-6 shadow-xl border-2 border-accent-gold flex flex-col items-center text-center space-y-4 relative overflow-hidden"
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {/* Fondo decorativo */}
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-accent-gold/20 rounded-full blur-xl pointer-events-none" />

            <div className="space-y-1 z-10">
              <span className="text-[10px] font-black tracking-widest text-accent-gold uppercase">
                MJVC EA's Jesús
              </span>
              <h4 className="text-lg font-bold text-primary-foreground leading-tight">
                {member.name}
              </h4>
              <p className="text-xs text-primary-foreground/70">
                {member.isAuxiliar ? 'Auxiliares' : (groupTitle || member.roleSubtitle)}
              </p>
            </div>

            {/* Código QR */}
            <div className="p-4 bg-white rounded-2xl shadow-inner border-2 border-accent-gold/30 z-10">
              <QRCodeSVG
                value={member.qrToken}
                size={180}
                level="H"
                includeMargin={false}
                fgColor="#0E387A"
              />
            </div>

            <p className="text-[9px] text-primary-foreground/50 z-10">
              Presenta este código para registrar tu llegada.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}