'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { School, XCircle, Lock, ShieldCheck, Sparkles, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuthStore, Role } from '@/store/useAuthStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setPin('')
    setError(false)
  }

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num
      setPin(nextPin)
      setError(false)
      if (nextPin.length === 4) {
        verifyPin(nextPin)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError(false)
  }

  const verifyPin = async (inputPin: string) => {
    setIsLoading(true)
    setError(false)
    try {
      const isValid = await login(selectedRole, inputPin)
      if (isValid) {
        router.push('/dashboard')
      } else {
        setError(true)
        setPin('')
      }
    } catch {
      setError(true)
      setPin('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] flex flex-col bg-background text-foreground transition-colors">

      {/* Barra superior fija al seleccionar perfil */}
      {selectedRole && (
        <header className="bg-primary px-4 py-3 flex items-center justify-between shadow-md animate-in slide-in-from-top-4 duration-300">
          <button
            onClick={() => setSelectedRole(null)}
            className="flex items-center gap-2 text-primary-foreground text-xs font-bold hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" /> Cambiar Perfil
          </button>
          <div className="flex items-center gap-2">
            <span className="text-primary-foreground font-black text-sm tracking-wide">MJVC EA's Jesús</span>
          </div>
        </header>
      )}

      <div
        className={`flex-1 flex flex-col items-center justify-center p-4 sm:p-6 ${selectedRole ? 'justify-start pt-8' : ''
          }`}
      >
        <div className="w-full max-w-sm space-y-6">

          {/* PASO 1: SELECCIÓN DE PERFIL */}
          {!selectedRole && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Logo y Encabezado */}
              <div className="text-center flex flex-col items-center mb-8">
                <div className="relative w-24 h-24 mb-4 rounded-full shadow-[0_10px_25px_rgba(14,56,122,0.25)] border-2 border-accent-gold p-1 bg-white">
                  <Image src="/logo.png" alt="Logo MJVC" fill className="object-cover rounded-full" priority />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">MJVC EA's Jesús</h1>
                <p className="text-xs text-accent-gold font-bold tracking-widest mt-1">SISTEMA DE ASISTENCIA PRIVADO</p>
              </div>

              <div className="mb-5">
                <h2 className="text-xl font-bold text-primary mb-1">Selección de Perfil</h2>
                <p className="text-xs text-primary/70 leading-relaxed">
                  Ingrese con las credenciales asignadas para su coordinación.
                </p>
              </div>

              {/* Tarjetas de Selección de Perfil */}
              <div className="space-y-3">

                {/* Coordinación Preescuela */}
                <Card
                  className="p-4 border-2 border-accent-gold cursor-pointer bg-card hover:bg-accent-gold/5 transition-all shadow-md rounded-2xl group"
                  onClick={() => handleRoleSelect('PREESCUELA')}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-6 h-6 text-accent-gold" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-primary mb-0.5">Coordinación Preescuela</h3>
                      <p className="text-xs text-primary/70 leading-snug">
                        Asistencias, auxiliares y sellos de preescuela.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Coordinación Escuela */}
                <Card
                  className="p-4 border border-primary/20 cursor-pointer bg-card hover:bg-primary/5 transition-all shadow-sm rounded-2xl group"
                  onClick={() => handleRoleSelect('ESCUELA')}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                      <School className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-primary mb-0.5">Coordinación Escuela</h3>
                      <p className="text-xs text-primary/70 leading-snug">
                        Asistencias, auxiliares y sellos de escuela.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* PASO 2: INGRESO DE PIN */}
          {selectedRole && (
            <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center">

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary text-accent-gold flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-primary">
                  {selectedRole === 'PREESCUELA' ? 'Coord. Preescuela' : 'Coord. Escuela'}
                </h2>
                <p className="text-xs text-primary/70 mt-1">Ingrese su PIN de seguridad de 4 dígitos</p>
              </div>

              {/* Indicadores de PIN (Dots) */}
              <div className="flex gap-4 mb-6">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${pin.length > index
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
                    onClick={() => handlePinInput(num)}
                    disabled={isLoading}
                    className="h-14 rounded-2xl bg-card border border-border shadow-sm text-xl font-bold text-primary active:bg-[#E3A336] active:border-[#E3A336] active:text-white active:scale-95 transition-all duration-150 active:duration-75 outline-none select-none"
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => setSelectedRole(null)}
                  disabled={isLoading}
                  className="h-14 rounded-2xl text-xs font-bold text-primary/60 hover:bg-primary/5 transition-all"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => handlePinInput('0')}
                  disabled={isLoading}
                  className="h-14 rounded-2xl bg-card border border-border shadow-sm text-xl font-bold text-primary active:bg-[#E3A336] active:border-[#E3A336] active:text-white active:scale-95 transition-all duration-150 active:duration-75 outline-none select-none"
                >
                  0
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="h-14 rounded-2xl bg-card border border-border shadow-sm text-sm font-bold text-status-absent hover:bg-status-absent/10 active:scale-95 transition-all outline-none"
                >
                  Borrar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}