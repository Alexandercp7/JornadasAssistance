import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { RoleType } from '@prisma/client'
import { signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { role, pin } = await req.json()

    if (!role || !pin) {
      return NextResponse.json({ error: 'Rol y PIN son requeridos' }, { status: 400 })
    }

    // Buscar estrictamente en la base de datos MySQL / Supabase
    const group = await prisma.group.findUnique({
      where: { slug: role as RoleType },
    })

    if (!group) {
      return NextResponse.json({ error: 'Coordinación no encontrada en la base de datos' }, { status: 404 })
    }

    if (group.pin !== pin) {
      return NextResponse.json({ error: 'PIN incorrecto para esta coordinación' }, { status: 401 })
    }

    const sessionPayload = {
      groupId: group.id,
      slug: group.slug,
      name: group.name,
      customTitle: group.customTitle,
    }

    // Generar JWT firmado
    const token = await signSessionToken(sessionPayload)

    const response = NextResponse.json({
      success: true,
      group: sessionPayload,
    })

    // Establecer Cookie HTTP-Only Segura
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 días
    })

    return response
  } catch (error) {
    console.error('Error en /api/auth/login:', error)
    return NextResponse.json({ error: 'Error al conectar con la base de datos' }, { status: 500 })
  }
}
