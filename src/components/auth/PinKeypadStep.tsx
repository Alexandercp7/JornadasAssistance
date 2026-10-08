'use client'

import { Lock, Loader2, ArrowLeft } from 'lucide-react'
import { Role } from '@/store/useAuthStore'

interface PinKeypadStepProps {
  selectedRole: Role
  pin: string
  error: boolean
  isLoading: boolean
  onInputDigit: (num: string) => void
  onDeleteDigit: () => void
  onCancel: () => void
}

export function PinKeypadStep({
  selectedRole,
  pin,
  error,
  isLoading,
  onInputDigit,
  onDeleteDigit,
  onCancel,
}: PinKeypadStepProps) {
  return (
    <>
      {/* Barra superior con botón para cambiar perfil */}
      <header className="bg-primary px-4 py-3 flex items-center justify-between shadow-md animate-in slide-in-from-top-4 duration-300 w-full fixed top-0 left-0 z-30">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-primary-foreground text-xs font-bold hover:opacity-80 transition-opacity cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Cambiar Perfil
        </button>
        <div className="flex items-center gap-2">
          <span className="text-primary-foreground font-black text-sm tracking-wide">
            MJVC EA's Jesús
          </span>
        </div>
      </header>

      <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center pt-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary text-accent-gold flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-primary">
            {selectedRole === 'PREESCUELA' ? 'Coord. Preescuela' : 'Coord. Escuela'}
          </h2>
          <p className="text-xs text-primary/70 mt-1">
            Ingrese su PIN de seguridad de 4 dígitos
          </p>
        </div>

        {/* Indicadores de PIN (Dots) */}
        <div className="flex gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > index
                  ? 'bg-accent-gold border-accent-gold scale-110 shadow-sm'
                  : 'border-primary/30 bg-transparent'
              } ${error ? 'border-status-absent bg-status-absent/20' : ''}`}
            />
          ))}
        </div>

        {/* Mensaje de Error / Cargando */}
        {error && (
          <p className="text-xs font-bold text-status-absent mb-4 animate-shake">
            PIN incorrecto. Intente nuevamente.
          </p>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-bold text-primary mb-4">
            <Loader2 className="w-4 h-4 animate-spin text-accent-gold" />
            <span>Verificando credenciales...</span>
          </div>
        )}

        {/* Teclado Numérico */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => onInputDigit(num)}
              disabled={isLoading}
              className="h-14 rounded-2xl bg-card border border-border shadow-sm text-xl font-bold text-primary active:bg-[#E3A336] active:border-[#E3A336] active:text-white active:scale-95 transition-all duration-150 active:duration-75 outline-none select-none cursor-pointer"
            >
              {num}
            </button>
          ))}

          <button
            onClick={onCancel}
            disabled={isLoading}
            className="h-14 rounded-2xl text-xs font-bold text-primary/60 hover:bg-primary/5 transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={() => onInputDigit('0')}
            disabled={isLoading}
            className="h-14 rounded-2xl bg-card border border-border shadow-sm text-xl font-bold text-primary active:bg-[#E3A336] active:border-[#E3A336] active:text-white active:scale-95 transition-all duration-150 active:duration-75 outline-none select-none cursor-pointer"
          >
            0
          </button>

          <button
            onClick={onDeleteDigit}
            disabled={isLoading}
            className="h-14 rounded-2xl bg-card border border-border shadow-sm text-sm font-bold text-status-absent hover:bg-status-absent/10 active:scale-95 transition-all outline-none cursor-pointer"
          >
            Borrar
          </button>
        </div>
      </div>
    </>
  )
}
