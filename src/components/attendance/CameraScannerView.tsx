'use client'

import React from 'react'
import { QrCode, AlertCircle, RotateCcw, Sparkles } from 'lucide-react'

interface CameraScannerViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  cameraActive: boolean
  cameraError: string | null
  isProcessing: boolean
  onRetryCamera: () => void
}

export function CameraScannerView({
  videoRef,
  cameraActive,
  cameraError,
  isProcessing,
  onRetryCamera,
}: CameraScannerViewProps) {
  return (
    <div className="w-full aspect-square max-w-[260px] shrink-0 bg-[#091A30] rounded-3xl relative overflow-hidden border border-[#0D356A] shadow-inner flex items-center justify-center">
      {/* El elemento video SIEMPRE debe estar en el DOM para que videoRef.current no sea null */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          cameraActive ? 'opacity-100' : 'opacity-0 absolute inset-0'
        }`}
        playsInline
        muted
        autoPlay
      />

      {/* Pantalla de carga o error mientras la cámara se inicializa */}
      {!cameraActive && (
        <div className="flex flex-col items-center justify-center p-4 text-center text-white/70 space-y-2 z-10">
          {cameraError ? (
            <>
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-xs text-amber-200">{cameraError}</p>
              <button
                onClick={onRetryCamera}
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
  )
}
