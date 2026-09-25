import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '../lib/prisma'
import { RoleType, AttendanceStatus } from '@prisma/client'

describe('Operaciones CRUD con MySQL / Prisma', () => {
  let testMemberId: string
  let testSessionId: string
  let groupId: string

  beforeAll(async () => {
    // Obtener grupo de prueba
    const group = await prisma.group.findFirst({
      where: { slug: RoleType.PREESCUELA },
    })
    expect(group).toBeDefined()
    groupId = group!.id
  })

  it('1. Debe leer los grupos creados en MySQL', async () => {
    const groups = await prisma.group.findMany()
    expect(groups.length).toBeGreaterThanOrEqual(2)
  })

  it('2. Debe crear un nuevo integrante en MySQL (CREATE)', async () => {
    const token = `QR_TEST_${Date.now()}`
    const newMember = await prisma.member.create({
      data: {
        groupId,
        name: 'Carlos Mendoza Test',
        isAuxiliar: true,
        roleSubtitle: 'Auxiliar de Prueba',
        qrToken: token,
      },
    })

    expect(newMember.id).toBeDefined()
    expect(newMember.name).toBe('Carlos Mendoza Test')
    expect(newMember.isAuxiliar).toBe(true)
    testMemberId = newMember.id
  })

  it('3. Debe actualizar un integrante en MySQL (UPDATE)', async () => {
    const updated = await prisma.member.update({
      where: { id: testMemberId },
      data: { name: 'Carlos Mendoza Modificado' },
    })

    expect(updated.name).toBe('Carlos Mendoza Modificado')
  })

  it('4. Debe crear una nueva sesión y registrar asistencia con auditoría (MARK)', async () => {
    const session = await prisma.session.create({
      data: {
        groupId,
        label: 'Test/Ses',
        sessionDate: new Date(),
      },
    })
    testSessionId = session.id

    // Marcar asistencia
    const att = await prisma.attendance.create({
      data: {
        memberId: testMemberId,
        sessionId: testSessionId,
        status: AttendanceStatus.PRESENT,
      },
    })
    expect(att.status).toBe(AttendanceStatus.PRESENT)

    // Crear registro de auditoría
    const log = await prisma.auditLog.create({
      data: {
        groupId,
        memberId: testMemberId,
        memberName: 'Carlos Mendoza Modificado',
        sessionName: 'Test/Ses Preescuela',
        status: AttendanceStatus.PRESENT,
        coordinatorRole: RoleType.PREESCUELA,
      },
    })
    expect(log.id).toBeDefined()
    expect(log.status).toBe('PRESENT')
  })

  it('5. Debe eliminar el integrante y realizar borrado en cascada (DELETE)', async () => {
    await prisma.member.delete({
      where: { id: testMemberId },
    })

    const found = await prisma.member.findUnique({
      where: { id: testMemberId },
    })
    expect(found).toBeNull()

    // Limpiar sesión de prueba
    await prisma.session.delete({
      where: { id: testSessionId },
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })
})

