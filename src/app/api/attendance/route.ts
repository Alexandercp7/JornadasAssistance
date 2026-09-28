import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/attendance?memberId=xxx&sessionId=xxx
// GET /api/attendance?sessionId=xxx  (todos los miembros de una sesión)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const memberId = searchParams.get('memberId')
    const sessionId = searchParams.get('sessionId')

    if (!memberId && !sessionId) {
      return NextResponse.json(
        { error: 'Debe proporcionarse al menos memberId o sessionId' },
        { status: 400 },
      )
    }

    const where: Record<string, any> = {}
    if (memberId) where.memberId = memberId
    if (sessionId) where.sessionId = sessionId

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        member: { select: { id: true, name: true, isAuxiliar: true, roleSubtitle: true } },
        session: { select: { id: true, label: true, sessionDate: true } },
      },
    })

    return NextResponse.json(attendances)
  } catch (error) {
    console.error('Error al obtener asistencias:', error)
    return NextResponse.json({ error: 'Error al consultar asistencias' }, { status: 500 })
  }
}
