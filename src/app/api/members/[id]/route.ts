import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/members/:id
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        attendances: {
          include: {
            session: true,
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Integrante no encontrado' }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error al obtener integrante:', error)
    return NextResponse.json({ error: 'Error al consultar integrante' }, { status: 500 })
  }
}

// PUT /api/members/:id (Actualizar integrante)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, isAuxiliar, roleSubtitle, avatarUrl } = body

    const updateData: {
      name?: string
      isAuxiliar?: boolean
      roleSubtitle?: string
      avatarUrl?: string | null
    } = {}

    if (name !== undefined) updateData.name = name.trim()
    if (isAuxiliar !== undefined) updateData.isAuxiliar = Boolean(isAuxiliar)
    if (roleSubtitle !== undefined) updateData.roleSubtitle = roleSubtitle
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl

    const updatedMember = await prisma.member.update({
      where: { id },
      data: updateData,
      include: {
        attendances: true,
      },
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Error al actualizar integrante:', error)
    return NextResponse.json({ error: 'Error al actualizar integrante' }, { status: 500 })
  }
}

// DELETE /api/members/:id (Eliminar integrante)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.member.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Integrante eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar integrante:', error)
    return NextResponse.json({ error: 'Error al eliminar integrante' }, { status: 500 })
  }
}

