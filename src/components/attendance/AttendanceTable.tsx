'use client'

import { useState } from 'react'
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

  return (
    <div className="space-y-4">
      
      {/* Barra superior: Título "Lista de Asistencia" + Botones + Miembro / Fecha */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div>
          <h2 className="text-2xl font-black text-[#0D356A] tracking-tight">
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
            className="bg-[#0D356A] hover:bg-[#09264D] text-white font-bold text-xs px-3 py-2 rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Miembro</span>
          </button>

          {/* Botón Fecha */}
          <button
            onClick={() => setIsSessionModalOpen(true)}
            className="border-2 border-[#0D356A] text-[#0D356A] hover:bg-[#0D356A]/5 bg-transparent font-bold text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Fecha</span>
          </button>
        </div>
      </div>

      {/* Contenedor de la Tabla estilo Mockup */}
      <div className="bg-[#FAF3E7] rounded-3xl border border-[#E5D5BC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left whitespace-nowrap">
            
            {/* Cabecera Azul Marino */}
            <thead className="bg-[#0D356A] text-white">
              <tr>
                <th className="px-4 py-3.5 text-xs font-bold text-[#DE9927] uppercase tracking-wider sticky left-0 bg-[#0D356A] z-20 min-w-[200px]">
                  INTEGRANTE
                </th>

                {sessions.map((session) => (
                  <th
                    key={session.id}
                    className="px-3 py-3 text-center min-w-[65px] group relative"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-white text-xs font-bold leading-tight">
                        {session.label}
                      </span>
                      {sessions.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la fecha de sesión ${session.label}?`)) {
                              deleteSession(session.id)
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 text-[9px] hover:underline"
                          title="Eliminar sesión"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </th>
                ))}

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
                let absentCount = 0

                sessions.forEach((s) => {
                  const att = member.attendances?.find((a) => a.sessionId === s.id)
                  if (att?.status === 'PRESENT') presentCount++
                  else if (att?.status === 'LATE') lateCount++
                  else if (att?.status === 'ABSENT') absentCount++
                })

                const totalEvaluated = presentCount + lateCount + absentCount
                const percentage =
                  totalEvaluated > 0
                    ? Math.round(((presentCount + lateCount * 0.5) / totalEvaluated) * 100)
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
                          <span className="font-bold text-xs sm:text-sm text-[#0D356A] truncate block max-w-[130px] sm:max-w-[170px]">
                            {member.name}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {member.isAuxiliar ? (
                              <span className="text-[10px] text-[#DE9927] font-bold flex items-center gap-0.5">
                                ⭐ {member.roleSubtitle.includes('Guía') ? 'Guía' : 'Auxiliar'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#0D356A]/60">
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
                          <span className="text-[#196E52]">✓{presentCount}</span>
                          <span className="text-[#C86A1D]">R{lateCount}</span>
                          <span className="text-[#7A1E2C]">✗{absentCount}</span>
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

      {/* Leyenda Inferior */}
      <div className="flex items-center justify-start gap-6 px-3 py-2 text-xs font-semibold text-[#0D356A]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#196E52] inline-block" />
          <span>Presente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C86A1D] inline-block" />
          <span>Retardo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7A1E2C] inline-block" />
          <span>Falta</span>
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