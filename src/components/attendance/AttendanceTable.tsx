'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Star,
  Plus,
  Calendar,
} from 'lucide-react'
import { InteractiveStamp, AttendanceStatus } from './InteractiveStamp'
import { LoyaltyCardModal } from '@/components/export/LoyaltyCardModal'
import { MemberModal } from './MemberModal'
import { AddSessionModal } from './AddSessionModal'
import { QrPassModal } from './QrPassModal'
import { useAttendanceStore, MemberItem } from '@/store/useAttendanceStore'
import { useAuthStore } from '@/store/useAuthStore'

export function AttendanceTable() {
  const {
    members,
    sessions,
    markAttendance,
    addMember,
    updateMember,
    deleteMember,
    addSession,
    deleteSession,
  } = useAttendanceStore()

  const { activeRole, customTitle, groupId } = useAuthStore()

  // Estados de Modales
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<MemberItem | null>(null)
  const [selectedMemberForQr, setSelectedMemberForQr] = useState<MemberItem | null>(null)
  const [memberToEdit, setMemberToEdit] = useState<MemberItem | null>(null)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)

  // Referencia para auto-scroll del contenedor de la tabla
  const tableContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = tableContainerRef.current.scrollWidth
    }
  }, [sessions])

  // Manejador para guardar miembro (Crear o Editar)
  const handleSaveMember = (data: {
    name: string
    isAuxiliar: boolean
    roleSubtitle: string
    avatarUrl?: string | null
  }) => {
    if (memberToEdit) {
      updateMember(memberToEdit.id, data)
    } else {
      addMember({
        groupId: groupId || 'grp_preescuela',
        ...data,
      })
    }
    setMemberToEdit(null)
  }

  // Obtener letra inicial para avatar estilo mockup
  const getInitial = (name: string) => {
    return name.trim().charAt(0).toUpperCase() || 'M'
  }

  // Separar día encima del mes sin "/"
  const parseSessionHeader = (label: string, sessionDate?: string) => {
    if (label && label.includes('/')) {
      const [dayPart, ...monthParts] = label.split('/')
      return { day: dayPart.trim(), month: monthParts.join('').trim() }
    }
    const match = label?.trim().match(/^(\d+)\s*[-_ /]?\s*([a-zA-ZáéíóúÁÉÍÓÚ]+)$/)
    if (match) {
      return { day: match[1], month: match[2] }
    }
    if (sessionDate) {
      try {
        const d = new Date(sessionDate)
        if (!isNaN(d.getTime())) {
          const day = d.getUTCDate().toString().padStart(2, '0')
          const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
          const month = months[d.getUTCMonth()]
          return { day, month }
        }
      } catch {
        // Fallback below
      }
    }
    return { day: label, month: '' }
  }

  return (
    <div className="space-y-4">

      {/* Barra superior: Título "Lista de Asistencia" + Botones + Miembro / Fecha */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div>
          <h2 className="font-fraunces font-bold text-[20px] text-[#0D356A] tracking-tight">
            Lista de Asistencia
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón + Miembro */}
          <button
            onClick={() => {
              setMemberToEdit(null)
              setIsMemberModalOpen(true)
            }}
            className="bg-[#0D356A] hover:bg-[#09264D] text-white font-manrope font-semibold text-[11px] px-3 py-2 rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Miembro</span>
          </button>

          {/* Botón Fecha */}
          <button
            onClick={() => setIsSessionModalOpen(true)}
            className="border-2 border-[#0D356A] text-[#0D356A] hover:bg-[#0D356A]/5 bg-transparent font-manrope font-semibold text-[11px] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Fecha</span>
          </button>
        </div>
      </div>

      {/* Contenedor de la Tabla estilo Mockup */}
      <div className="bg-[#FAF3E7] rounded-3xl border border-[#E5D5BC] shadow-sm overflow-hidden">
        <div ref={tableContainerRef} className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left whitespace-nowrap">

            {/* Cabecera Azul Marino */}
            <thead className="bg-[#0D356A] text-white">
              <tr>
                <th className="px-4 py-3.5 text-[11px] font-manrope font-bold text-[#DE9927] uppercase tracking-wider sticky left-0 bg-[#0D356A] z-20 min-w-[200px]">
                  INTEGRANTE
                </th>

                {sessions.map((session) => {
                  const { day, month } = parseSessionHeader(session.label, session.sessionDate)

                  return (
                    <th
                      key={session.id}
                      className="px-3 py-2.5 text-center min-w-[65px] group relative"
                    >
                      <div className="flex flex-col items-center justify-center leading-none select-none">
                        {/* Día encima */}
                        <span className="text-white text-[12px] font-manrope font-bold">
                          {day}
                        </span>
                        {/* Mes debajo sin barra "/" */}
                        {month ? (
                          <span className="text-white/85 text-[9px] font-manrope font-bold uppercase tracking-wider mt-0.5">
                            {month}
                          </span>
                        ) : null}
                        {sessions.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la fecha de sesión ${session.label}?`)) {
                                deleteSession(session.id)
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 text-[9px] hover:underline mt-1"
                            title="Eliminar sesión"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </th>
                  )
                })}

                {/* Cabecera TOTAL: Oculta en celular (hidden) y mostrada desde tablet (sm:table-cell) */}
                <th className="hidden sm:table-cell px-3 py-3 text-center text-xs font-bold text-[#DE9927] uppercase tracking-wider sticky right-0 bg-[#0D356A] z-20 min-w-[90px]">
                  TOTAL
                </th>
              </tr>
            </thead>

            {/* Filas de la Tabla */}
            <tbody className="divide-y divide-[#E5D5BC]/60 bg-[#FAF3E7]">
              {members.map((member) => {
                let presentCount = 0
                let lateCount = 0
                let lateJustifiedCount = 0
                let absentCount = 0
                let absentJustifiedCount = 0

                sessions.forEach((s) => {
                  const att = member.attendances?.find((a) => a.sessionId === s.id)
                  if (att?.status === 'PRESENT') presentCount++
                  else if (att?.status === 'LATE') lateCount++
                  else if (att?.status === 'LATE_JUSTIFIED') lateJustifiedCount++
                  else if (att?.status === 'ABSENT') absentCount++
                  else if (att?.status === 'ABSENT_JUSTIFIED') absentJustifiedCount++
                })

                const totalEvaluated =
                  presentCount + lateCount + lateJustifiedCount + absentCount + absentJustifiedCount
                const score =
                  presentCount * 1 +
                  lateCount * 0.5 +
                  lateJustifiedCount * 0.75 +
                  absentJustifiedCount * 0.25
                const percentage =
                  totalEvaluated > 0
                    ? Math.round((score / totalEvaluated) * 100)
                    : 0

                const initial = getInitial(member.name)

                return (
                  <tr
                    key={member.id}
                    className="hover:bg-[#F3E6D0]/50 transition-colors group"
                  >
                    <td
                      onClick={() => setSelectedMemberForCard(member)}
                      className="px-4 py-3 sticky left-0 bg-[#FAF3E7] group-hover:bg-[#F8EFE2] z-10 border-r border-[#E5D5BC]/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">

                        {/* Avatar con Inicial estilo Mockup */}
                        <div
                          className="w-8 h-8 rounded-full bg-[#DE9927]/15 border border-[#DE9927] text-[#C8841B] font-black text-sm flex items-center justify-center shrink-0 shadow-xs hover:scale-105 transition-transform"
                          title="Ver Tarjeta Digital"
                        >
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span>{initial}</span>
                          )}
                        </div>

                        {/* Nombre y Rol */}
                        <div className="min-w-0">
                          <span className="font-manrope font-semibold text-[12px] text-[#0D356A] truncate block max-w-[130px] sm:max-w-[170px]">
                            {member.name}
                          </span>

                          <div className="flex items-center gap-1 font-manrope font-normal text-[10px]">
                            {member.isAuxiliar ? (
                              <span className="text-[#DE9927] flex items-center gap-0.5">
                                ⭐ {member.roleSubtitle.includes('Guía') ? 'Guía' : 'Auxiliar'}
                              </span>
                            ) : (
                              <span className="text-[#0D356A]/60">
                                {member.roleSubtitle || 'Integrante'}
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    </td>

                    {/* Celdas de Sellos Circulares */}
                    {sessions.map((session) => {
                      const att = member.attendances?.find((a) => a.sessionId === session.id)
                      const currentStatus: AttendanceStatus = att ? att.status : 'EMPTY'

                      return (
                        <td key={session.id} className="px-2 py-2.5 text-center">
                          <div className="flex justify-center items-center">
                            <InteractiveStamp
                              initialStatus={currentStatus}
                              size="md"
                              onStatusChange={(newStatus) => {
                                markAttendance(member.id, session.id, newStatus, activeRole || 'PREESCUELA')
                              }}
                            />
                          </div>
                        </td>
                      )
                    })}

                    {/* Celda TOTAL: Oculta en celular (hidden) y mostrada desde tablet (sm:table-cell) */}
                    <td className="hidden sm:table-cell px-3 py-3 text-center sticky right-0 bg-[#FAF3E7] group-hover:bg-[#F8EFE2] z-10 border-l border-[#E5D5BC]/50">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-extrabold text-xs text-[#0D356A]">{percentage}%</span>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-[#0D356A]/60">
                          <span className="text-[#1F6B5C]">✓{presentCount}</span>
                          <span className="text-[#D87532]">R{lateCount}</span>
                          <span className="text-[#C87D2F]">RJ{lateJustifiedCount}</span>
                          <span className="text-[#7A2634]">✗{absentCount}</span>
                          <span className="text-[#9E3B4D]">FJ{absentJustifiedCount}</span>
                        </div>
                      </div>
                    </td>

                  </tr>
                )
              })}
            </tbody>

          </table>
        </div>
      </div>

      {/* Modales */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false)
          setMemberToEdit(null)
        }}
        onSave={handleSaveMember}
        onDelete={deleteMember}
        memberToEdit={memberToEdit}
        groupTitle={customTitle || 'Preescuela'}
      />

      <AddSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onAdd={(label, sessionDate) => addSession(groupId || 'grp_preescuela', label, sessionDate)}
      />

      <LoyaltyCardModal
        isOpen={!!selectedMemberForCard}
        onClose={() => setSelectedMemberForCard(null)}
        member={selectedMemberForCard}
        sessions={sessions}
        groupTitle={customTitle || 'Preescuela'}
        onOpenQr={() => {
          setSelectedMemberForCard(null);
          setSelectedMemberForQr(selectedMemberForCard);
        }}
      />

      <QrPassModal
        isOpen={!!selectedMemberForQr}
        onClose={() => setSelectedMemberForQr(null)}
        member={selectedMemberForQr}
      />

    </div>
  )
}