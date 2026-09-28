'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'
import jsQR from 'jsqr'
import {
  ArrowLeft,
  Sparkles,
  Check,
  QrCode,
  SwitchCamera,
  Zap,
  ZapOff,
  AlertCircle,
  RotateCcw,
  Calendar,
} from 'lucide-react'
import { useAttendanceStore } from '@/store/useAttendanceStore'
import { useAuthStore } from '@/store/useAuthStore'

interface QrScannerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QrScannerModal({ isOpen, onClose }: QrScannerModalProps) {
  const { processQrScan, members, sessions } = useAttendanceStore()
  const { activeRole } = useAuthStore()

  // Sesión objetivo (por defecto la más reciente)
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')

  // Estados de escaneo
  const [scanResult, setScanResult] = useState<{
    success: boolean
    message: string
    memberName?: string
    memberRole?: string
    timestamp?: string
    sessionLabel?: string
    isWarning?: boolean
  } | null>(null)
  const [manualToken, setManualToken] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)

  // Referencias DOM y procesamiento
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const lastScanTimeRef = useRef<number>(0)
  const cooldownRef = useRef<{ token: string; time: number } | null>(null)
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Inicializar sesión seleccionada con la última disponible
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setSelectedSessionId(sessions[sessions.length - 1].id)
    }
  }, [sessions])

  // Detectar soporte para múltiples cámaras
  useEffect(() => {
    if (navigator?.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter((d) => d.kind === 'videoinput')
          setHasMultipleCameras(videoDevices.length > 1)
        })
        .catch(() => {
          setHasMultipleCameras(false)
        })
    }
  }, [])

  // Reproducir un sonido agradable de confirmación sin dependencias externas (Web Audio API)
  const playSuccessChime = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      // Doble tono ascendente (880Hz -> 1760Hz)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.08)

      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.29)
    } catch {
      // Ignorar si el navegador bloquea audio sin interacción previa
    }
  }, [])

  // Celebración visual y háptica
  const triggerCelebration = useCallback(() => {
    playSuccessChime()

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#DE9927', '#0D356A', '#196E52', '#F6ECD9'],
    })

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([80, 40, 80])
      } catch {
        // Ignorar si no está soportado
      }
    }
  }, [playSuccessChime])

  // Detener cámara y bucle de escaneo
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => {
        track.stop()
      })
      videoRef.current.srcObject = null
    }

    setCameraActive(false)
    setIsTorchOn(false)
    setTorchSupported(false)
  }, [])

  // Procesar Token QR
  const handleProcessToken = useCallback(
    async (token: string) => {
      const cleaned = token.trim()
      if (!cleaned || isProcessing) return

      // Prevenir re-escaneos inmediatos del mismo token en 3 segundos
      const nowMs = Date.now()
      if (
        cooldownRef.current &&
        cooldownRef.current.token === cleaned &&
        nowMs - cooldownRef.current.time < 3000
      ) {
        return
      }
      cooldownRef.current = { token: cleaned, time: nowMs }

      setIsProcessing(true)

      const targetMember = members.find((m) => m.qrToken === cleaned || m.id === cleaned)
      const result = await processQrScan(
        cleaned,
        selectedSessionId || undefined,
        activeRole || 'PREESCUELA',
      )

      const now = new Date()
      const timeStr = now.toLocaleTimeString('es-MX', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const isWarning = result.message?.toLowerCase().includes('justificado')

      setScanResult({
        success: result.success,
        isWarning,
        message: result.message,
        memberName:
          result.memberName || targetMember?.name || (result.success ? 'Integrante MJVC' : undefined),
        memberRole:
          result.memberRole ||
          targetMember?.roleSubtitle ||
          (targetMember?.isAuxiliar ? '★ AUXILIAR PREESCUELA' : 'INTEGRANTE'),
        timestamp: timeStr,
        sessionLabel: result.sessionLabel,
      })

      setIsProcessing(false)

      if (result.success) {
        triggerCelebration()

        // Auto-limpiar resultado después de 4.5 segundos para permitir escaneo continuo
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
        resetTimerRef.current = setTimeout(() => {
          setScanResult(null)
        }, 4500)
      }
    },
    [isProcessing, members, processQrScan, selectedSessionId, activeRole, triggerCelebration],
  )

  // Bucle de lectura de frames en tiempo real
  const scanLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const now = performance.now()
      // Analizar frame cada ~100ms para alta precisión y bajo uso de CPU
      if (now - lastScanTimeRef.current >= 100) {
        lastScanTimeRef.current = now

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d', { willReadFrequently: true })

        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          })

          if (code && code.data && code.data.trim()) {
            handleProcessToken(code.data.trim())
          }
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanLoop)
  }, [handleProcessToken])

  // Iniciar cámara con permisos y configuración adecuada
  const startCamera = useCallback(async () => {
    setCameraError(null)
    stopCamera()

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)

        // Verificar soporte para linterna
        const track = stream.getVideoTracks()[0]
        if (track && typeof track.getCapabilities === 'function') {
          const capabilities = track.getCapabilities() as { torch?: boolean }
          setTorchSupported(!!capabilities.torch)
        }

        // Iniciar bucle de escaneo
        animFrameRef.current = requestAnimationFrame(scanLoop)
      }
    } catch (err: unknown) {
      console.warn('Error al iniciar cámara:', err)
      const errorMsg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Permiso denegado. Permite el acceso a la cámara en tu navegador.'
          : 'No se pudo acceder a la cámara. Usa la opción de subir imagen o simular.'
      setCameraError(errorMsg)
      setCameraActive(false)
    }
  }, [facingMode, scanLoop, stopCamera])

  // Alternar cámara (Trasera / Frontal)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  // Alternar Linterna
  const toggleTorch = async () => {
    if (!videoRef.current?.srcObject) return
    const stream = videoRef.current.srcObject as MediaStream
    const track = stream.getVideoTracks()[0]
    if (track) {
      try {
        const nextState = !isTorchOn
        await (track as MediaStreamTrack & {
          applyConstraints: (c: unknown) => Promise<void>
        }).applyConstraints({
          advanced: [{ torch: nextState }],
        })
        setIsTorchOn(nextState)
      } catch (e) {
        console.warn('No se pudo cambiar el estado de la linterna', e)
      }
    }
  }

  // Efecto cuando se abre o cierra el modal
  useEffect(() => {
    if (isOpen) {
      setScanResult(null)
      setManualToken('')
      startCamera()
    } else {
      stopCamera()
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }

    return () => {
      stopCamera()
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [isOpen, startCamera, stopCamera])

  // Reiniciar cámara cuando cambia facingMode
  useEffect(() => {
    if (isOpen && cameraActive) {
      startCamera()
    }
  }, [facingMode])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Canvas oculto para decodificación */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-[#F6ECD9] text-[#0D356A] w-full max-w-sm rounded-3xl shadow-2xl border border-[#E5D5BC] overflow-hidden flex flex-col max-h-[95vh]">
        {/* Barra Superior */}
        <div className="bg-[#0D356A] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-1 text-white hover:text-[#DE9927] transition-colors cursor-pointer"
              title="Cerrar Escáner"
            >
              <ArrowLeft className="w-5 h-5 text-[#DE9927]" />
            </button>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#DE9927] flex items-center gap-1.5 leading-tight">
                <QrCode className="w-4 h-4 text-[#DE9927]" />
                Escanear Token QR
              </h3>
              <p className="text-[10px] text-white/70">MJVC EA's Jesús</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Linterna si está soportada */}
            {torchSupported && cameraActive && (
              <button
                onClick={toggleTorch}
                className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  isTorchOn ? 'bg-[#DE9927] text-[#0D356A]' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={isTorchOn ? 'Apagar Linterna' : 'Encender Linterna'}
              >
                {isTorchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}

            {/* Alternar Cámara (trasera / frontal) */}
            {hasMultipleCameras && cameraActive && (
              <button
                onClick={toggleFacingMode}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                title="Cambiar Cámara"
              >
                <SwitchCamera className="w-4 h-4 text-[#DE9927]" />
              </button>
            )}
          </div>
        </div>

        {/* Contenido del Escáner */}
        <div className="p-4 sm:p-5 space-y-4 flex flex-col items-center overflow-y-auto">
          {/* Selector de Sesión de Registro */}
          {sessions && sessions.length > 0 && (
            <div className="w-full flex items-center justify-between bg-[#FAF3E7] px-3 py-1.5 rounded-xl border border-[#E5D5BC] text-xs">
              <span className="font-bold text-[#0D356A] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#DE9927]" />
                Sesión:
              </span>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="bg-transparent font-bold text-[#0D356A] outline-none cursor-pointer text-xs"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({new Date(s.sessionDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Visor de Cámara con Marco de Escáner y Animación Láser */}
          <div className="w-full aspect-square max-w-[260px] bg-[#091A30] rounded-3xl relative overflow-hidden border border-[#0D356A] shadow-inner flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center text-white/70 space-y-2">
                {cameraError ? (
                  <>
                    <AlertCircle className="w-10 h-10 text-amber-400" />
                    <p className="text-xs text-amber-200">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="mt-2 px-3 py-1 bg-[#DE9927] text-[#0D356A] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reintentar
                    </button>
                  </>
                ) : (
                  <>
                    <QrCode className="w-14 h-14 text-white/30 animate-pulse" />
                    <p className="text-xs text-white/60">Iniciando cámara...</p>
                  </>
                )}
              </div>
            )}

            {/* Guías doradas de encuadre */}
            <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-[3px] border-l-[3px] border-[#DE9927] rounded-tl-sm" />
                <div className="w-6 h-6 border-t-[3px] border-r-[3px] border-[#DE9927] rounded-tr-sm" />
              </div>

              {/* Láser de escaneo animado en tiempo real */}
              {cameraActive && (
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#DE9927] to-transparent shadow-[0_0_8px_#DE9927] animate-pulse" />
              )}

              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-[3px] border-l-[3px] border-[#DE9927] rounded-bl-sm" />
                <div className="w-6 h-6 border-b-[3px] border-r-[3px] border-[#DE9927] rounded-br-sm" />
              </div>
            </div>

            {/* Indicador de procesamiento */}
            {isProcessing && (
              <div className="absolute inset-0 bg-[#0D356A]/70 flex items-center justify-center backdrop-blur-xs">
                <div className="flex items-center gap-2 bg-[#DE9927] text-[#0D356A] font-black text-xs px-3 py-1.5 rounded-full shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta de Resultado de Escaneo: Se muestra debajo del visor al escanear correctamente */}
          {scanResult && (
            <div
              className={`w-full p-4 rounded-2xl border-2 space-y-2.5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 shadow-md ${
                scanResult.success
                  ? 'bg-[#FAF3E7] border-[#DE9927]'
                  : scanResult.isWarning
                    ? 'bg-amber-50 border-amber-400 text-amber-900'
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
                    <Sparkles className="w-4 h-4 text-[#DE9927] animate-bounce" />
                  </div>

                  {/* Fila Central: Letra Inicial Dorada + Nombre del Auxiliar / Integrante + Rol */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-full bg-[#DE9927]/20 border border-[#DE9927]/40 text-[#C8841B] font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                      {scanResult.memberName?.charAt(0) || 'M'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm sm:text-base text-[#0D356A] leading-snug truncate">
                        {scanResult.memberName}
                      </h4>
                      <p className="text-[11px] font-bold text-[#DE9927] uppercase tracking-wide">
                        {scanResult.memberRole}
                      </p>
                    </div>
                  </div>

                  {/* Fila Inferior: ✓ Presente registrado + Hora y Sesión */}
                  <div className="pt-2 border-t border-[#E5D5BC] flex items-center justify-between text-xs font-bold">
                    <span className="text-[#196E52] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Presente registrado
                    </span>
                    <span className="text-[#0D356A] text-[11px] font-semibold">
                      {scanResult.timestamp}
                    </span>
                  </div>

                  {/* Botón para continuar rápido */}
                  <button
                    onClick={() => setScanResult(null)}
                    className="w-full mt-1 py-1 text-center font-bold text-xs text-[#DE9927] hover:underline cursor-pointer"
                  >
                    Escanear siguiente integrante →
                  </button>
                </>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{scanResult.isWarning ? 'Atención' : 'Error de Escaneo'}</span>
                    <button
                      onClick={() => setScanResult(null)}
                      className="text-[11px] text-[#0D356A] hover:underline cursor-pointer"
                    >
                      Cerrar aviso
                    </button>
                  </div>
                  <p className="text-xs leading-tight opacity-90">{scanResult.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Ingreso manual por Token o Código */}
          <div className="w-full flex gap-1.5 pt-2 border-t border-[#E5D5BC]">
            <input
              type="text"
              placeholder="Ingresar token o ID manual..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleProcessToken(manualToken)
              }}
              className="flex-1 h-9 px-3 rounded-xl border border-[#E5D5BC] bg-[#FAF3E7] text-xs outline-none focus:border-[#DE9927]"
            />
            <button
              onClick={() => handleProcessToken(manualToken)}
              disabled={!manualToken.trim() || isProcessing}
              className="bg-[#0D356A] hover:bg-[#09264D] disabled:opacity-50 text-white font-bold text-xs px-3.5 rounded-xl transition-colors cursor-pointer"
            >
              Marcar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
