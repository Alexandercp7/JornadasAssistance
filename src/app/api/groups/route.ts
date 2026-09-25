import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        customTitle: true,
        _count: {
          select: {
            members: true,
            sessions: true,
          },
        },
      },
    })
    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error al obtener grupos:', error)
    return NextResponse.json({ error: 'Error al consultar grupos' }, { status: 500 })
  }
}

