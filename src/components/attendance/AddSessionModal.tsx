'use client'

import { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AddSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (label: string, sessionDate: string) => void
}

export function AddSessionModal({ isOpen, onClose, onAdd }: AddSessionModalProps) {
  const [label, setLabel] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10))

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    onAdd(label.trim(), sessionDate)
    setLabel('')
    onClose()
  }

  // Pre-rellenar etiqueta sugerida al cambiar la fecha
  const handleDateChange = (dateVal: string) => {
    setSessionDate(dateVal)
    if (dateVal) {
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
      <div className="bg-card text-card-foreground w-full max-w-sm rounded-2xl shadow-2xl border border-border overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Calendar className="w-5 h-5 text-accent-gold" />
            <h3>Nueva Fecha de Sesión</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary">Fecha del Calendario</label>
            <input
              type="date"
              required
              value={sessionDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-primary/20 bg-background text-sm text-foreground outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary">Etiqueta de Encabezado (Ej: 09/Nov)</label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: 09/Nov"
              className="w-full h-10 px-3 rounded-lg border border-primary/20 bg-background text-sm text-foreground outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-md">
              Agregar Sesión
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
}

