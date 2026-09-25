import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { AttendanceStatus, RoleType } from '@prisma/client'

// POST /api/attendance/scan-qr
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { qrToken, sessionId, coordinatorRole } = body

    if (!qrToken) {
      return NextResponse.json({ error: 'Token QR es requerido' }, { status: 400 })
    }

    // 1. Buscar al integrante por su token QR
    const member = await prisma.member.findUnique({
      where: { qrToken: qrToken.trim() },
      include: { group: true },
    })

    if (!member) {
      return NextResponse.json({ error: 'Token QR no válido o integrante no encontrado' }, { status: 404 })
    }

    // 2. Determinar la sesión de asistencia
    let targetSessionId = sessionId

    if (!targetSessionId) {
      // Buscar la sesión más reciente del grupo del miembro
      const latestSession = await prisma.session.findFirst({
        where: { groupId: member.groupId },
        orderBy: { sessionDate: 'desc' },
      })

      if (!latestSession) {
        return NextResponse.json({ error: 'No hay sesiones registradas para este grupo' }, { status: 400 })
      }
      targetSessionId = latestSession.id
    }

    // 3. Obtener la sesión para la bitácora
    const session = await prisma.session.findUnique({
      where: { id: targetSessionId },
    })

    if (!session) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
    }

    // 4. Marcar como PRESENT (Asistencia confirmada)
    const attendance = await prisma.attendance.upsert({
      where: {
        memberId_sessionId: {
          memberId: member.id,
          sessionId: targetSessionId,
        },
      },
      update: {
        status: AttendanceStatus.PRESENT,
      },
      create: {
        memberId: member.id,
        sessionId: targetSessionId,
        status: AttendanceStatus.PRESENT,
      },
    })

    // 5. Registrar en la bitácora de auditoría
    await prisma.auditLog.create({
      data: {
        groupId: member.groupId,
        memberId: member.id,
        memberName: member.name,
        sessionName: `${session.label} ${member.group.customTitle}`,
        status: AttendanceStatus.PRESENT,
        coordinatorRole: (coordinatorRole as RoleType) || (member.group.slug as RoleType),
        registeredAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: `¡Asistencia confirmada para ${member.name}!`,
      member: {
        id: member.id,
        name: member.name,
        isAuxiliar: member.isAuxiliar,
        roleSubtitle: member.roleSubtitle,
        groupName: member.group.name,
      },
      session: {
        id: session.id,
        label: session.label,
      },
      attendance,
    })
  } catch (error) {
    console.error('Error al procesar escaneo QR:', error)
    return NextResponse.json({ error: 'Error al procesar el código QR' }, { status: 500 })
  }
}

