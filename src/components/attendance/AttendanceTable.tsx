'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { AttendanceStatus } from './InteractiveStamp'
import { LoyaltyCardModal } from '@/components/export/LoyaltyCardModal'
import { MemberModal } from './MemberModal'
import { AddSessionModal } from './AddSessionModal'
import { QrPassModal } from './QrPassModal'
import { FloatingAttendanceToolbar } from './FloatingAttendanceToolbar'
import { AttendanceTableHeaderActions } from './AttendanceTableHeaderActions'
import { SessionHeaderCell } from './SessionHeaderCell'
import { MemberAttendanceRow } from './MemberAttendanceRow'
import { useAttendanceStore, MemberItem, SessionItem } from '@/store/useAttendanceStore'
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
    updateSession,
    deleteSession,
  } = useAttendanceStore()

  const { activeRole, customTitle, groupId } = useAuthStore()

  const currentGroupId =
    groupId || (activeRole === 'ESCUELA' ? 'grp_escuela' : 'grp_preescuela')

  // Filtrar estrictamente sesiones y miembros pertenecientes a la coordinación activa (memoizado)
  const groupSessions = useMemo(() => {
    return sessions.filter(
      (s) => !s.groupId || s.groupId === currentGroupId
    )
  }, [sessions, currentGroupId])

  const groupMembers = useMemo(() => {
    return members.filter(
      (m) => !m.groupId || m.groupId === currentGroupId
    )
  }, [members, currentGroupId])

  // Estados de Modales
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<MemberItem | null>(null)
  const [selectedMemberForQr, setSelectedMemberForQr] = useState<MemberItem | null>(null)
  const [memberToEdit, setMemberToEdit] = useState<MemberItem | null>(null)
  const [sessionToEdit, setSessionToEdit] = useState<SessionItem | null>(null)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)

  // Estado del Toolbar Flotante Contextual para la celda seleccionada
  const [activeCellPopover, setActiveCellPopover] = useState<{
    memberId: string
    sessionId: string
    memberName: string
    sessionLabel: string
    currentStatus: AttendanceStatus
    anchorEl: HTMLElement
  } | null>(null)

  // Referencia para auto-scroll del contenedor de la tabla
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const hasAutoScrolledRef = useRef(false)
  const prevSessionCountRef = useRef(0)

  useEffect(() => {
    if (tableContainerRef.current && groupSessions.length > 0) {
      const isInitialLoad = !hasAutoScrolledRef.current
      const isNewSessionAdded =
        prevSessionCountRef.current > 0 &&
        groupSessions.length > prevSessionCountRef.current

      if (isInitialLoad || isNewSessionAdded) {
        tableContainerRef.current.scrollLeft = tableContainerRef.current.scrollWidth
        hasAutoScrolledRef.current = true
      }
      prevSessionCountRef.current = groupSessions.length
    }
  }, [groupSessions.length])

  // Manejador de clic en un sello de asistencia
  const handleStampClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    member: MemberItem,
    session: SessionItem,
    currentStatus: AttendanceStatus
  ) => {
    e.stopPropagation()
    setActiveCellPopover({
      memberId: member.id,
      sessionId: session.id,
      memberName: member.name,
      sessionLabel: session.label,
      currentStatus,
      anchorEl: e.currentTarget,
    })
  }

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
        groupId: currentGroupId,
        ...data,
      })
    }
    setMemberToEdit(null)
  }

  return (
    <div className="space-y-4">
      {/* Barra superior de acciones */}
      <AttendanceTableHeaderActions
        onAddMember={() => {
          setMemberToEdit(null)
          setIsMemberModalOpen(true)
        }}
        onAddSession={() => {
          setSessionToEdit(null)
          setIsSessionModalOpen(true)
        }}
      />

      {/* Contenedor de la Tabla estilo Mockup */}
      <div className="bg-[#FAF3E7] rounded-3xl border border-[#E5D5BC] shadow-sm overflow-hidden">
        <div
          ref={tableContainerRef}
          className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)] sm:max-h-[calc(100vh-240px)] custom-scrollbar"
        >
          <table className="w-full text-sm text-left whitespace-nowrap border-separate border-spacing-0">
            {/* Cabecera Azul Marino Fija (Sticky) */}
            <thead className="bg-[#0D356A] text-white sticky top-0 z-30 shadow-xs">
              <tr>
                <th className="px-4 py-3.5 text-[11px] font-manrope font-bold text-[#DE9927] uppercase tracking-wider sticky left-0 top-0 bg-[#0D356A] z-40 min-w-[200px] border-b border-[#09264D]">
                  INTEGRANTE
                </th>

                {groupSessions.map((session) => (
                  <SessionHeaderCell
                    key={session.id}
                    session={session}
                    onClick={() => {
                      setSessionToEdit(session)
                      setIsSessionModalOpen(true)
                    }}
                  />
                ))}

                <th className="hidden sm:table-cell px-3 py-3 text-center text-xs font-bold text-[#DE9927] uppercase tracking-wider sticky right-0 top-0 bg-[#0D356A] z-40 min-w-[90px] border-b border-[#09264D]">
                  TOTAL
                </th>
              </tr>
            </thead>

            {/* Filas de la Tabla */}
            <tbody className="divide-y divide-[#E5D5BC]/60 bg-[#FAF3E7]">
              {groupMembers.map((member) => (
                <MemberAttendanceRow
                  key={member.id}
                  member={member}
                  sessions={groupSessions}
                  activeCellPopover={activeCellPopover}
                  onMemberClick={(m) => setSelectedMemberForCard(m)}
                  onStampClick={handleStampClick}
                  onStatusChange={(memberId, sessionId, newStatus) => {
                    markAttendance(
                      memberId,
                      sessionId,
                      newStatus,
                      activeRole || 'PREESCUELA'
                    )
                  }}
                />
              ))}
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
        groupTitle={customTitle || (activeRole === 'ESCUELA' ? 'Escuela' : 'Preescuela')}
      />

      <AddSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false)
          setSessionToEdit(null)
        }}
        sessionToEdit={sessionToEdit}
        onAdd={(label, sessionDate, isLate) =>
          addSession(currentGroupId, label, sessionDate, isLate)
        }
        onUpdate={(sessionId, data) => updateSession(sessionId, data)}
        onDelete={(sessionId) => deleteSession(sessionId)}
        canDelete={groupSessions.length > 1}
      />

      <LoyaltyCardModal
        isOpen={!!selectedMemberForCard}
        onClose={() => setSelectedMemberForCard(null)}
        member={selectedMemberForCard}
        sessions={groupSessions}
        groupTitle={customTitle || (activeRole === 'ESCUELA' ? 'Escuela' : 'Preescuela')}
        onOpenQr={() => {
          setSelectedMemberForQr(selectedMemberForCard)
          setSelectedMemberForCard(null)
        }}
        onEditMember={() => {
          setMemberToEdit(selectedMemberForCard)
          setSelectedMemberForCard(null)
          setIsMemberModalOpen(true)
        }}
      />

      <QrPassModal
        isOpen={!!selectedMemberForQr}
        onClose={() => setSelectedMemberForQr(null)}
        member={selectedMemberForQr}
      />

      {/* Barra de Herramientas Flotante Contextual */}
      {activeCellPopover && (
        <FloatingAttendanceToolbar
          isOpen={!!activeCellPopover}
          onClose={() => setActiveCellPopover(null)}
          currentStatus={activeCellPopover.currentStatus}
          memberName={activeCellPopover.memberName}
          sessionLabel={activeCellPopover.sessionLabel}
          anchorEl={activeCellPopover.anchorEl}
          onSelectStatus={(newStatus) => {
            markAttendance(
              activeCellPopover.memberId,
              activeCellPopover.sessionId,
              newStatus,
              activeRole || 'PREESCUELA'
            )
            setActiveCellPopover(null)
          }}
        />
      )}
    </div>
  )
}