import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      group: session,
    })
  } catch (error) {
    console.error('Error al verificar sesión:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

