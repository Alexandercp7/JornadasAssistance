import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/sessions?groupId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('groupId')

    if (!groupId || groupId === 'undefined') {
      return NextResponse.json([])
    }

    const sessions = await prisma.session.findMany({
      where: { groupId },
      orderBy: { sessionDate: 'asc' },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error al obtener sesiones:', error)
    return NextResponse.json({ error: 'Error al consultar sesiones' }, { status: 500 })
  }
}

// POST /api/sessions (Crear nueva fecha / sesión)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { groupId, label, sessionDate, isLate } = body

    if (!groupId || !label) {
      return NextResponse.json({ error: 'groupId y label son requeridos' }, { status: 400 })
    }

    const dateObj = sessionDate ? new Date(sessionDate) : new Date()

    const newSession = await prisma.session.create({
      data: {
        groupId,
        label: label.trim(),
        sessionDate: dateObj,
        isLate: Boolean(isLate),
      },
    })

    // Opcional: Crear automáticamente registros de asistencia VACÍOS para los miembros de este grupo
    const groupMembers = await prisma.member.findMany({
      where: { groupId },
      select: { id: true },
    })

    if (groupMembers.length > 0) {
      await prisma.attendance.createMany({
        data: groupMembers.map((m) => ({
          memberId: m.id,
          sessionId: newSession.id,
          status: 'EMPTY',
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error('Error al crear sesión:', error)
    return NextResponse.json({ error: 'Error al registrar sesión' }, { status: 500 })
  }
}

