import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

