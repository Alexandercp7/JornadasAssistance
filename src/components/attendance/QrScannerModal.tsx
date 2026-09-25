'use client'

import { useState, useRef, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { ArrowLeft, Sparkles, Check, QrCode } from 'lucide-react'
import { useAttendanceStore } from '@/store/useAttendanceStore'
import { useAuthStore } from '@/store/useAuthStore'

interface QrScannerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QrScannerModal({ isOpen, onClose }: QrScannerModalProps) {
  const { processQrScan, members } = useAttendanceStore()
  const { activeRole } = useAuthStore()

  const [scanResult, setScanResult] = useState<{
    success: boolean
    message: string
    memberName?: string
    memberRole?: string
    timestamp?: string
  } | null>(null)
  const [manualToken, setManualToken] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isOpen) {
      setScanResult(null)
      setManualToken('')
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setCameraActive(true)
        }
      }
    } catch (err) {
      console.warn('Cámara no disponible o permisos denegados:', err)
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const triggerSuccessCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#DE9927', '#0D356A', '#196E52', '#FFFFFF'],
    })

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }

  const handleProcessToken = async (token: string) => {
    if (!token.trim() || isProcessing) return
    setIsProcessing(true)

    // Buscar miembro correspondiente
    const targetMember = members.find((m) => m.qrToken === token.trim())

    const result = await processQrScan(token.trim(), undefined, activeRole || 'PREESCUELA')
    
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })

    setScanResult({
      ...result,
      memberName: targetMember?.name || (result.success ? 'Integrante MJVC' : undefined),
      memberRole: targetMember?.roleSubtitle || (targetMember?.isAuxiliar ? '★ AUXILIAR PREESCUELA' : 'INTEGRANTE'),
      timestamp: timeStr,
    })
    setIsProcessing(false)

    if (result.success) {
      triggerSuccessCelebration()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F6ECD9] text-[#0D356A] w-full max-w-sm rounded-3xl shadow-2xl border border-[#E5D5BC] overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Barra Superior estilo Mockup: ← Escanear Token QR */}
        <div className="bg-[#0D356A] text-white px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1 text-white hover:text-[#DE9927] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-[#DE9927]" />
          </button>
          <h3 className="font-bold text-base text-[#DE9927]">
            Escanear Token QR
          </h3>
        </div>

        {/* Contenido del Escáner */}
        <div className="p-4 sm:p-5 space-y-4 flex flex-col items-center overflow-y-auto">
          
          {/* Visor de Cámara con Marco de Escáner y Guías Doradas */}
          <div className="w-full aspect-square max-w-[260px] bg-[#091A30] rounded-3xl relative overflow-hidden border border-[#0D356A] shadow-inner flex items-center justify-center">
            {cameraActive ? (
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center text-white/70 space-y-2">
                <QrCode className="w-16 h-16 text-white/30" />
              </div>
            )}

            {/* Corner brackets dorados idénticos al mockup */}
            <div className="absolute inset-5 pointer-events-none flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-[3px] border-l-[3px] border-[#DE9927] rounded-tl-sm" />
                <div className="w-6 h-6 border-t-[3px] border-r-[3px] border-[#DE9927] rounded-tr-sm" />
              </div>
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#DE9927] to-transparent animate-pulse opacity-90" />
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-[3px] border-l-[3px] border-[#DE9927] rounded-bl-sm" />
                <div className="w-6 h-6 border-b-[3px] border-r-[3px] border-[#DE9927] rounded-br-sm" />
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#0D356A]/75 font-medium text-center">
            Apunta al código QR del auxiliar
          </p>

          {/* Tarjeta de Resultado de Escaneo estilo Mockup */}
          {scanResult && (
            <div
              className={`w-full p-4 rounded-2xl border-2 space-y-2.5 animate-in slide-in-from-bottom-2 duration-300 ${
                scanResult.success
                  ? 'bg-[#FAF3E7] border-[#DE9927]'
                  : 'bg-red-50 border-[#7A1E2C] text-[#7A1E2C]'
              }`}
            >
              {scanResult.success ? (
                <>
                  {/* Fila Superior: ✓ ESCANEO EXITOSO + Sparkle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#196E52] flex items-center gap-1 uppercase tracking-wide">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ESCANEO EXITOSO
                    </span>
                    <Sparkles className="w-4 h-4 text-[#DE9927]" />
                  </div>

                  {/* Fila Central: Letra Inicial Dorada + Nombre + Rol */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-8 h-8 rounded-full bg-[#DE9927]/20 text-[#C8841B] font-black text-sm flex items-center justify-center shrink-0">
                      {scanResult.memberName?.charAt(0) || 'M'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-[#0D356A] truncate">
                        {scanResult.memberName}
                      </h4>
                      <p className="text-[10px] font-bold text-[#DE9927] uppercase">
                        {scanResult.memberRole}
                      </p>
                    </div>
                  </div>

                  {/* Fila Inferior: ✓ Presente registrado + Hora */}
                  <div className="pt-2 border-t border-[#E5D5BC] flex items-center justify-between text-xs font-bold">
                    <span className="text-[#196E52] flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Presente registrado
                    </span>
                    <span className="text-[#0D356A]">
                      {scanResult.timestamp}
                    </span>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="font-bold text-xs">Error de Escaneo</p>
                  <p className="text-[11px] text-[#7A1E2C]/80">{scanResult.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Selector de Tokens para pruebas rápidas */}
          <div className="w-full space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-[#0D356A] block">
              Simular escaneo de integrante:
            </span>
            <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar pr-1">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleProcessToken(m.qrToken)}
                  disabled={isProcessing}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5D5BC] bg-[#FAF3E7] hover:border-[#DE9927] text-xs flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <span className="font-bold text-[#0D356A] truncate">{m.name}</span>
                  <span className="text-[10px] font-bold text-[#DE9927] shrink-0">
                    {m.isAuxiliar ? '★ Auxiliar' : 'Pase'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ingreso manual */}
          <div className="w-full flex gap-1.5 pt-2 border-t border-[#E5D5BC]">
            <input
              type="text"
              placeholder="Token manual..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="flex-1 h-9 px-3 rounded-xl border border-[#E5D5BC] bg-[#FAF3E7] text-xs outline-none focus:border-[#DE9927]"
            />
            <button
              onClick={() => handleProcessToken(manualToken)}
              disabled={!manualToken.trim() || isProcessing}
              className="bg-[#0D356A] hover:bg-[#09264D] text-white font-bold text-xs px-3 rounded-xl transition-colors cursor-pointer"
            >
              Marcar
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}


