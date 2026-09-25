import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/audit-logs?groupId=xxx&search=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('groupId')
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const where: any = {}

    if (groupId) {
      where.groupId = groupId
    }

    if (search.trim()) {
      where.memberName = {
        contains: search.trim(),
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { registeredAt: 'desc' },
      take: limit,
      include: {
        member: {
          select: {
            avatarUrl: true,
            isAuxiliar: true,
          },
        },
      },
    })

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      name: log.memberName,
      session: log.sessionName,
      status: log.status,
      timestamp: new Intl.DateTimeFormat('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date(log.registeredAt)),
      date: new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(log.registeredAt)),
      coordinatorRole: log.coordinatorRole,
      avatarUrl: log.member?.avatarUrl,
      isAuxiliar: log.member?.isAuxiliar,
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error('Error al obtener bitácora de auditoría:', error)
    return NextResponse.json({ error: 'Error al consultar bitácora' }, { status: 500 })
  }
}

