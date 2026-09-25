'use client'

import { useState, useEffect } from 'react'
import { X, Star, Upload, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemberItem } from '@/store/useAttendanceStore'

interface MemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; isAuxiliar: boolean; roleSubtitle: string; avatarUrl?: string | null }) => void
  onDelete?: (id: string) => void
  memberToEdit?: MemberItem | null
  groupTitle?: string
}

export function MemberModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  memberToEdit,
  groupTitle = 'Preescuela',
}: MemberModalProps) {
  const [name, setName] = useState('')
  const [isAuxiliar, setIsAuxiliar] = useState(false)
  const [roleSubtitle, setRoleSubtitle] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name)
      setIsAuxiliar(memberToEdit.isAuxiliar)
      setRoleSubtitle(memberToEdit.roleSubtitle || (memberToEdit.isAuxiliar ? 'Auxiliares y Guías' : 'Integrantes'))
      setAvatarUrl(memberToEdit.avatarUrl || null)
    } else {
      setName('')
      setIsAuxiliar(false)
      setRoleSubtitle(`Integrantes - ${groupTitle}`)
      setAvatarUrl(null)
    }
  }, [memberToEdit, isOpen, groupTitle])

  if (!isOpen) return null

  const handleAuxiliarToggle = (checked: boolean) => {
    setIsAuxiliar(checked)
    if (checked) {
      setRoleSubtitle(`Auxiliares y Guías - ${groupTitle}`)
    } else {
      setRoleSubtitle(`Integrantes - ${groupTitle}`)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      isAuxiliar,
      roleSubtitle: roleSubtitle.trim() || (isAuxiliar ? 'Auxiliares y Guías' : 'Integrantes'),
      avatarUrl,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
          <h3 className="font-bold text-lg text-primary">
            {memberToEdit ? 'Editar Integrante' : 'Nuevo Integrante'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Foto de perfil */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-accent-gold overflow-hidden bg-primary/10 flex items-center justify-center relative shadow-sm shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary/40" />
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-primary block">Foto de Perfil</label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-xs font-medium text-primary hover:bg-primary/10 cursor-pointer transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5 text-accent-gold" />
                <span>{avatarUrl ? 'Cambiar Foto' : 'Subir Foto'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className="text-[11px] text-status-absent hover:underline block ml-1"
                >
                  Quitar foto
                </button>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary">Nombre Completo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sofía Rodríguez"
              className="w-full h-10 px-3 rounded-lg border border-primary/20 bg-background text-sm text-foreground outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all"
            />
          </div>

          {/* Switch / Checkbox Auxiliar */}
          <div
            onClick={() => handleAuxiliarToggle(!isAuxiliar)}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
              isAuxiliar
                ? 'bg-accent-gold/10 border-accent-gold text-primary'
                : 'bg-primary/[0.02] border-border text-primary/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className={`w-5 h-5 ${isAuxiliar ? 'fill-accent-gold text-accent-gold' : 'text-primary/40'}`} />
              <div>
                <p className="text-sm font-bold text-primary">Distintivo de Guía / Auxiliar</p>
                <p className="text-xs text-primary/60">Resalta con insignia dorada y genera pase QR</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAuxiliar}
              onChange={(e) => handleAuxiliarToggle(e.target.checked)}
              className="w-4 h-4 accent-accent-gold cursor-pointer"
            />
          </div>

          {/* Subtítulo / Rol */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary">Subtítulo / Etiqueta</label>
            <input
              type="text"
              value={roleSubtitle}
              onChange={(e) => setRoleSubtitle(e.target.value)}
              placeholder="Ej: Auxiliares y Guías - Preescuela"
              className="w-full h-10 px-3 rounded-lg border border-primary/20 bg-background text-sm text-foreground outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            {memberToEdit && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (confirm(`¿Estás seguro de eliminar a ${memberToEdit.name}?`)) {
                    onDelete(memberToEdit.id)
                    onClose()
                  }
                }}
                className="text-status-absent hover:bg-status-absent/10 hover:text-status-absent text-xs gap-1"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-md">
                {memberToEdit ? 'Guardar Cambios' : 'Agregar Integrante'}
              </Button>
            </div>
          </div>
        </form>

      </div>
    </div>
  )
}

