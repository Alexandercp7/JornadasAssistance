import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '../lib/prisma'
import { RoleType, AttendanceStatus } from '@prisma/client'
import { POST } from '../app/api/attendance/scan-qr/route'

describe('Módulo de Escaneo QR (API & Registro de Asistencia)', () => {
  let testMemberId: string
  let testSessionId: string
  let groupId: string
  const testQrToken = `QR_SCAN_UNIT_${Date.now()}`

  beforeAll(async () => {
    // Buscar o usar grupo de prueba
    const group = await prisma.group.findFirst({
      where: { slug: RoleType.PREESCUELA },
    })
    expect(group).toBeDefined()
    groupId = group!.id

    // Crear sesión de prueba
    const session = await prisma.session.create({
      data: {
        groupId,
        label: 'QR/Test',
        sessionDate: new Date(),
      },
    })
    testSessionId = session.id

    // Crear miembro de prueba
    const member = await prisma.member.create({
      data: {
        groupId,
        name: 'Ana García QR Test',
        isAuxiliar: true,
        roleSubtitle: 'Auxiliar de Prueba QR',
        qrToken: testQrToken,
      },
    })
    testMemberId = member.id
  })

  it('1. Debe registrar asistencia como PRESENT al escanear un token QR válido', async () => {
    const req = new Request('http://localhost:3000/api/attendance/scan-qr', {
      method: 'POST',
      body: JSON.stringify({
        qrToken: testQrToken,
        sessionId: testSessionId,
        coordinatorRole: 'PREESCUELA',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.member.name).toBe('Ana García QR Test')
    expect(data.attendance.status).toBe('PRESENT')

    // Verificar en base de datos
    const saved = await prisma.attendance.findUnique({
      where: {
        memberId_sessionId: {
          memberId: testMemberId,
          sessionId: testSessionId,
        },
      },
    })
    expect(saved?.status).toBe(AttendanceStatus.PRESENT)

    // Verificar bitácora de auditoría
    const log = await prisma.auditLog.findFirst({
      where: {
        memberId: testMemberId,
        status: AttendanceStatus.PRESENT,
      },
      orderBy: { registeredAt: 'desc' },
    })
    expect(log).toBeDefined()
    expect(log?.memberName).toBe('Ana García QR Test')
  })

  it('2. Debe procesar tokens QR en formato JSON o URL con parámetros', async () => {
    // Simular JSON {"qrToken": "..."}
    const jsonToken = JSON.stringify({ qrToken: testQrToken })
    const reqJson = new Request('http://localhost:3000/api/attendance/scan-qr', {
      method: 'POST',
      body: JSON.stringify({
        qrToken: jsonToken,
        sessionId: testSessionId,
      }),
    })

    const resJson = await POST(reqJson)
    expect(resJson.status).toBe(200)
    const dataJson = await resJson.json()
    expect(dataJson.success).toBe(true)
    expect(dataJson.member.id).toBe(testMemberId)

    // Simular URL https://app.mjvc.org/pass?token=...
    const urlToken = `https://app.mjvc.org/pass?token=${testQrToken}`
    const reqUrl = new Request('http://localhost:3000/api/attendance/scan-qr', {
      method: 'POST',
      body: JSON.stringify({
        qrToken: urlToken,
        sessionId: testSessionId,
      }),
    })

    const resUrl = await POST(reqUrl)
    expect(resUrl.status).toBe(200)
    const dataUrl = await resUrl.json()
    expect(dataUrl.success).toBe(true)
  })

  it('3. Debe informar adecuadamente si el integrante ya estaba registrado como Presente', async () => {
    const req = new Request('http://localhost:3000/api/attendance/scan-qr', {
      method: 'POST',
      body: JSON.stringify({
        qrToken: testQrToken,
        sessionId: testSessionId,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.message).toContain('ya estaba registrado/a como Presente')
  })

  it('4. Debe rechazar tokens inexistentes con status 404', async () => {
    const req = new Request('http://localhost:3000/api/attendance/scan-qr', {
      method: 'POST',
      body: JSON.stringify({
        qrToken: 'QR_TOKEN_FANTASMA_INEXISTENTE',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toContain('Token QR no válido')
  })

  it('5. NO debe sobreescribir un estado justificado previo', async () => {
    // Cambiar estado a LATE_JUSTIFIED manualmente
    await prisma.attendance.update({
      where: {
        memberId_sessionId: {
          memberId: testMemberId,
          sessionId: testSessionId,
        },
      },
      data: {
        status: AttendanceStatus.LATE_JUSTIFIED,
        justification: 'Cita médica previa',
      },
    })

    const req = new Request('http://localhost:3000/api/attendance/scan-qr', {
      method: 'POST',
      body: JSON.stringify({
        qrToken: testQrToken,
        sessionId: testSessionId,
      }),
    })

    const res = await POST(req)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.message).toContain('estado justificado')

    // Verificar que en la DB sigue justificado
    const check = await prisma.attendance.findUnique({
      where: {
        memberId_sessionId: {
          memberId: testMemberId,
          sessionId: testSessionId,
        },
      },
    })
    expect(check?.status).toBe(AttendanceStatus.LATE_JUSTIFIED)
  })

  it('6. Debe registrar status LATE cuando la sesión tiene isLate activo', async () => {
    // 1. Activar isLate en la sesión de prueba
    await prisma.session.update({
      where: { id: testSessionId },
      data: { isLate: true },
    })

    // 2. Limpiar asistencia previa del miembro para esta sesión
    await prisma.attendance.deleteMany({
      where: {
        memberId: testMemberId,
        sessionId: testSessionId,
      },
    })

    const req = new Request('http://localhost:3000/api/attendance/scan-qr', {
      method: 'POST',
      body: JSON.stringify({
        qrToken: testQrToken,
        sessionId: testSessionId,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.message).toContain('Retardo registrado')
    expect(data.attendance.status).toBe(AttendanceStatus.LATE)

    // Verificar en la DB
    const check = await prisma.attendance.findUnique({
      where: {
        memberId_sessionId: {
          memberId: testMemberId,
          sessionId: testSessionId,
        },
      },
    })
    expect(check?.status).toBe(AttendanceStatus.LATE)
  })

  afterAll(async () => {
    // Limpieza
    try {
      await prisma.attendance.deleteMany({ where: { memberId: testMemberId } })
      await prisma.auditLog.deleteMany({ where: { memberId: testMemberId } })
      await prisma.member.delete({ where: { id: testMemberId } })
      await prisma.session.delete({ where: { id: testSessionId } })
    } catch {
      // Ignorar si ya fue eliminado
    }
    await prisma.$disconnect()
  })
})
