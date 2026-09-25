import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { customTitle } = body

    if (!customTitle || typeof customTitle !== 'string') {
      return NextResponse.json({ error: 'Título personalizado inválido' }, { status: 400 })
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: { customTitle: customTitle.trim() },
    })

    return NextResponse.json(updatedGroup)
  } catch (error) {
    console.error('Error al actualizar grupo:', error)
    return NextResponse.json({ error: 'Error al actualizar grupo' }, { status: 500 })
  }
}

