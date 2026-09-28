'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SessionItem } from '@/store/useAttendanceStore'

interface AddSessionModalProps {
  isOpen: boolean
  onClose: () => void
  sessionToEdit?: SessionItem | null
  onAdd?: (label: string, sessionDate: string, isLate: boolean) => void
  onUpdate?: (sessionId: string, data: { label: string; sessionDate: string; isLate: boolean }) => void
  onDelete?: (sessionId: string) => void
  canDelete?: boolean
}

export function AddSessionModal({
  isOpen,
  onClose,
  sessionToEdit,
  onAdd,
  onUpdate,
  onDelete,
  canDelete = false,
}: AddSessionModalProps) {
  const [label, setLabel] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10))
  const [isLate, setIsLate] = useState(false)

  // Sincronizar estado cuando se abre o cambia la sesión a editar
  useEffect(() => {
    if (sessionToEdit) {
      setLabel(sessionToEdit.label || '')
      try {
        if (sessionToEdit.sessionDate) {
          const raw = String(sessionToEdit.sessionDate)
          if (raw.length >= 10 && raw.includes('-')) {
            setSessionDate(raw.slice(0, 10))
          } else {
            const d = new Date(sessionToEdit.sessionDate)
            const y = d.getUTCFullYear()
            const m = String(d.getUTCMonth() + 1).padStart(2, '0')
            const day = String(d.getUTCDate()).padStart(2, '0')
            setSessionDate(`${y}-${m}-${day}`)
          }
        }
      } catch {
        setSessionDate(new Date().toISOString().slice(0, 10))
      }
      setIsLate(Boolean(sessionToEdit.isLate))
    } else {
      const now = new Date()
      const localYear = now.getFullYear()
      const localMonth = String(now.getMonth() + 1).padStart(2, '0')
      const localDay = String(now.getDate()).padStart(2, '0')
      const todayStr = `${localYear}-${localMonth}-${localDay}`
      setSessionDate(todayStr)
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const day = now.getDate().toString().padStart(2, '0')
      setLabel(`${day}/${months[now.getMonth()]}`)
      setIsLate(false)
    }
  }, [sessionToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return

    if (sessionToEdit && onUpdate) {
      onUpdate(sessionToEdit.id, {
        label: label.trim(),
        sessionDate,
        isLate,
      })
    } else if (onAdd) {
      onAdd(label.trim(), sessionDate, isLate)
    }

    onClose()
  }

  // Pre-rellenar etiqueta sugerida al cambiar la fecha en modo nueva sesión
  const handleDateChange = (dateVal: string) => {
    setSessionDate(dateVal)
    if (!sessionToEdit && dateVal) {
      const parts = dateVal.split('-')
      if (parts.length === 3) {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const day = parts[2]
        const monthIdx = parseInt(parts[1], 10) - 1
        setLabel(`${day}/${months[monthIdx] || parts[1]}`)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF3E7] text-[#0D356A] w-full max-w-sm rounded-3xl shadow-2xl border border-[#E5D5BC] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5D5BC] bg-[#0D356A] text-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#DE9927]" />
            <h3 className="font-bold text-sm sm:text-base text-[#F6ECD9]">
              {sessionToEdit ? 'Configurar Fecha de Sesión' : 'Nueva Fecha de Sesión'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0D356A]">Fecha del Calendario</label>
            <input
              type="date"
              required
              value={sessionDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E5D5BC] bg-white text-sm text-[#0D356A] outline-none focus:border-[#DE9927] focus:ring-1 focus:ring-[#DE9927] transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0D356A]">Etiqueta de Encabezado (Ej: 09/Nov)</label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: 09/Nov"
              className="w-full h-10 px-3 rounded-xl border border-[#E5D5BC] bg-white text-sm text-[#0D356A] outline-none focus:border-[#DE9927] focus:ring-1 focus:ring-[#DE9927] transition-all font-medium"
            />
          </div>

          {/* Switch de Modo Retardo */}
          <div className="p-3.5 rounded-2xl border border-[#DE9927]/40 bg-white/70 space-y-2">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setIsLate(!isLate)}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl transition-colors ${isLate ? 'bg-[#DE9927] text-white shadow-xs' : 'bg-[#0D356A]/10 text-[#0D356A]'
                    }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0D356A] block">
                    Modo Retardo
                  </span>
                </div>
              </div>

              {/* Botón Switch Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={isLate}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLate(!isLate)
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isLate ? 'bg-[#DE9927]' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isLate ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E5D5BC]">
            {sessionToEdit && canDelete && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Eliminar la fecha de sesión ${sessionToEdit.label}?`)) {
                    onDelete(sessionToEdit.id)
                    onClose()
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer py-1"
                title="Eliminar sesión"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar fecha</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="text-xs border-[#E5D5BC] text-[#0D356A] hover:bg-[#FAF3E7] cursor-pointer rounded-xl px-4"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#0D356A] hover:bg-[#09264D] text-white text-xs font-bold shadow-md cursor-pointer rounded-xl px-4"
              >
                {sessionToEdit ? 'Guardar Cambios' : 'Agregar Sesión'}
              </Button>
            </div>
          </div>
        </form>

      </div>
    </div>
  )
}
