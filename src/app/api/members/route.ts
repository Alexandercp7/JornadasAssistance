import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

// GET /api/members?groupId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('groupId')

    const where = groupId ? { groupId } : {}

    const members = await prisma.member.findMany({
      where,
      include: {
        attendances: {
          include: {
            session: true,
          },
        },
      },
      orderBy: [
        { isAuxiliar: 'desc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error al obtener integrantes:', error)
    return NextResponse.json({ error: 'Error al obtener integrantes' }, { status: 500 })
  }
}

// POST /api/members (Crear nuevo integrante)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { groupId, name, isAuxiliar, roleSubtitle, avatarUrl } = body

    if (!groupId || !name) {
      return NextResponse.json({ error: 'groupId y name son requeridos' }, { status: 400 })
    }

    // Generar token único para el Pase Digital QR
    const qrToken = `QR_${crypto.randomBytes(8).toString('hex').toUpperCase()}`

    const newMember = await prisma.member.create({
      data: {
        groupId,
        name: name.trim(),
        isAuxiliar: Boolean(isAuxiliar),
        roleSubtitle: roleSubtitle || (isAuxiliar ? 'Auxiliares y Guías' : 'Integrantes'),
        avatarUrl: avatarUrl || null,
        qrToken,
      },
      include: {
        attendances: true,
      },
    })

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error('Error al crear integrante:', error)
    return NextResponse.json({ error: 'Error al registrar integrante' }, { status: 500 })
  }
}

