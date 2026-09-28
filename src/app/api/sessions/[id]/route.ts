import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PATCH /api/sessions/:id (Actualizar sesión / activar o desactivar modo retardo)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { label, sessionDate, isLate } = body

    const updateData: { label?: string; sessionDate?: Date; isLate?: boolean } = {}
    if (label !== undefined) updateData.label = label.trim()
    if (sessionDate !== undefined) updateData.sessionDate = new Date(sessionDate)
    if (isLate !== undefined) updateData.isLate = Boolean(isLate)

    const updatedSession = await prisma.session.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Error al actualizar sesión:', error)
    return NextResponse.json({ error: 'Error al actualizar sesión' }, { status: 500 })
  }
}

// DELETE /api/sessions/:id
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.session.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Sesión eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar sesión:', error)
    return NextResponse.json({ error: 'Error al eliminar sesión' }, { status: 500 })
  }
}


