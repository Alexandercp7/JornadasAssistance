'use client'

import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import { X, Download, QrCode, Star, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemberItem } from '@/store/useAttendanceStore'

interface QrPassModalProps {
  isOpen: boolean
  onClose: () => void
  member: MemberItem | null
}

export function QrPassModal({ isOpen, onClose, member }: QrPassModalProps) {
  const passRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !member) return null

  const handleDownload = async () => {
    if (passRef.current) {
      try {
        const dataUrl = await toPng(passRef.current, { cacheBust: true, pixelRatio: 3 })
        const link = document.createElement('a')
        link.download = `Pase_QR_${member.name.replace(/\s+/g, '_')}.png`
        link.href = dataUrl
        link.click()
      } catch (err) {
        console.error('Error al exportar pase QR:', err)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground w-full max-w-sm rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col items-center">
        
        {/* Barra superior */}
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
          <span className="text-sm font-bold text-primary flex items-center gap-2">
            <QrCode className="w-4 h-4 text-accent-gold" /> Pase Digital QR
          </span>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tarjeta del Pase QR Exportable */}
        <div className="p-6 w-full flex flex-col items-center">
          <div
            ref={passRef}
            className="w-full bg-primary text-primary-foreground rounded-2xl p-6 shadow-xl border-2 border-accent-gold flex flex-col items-center text-center space-y-4 relative overflow-hidden"
          >
            {/* Fondo decorativo */}
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-accent-gold/20 rounded-full blur-xl pointer-events-none" />

            <div className="space-y-1 z-10">
              <span className="text-[10px] font-black tracking-widest text-accent-gold uppercase">MJVC EA's Jesús</span>
              <h4 className="text-lg font-bold text-primary-foreground leading-tight">{member.name}</h4>
              <p className="text-xs text-primary-foreground/70">{member.roleSubtitle}</p>
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

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent-gold z-10 bg-primary-foreground/10 px-3 py-1 rounded-full border border-accent-gold/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Token: {member.qrToken.slice(0, 14)}...</span>
            </div>

            <p className="text-[9px] text-primary-foreground/50 z-10">
              Presenta este código al coordinador para registrar tu llegada instantánea.
            </p>
          </div>

          {/* Botón de Descarga */}
          <div className="w-full pt-6 flex flex-col gap-2">
            <Button
              onClick={handleDownload}
              className="w-full bg-accent-gold text-primary hover:bg-accent-gold/90 font-bold shadow-md gap-2"
            >
              <Download className="w-4 h-4" /> Descargar Pase (PNG)
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

