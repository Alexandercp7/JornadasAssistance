import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { AttendanceStatus, RoleType } from '@prisma/client'

// POST /api/attendance/mark
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { memberId, sessionId, status, coordinatorRole, justification } = body

    if (!memberId || !sessionId || !status) {
      return NextResponse.json(
        { error: 'memberId, sessionId y status son requeridos' },
        { status: 400 },
      )
    }

    // 1. Actualizar o insertar el sello de asistencia
    const attendance = await prisma.attendance.upsert({
      where: {
        memberId_sessionId: {
          memberId,
          sessionId,
        },
      },
      update: {
        status: status as AttendanceStatus,
        justification: justification?.trim() || null,
      },
      create: {
        memberId,
        sessionId,
        status: status as AttendanceStatus,
        justification: justification?.trim() || null,
      },
      include: {
        member: {
          include: { group: true },
        },
        session: true,
      },
    })

    // 2. Si el estado no es vacío (EMPTY), registrar automáticamente en la bitácora de auditoría
    if (status !== 'EMPTY' && attendance.member && attendance.session) {
      await prisma.auditLog.create({
        data: {
          groupId: attendance.member.groupId,
          memberId: attendance.member.id,
          memberName: attendance.member.name,
          sessionName: `${attendance.session.label} ${attendance.member.group.customTitle}`,
          status: status as AttendanceStatus,
          justification: justification?.trim() || null,
          coordinatorRole:
            (coordinatorRole as RoleType) || (attendance.member.group.slug as RoleType),
          registeredAt: new Date(),
        },
      })
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error al registrar asistencia:', error)
    return NextResponse.json({ error: 'Error al registrar asistencia' }, { status: 500 })
  }
}

