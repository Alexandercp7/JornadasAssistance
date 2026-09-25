import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET_KEY = process.env.JWT_SECRET || 'mjvc_ea_jesus_super_secure_jwt_secret_key_2026'
const SECRET = new TextEncoder().encode(JWT_SECRET_KEY)

export const SESSION_COOKIE_NAME = 'mjvc_session'

export interface SessionPayload {
  groupId: string
  slug: string
  name: string
  customTitle: string
}

// Crear token firmado JWT (Vigencia: 30 días)
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET)
}

// Verificar token JWT
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// Obtener sesión actual desde cookies del servidor
export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    if (!sessionCookie?.value) return null
    return await verifySessionToken(sessionCookie.value)
  } catch {
    return null
  }
}

