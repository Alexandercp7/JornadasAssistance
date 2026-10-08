'use client'

import { MemberItem, SessionItem } from '@/store/useAttendanceStore'
import { InteractiveStamp, AttendanceStatus } from './InteractiveStamp'

interface MemberAttendanceRowProps {
  member: MemberItem
  sessions: SessionItem[]
  activeCellPopover: { memberId: string; sessionId: string } | null
  onMemberClick: (member: MemberItem) => void
  onStampClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    member: MemberItem,
    session: SessionItem,
    currentStatus: AttendanceStatus
  ) => void
  onStatusChange: (
    memberId: string,
    sessionId: string,
    newStatus: AttendanceStatus
  ) => void
}

export function MemberAttendanceRow({
  member,
  sessions,
  activeCellPopover,
  onMemberClick,
  onStampClick,
  onStatusChange,
}: MemberAttendanceRowProps) {
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
    lateCount * 0.75 +
    lateJustifiedCount * 1 +
    absentJustifiedCount * 1
  const percentage =
    totalEvaluated > 0 ? Math.round((score / totalEvaluated) * 100) : 0

  const initial = member.name.trim().charAt(0).toUpperCase() || 'M'

  return (
    <tr className="hover:bg-[#F3E6D0]/50 transition-colors group">
      {/* Integrante: Avatar y Nombre */}
      <td
        onClick={() => onMemberClick(member)}
        className="px-4 py-3 sticky left-0 bg-[#FAF3E7] group-hover:bg-[#F8EFE2] z-10 border-r border-b border-[#E5D5BC]/50 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {/* Avatar con Inicial */}
          <div
            className="w-8 h-8 rounded-full bg-[#DE9927]/15 border border-[#DE9927] text-[#C8841B] font-black text-sm flex items-center justify-center shrink-0 shadow-xs hover:scale-105 transition-transform"
            title="Ver Tarjeta Digital"
          >
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-full h-full object-cover rounded-full"
              />
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
                  ⭐ Auxiliar
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
        const isCellActive =
          activeCellPopover?.memberId === member.id &&
          activeCellPopover?.sessionId === session.id

        return (
          <td
            key={session.id}
            className="px-2 py-2.5 text-center border-b border-[#E5D5BC]/50"
          >
            <div className="flex justify-center items-center">
              <InteractiveStamp
                initialStatus={currentStatus}
                size="md"
                isActive={isCellActive}
                onClick={(e) => onStampClick(e, member, session, currentStatus)}
                onStatusChange={(newStatus) =>
                  onStatusChange(member.id, session.id, newStatus)
                }
              />
            </div>
          </td>
        )
      })}

      {/* Celda TOTAL: Oculta en celular (hidden) y mostrada desde tablet (sm:table-cell) */}
      <td className="hidden sm:table-cell px-3 py-3 text-center sticky right-0 bg-[#FAF3E7] group-hover:bg-[#F8EFE2] z-10 border-l border-b border-[#E5D5BC]/50">
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
}
