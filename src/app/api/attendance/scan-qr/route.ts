import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { AttendanceStatus, RoleType } from '@prisma/client'

// POST /api/attendance/scan-qr
// El QR siempre marca PRESENT. Para estados justificados usar /api/attendance/mark
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { qrToken, sessionId, coordinatorRole } = body

    if (!qrToken) {
      return NextResponse.json({ error: 'Token QR es requerido' }, { status: 400 })
    }

    // 1. Limpieza y normalización de token (por si viene de URL, JSON o con espacios)
    let cleanedToken = String(qrToken).trim()
    if (cleanedToken.startsWith('{') && cleanedToken.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanedToken)
        cleanedToken = parsed.qrToken || parsed.token || parsed.id || cleanedToken
      } catch {
        // Ignorar si no es JSON válido
      }
    }
    if (cleanedToken.includes('?') || cleanedToken.includes('=')) {
      try {
        const urlObj = new URL(cleanedToken.startsWith('http') ? cleanedToken : `http://dummy.com/${cleanedToken}`)
        const paramToken = urlObj.searchParams.get('qrToken') || urlObj.searchParams.get('token')
        if (paramToken) cleanedToken = paramToken
      } catch {
        // Mantener token como string
      }
    }

    // 2. Buscar al integrante por su token QR o por su ID
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { qrToken: cleanedToken },
          { id: cleanedToken },
        ],
      },
      include: { group: true },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Token QR no válido o integrante no encontrado' },
        { status: 404 },
      )
    }

    // Validar si el integrante corresponde a la coordinación que está escaneando
    if (coordinatorRole && member.group.slug !== coordinatorRole) {
      const currentRoleName = coordinatorRole === 'PREESCUELA' ? 'Preescuela' : 'Escuela'
      return NextResponse.json({
        success: false,
        isWarning: true,
        message: `${member.name} pertenece a ${member.group.name}, no a ${currentRoleName}.`,
        member: {
          id: member.id,
          name: member.name,
          isAuxiliar: member.isAuxiliar,
          roleSubtitle: member.roleSubtitle,
          groupId: member.groupId,
          groupName: member.group.name,
        },
      })
    }

    // 3. Determinar la sesión de asistencia
    let targetSessionId = sessionId

    if (!targetSessionId) {
      // Buscar la sesión más reciente del grupo del miembro
      const latestSession = await prisma.session.findFirst({
        where: { groupId: member.groupId },
        orderBy: [{ sessionDate: 'desc' }, { createdAt: 'desc' }],
      })

      if (!latestSession) {
        // Si aún no existen sesiones para este grupo, creamos una de hoy automáticamente
        const today = new Date()
        const day = today.getDate().toString().padStart(2, '0')
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const label = `${day}/${months[today.getMonth()]}`

        const newSession = await prisma.session.create({
          data: {
            groupId: member.groupId,
            label,
            sessionDate: today,
          },
        })
        targetSessionId = newSession.id
      } else {
        targetSessionId = latestSession.id
      }
    }

    // 4. Obtener la sesión para la bitácora
    const session = await prisma.session.findUnique({
      where: { id: targetSessionId },
    })

    if (!session) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
    }

    if (session.groupId !== member.groupId) {
      return NextResponse.json({
        success: false,
        isWarning: true,
        message: `La fecha seleccionada no pertenece al grupo de ${member.name} (${member.group.name}).`,
      })
    }

    // 5. Verificar si ya tiene un estado justificado — NO sobreescribir con PRESENT
    const existing = await prisma.attendance.findUnique({
      where: {
        memberId_sessionId: {
          memberId: member.id,
          sessionId: targetSessionId,
        },
      },
    })

    const isAlreadyJustified =
      existing?.status === AttendanceStatus.LATE_JUSTIFIED ||
      existing?.status === AttendanceStatus.ABSENT_JUSTIFIED

    if (isAlreadyJustified) {
      return NextResponse.json({
        success: false,
        message: `${member.name} ya tiene un estado justificado (${existing!.status}). Edítalo manualmente si es necesario.`,
        member: {
          id: member.id,
          name: member.name,
          isAuxiliar: member.isAuxiliar,
          roleSubtitle: member.roleSubtitle,
          groupId: member.groupId,
          groupName: member.group.name,
        },
        session: { id: session.id, label: session.label },
        attendance: existing,
      })
    }

    const targetStatus = session.isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT
    const statusLabel = session.isLate ? 'Retardo' : 'Presente'
    const wasAlreadyRecorded = existing?.status === targetStatus

    // 6. Marcar como PRESENT o LATE (según si la sesión tiene retardo activo)
    const attendance = await prisma.attendance.upsert({
      where: {
        memberId_sessionId: {
          memberId: member.id,
          sessionId: targetSessionId,
        },
      },
      update: {
        status: targetStatus,
        justification: null,
      },
      create: {
        memberId: member.id,
        sessionId: targetSessionId,
        status: targetStatus,
      },
    })

    // 7. Registrar en la bitácora de auditoría
    await prisma.auditLog.create({
      data: {
        groupId: member.groupId,
        memberId: member.id,
        memberName: member.name,
        sessionName: `${session.label} ${member.group.customTitle}`,
        status: targetStatus,
        justification: null,
        coordinatorRole: (coordinatorRole as RoleType) || (member.group.slug as RoleType),
        registeredAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: wasAlreadyRecorded
        ? `¡${member.name} ya estaba registrado/a como ${statusLabel}!`
        : session.isLate
        ? `¡Retardo registrado para ${member.name}!`
        : `¡Asistencia confirmada para ${member.name}!`,
      member: {
        id: member.id,
        name: member.name,
        isAuxiliar: member.isAuxiliar,
        roleSubtitle: member.roleSubtitle,
        groupId: member.groupId,
        groupName: member.group.name,
      },
      session: {
        id: session.id,
        label: session.label,
        isLate: session.isLate,
      },
      attendance,
    })
  } catch (error) {
    console.error('Error al procesar escaneo QR:', error)
    return NextResponse.json({ error: 'Error al procesar el código QR' }, { status: 500 })
  }
}

