import { PrismaClient, RoleType, AttendanceStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seed)...')

  // 1. Grupos
  const preescuela = await prisma.group.upsert({
    where: { slug: RoleType.PREESCUELA },
    update: { name: 'Coordinación Preescuela', customTitle: 'Preescuela', pin: '1234' },
    create: {
      id: 'grp_preescuela',
      slug: RoleType.PREESCUELA,
      name: 'Coordinación Preescuela',
      customTitle: 'Preescuela',
      pin: '1234',
    },
  })

  const escuela = await prisma.group.upsert({
    where: { slug: RoleType.ESCUELA },
    update: { name: 'Coordinación Escuela', customTitle: 'Escuela', pin: '5678' },
    create: {
      id: 'grp_escuela',
      slug: RoleType.ESCUELA,
      name: 'Coordinación Escuela',
      customTitle: 'Escuela',
      pin: '5678',
    },
  })

  await prisma.group.upsert({
    where: { slug: RoleType.SUPERADMIN },
    update: { name: 'Super Administrador', customTitle: 'Super Admin MJVC', pin: '9999' },
    create: {
      id: 'grp_superadmin',
      slug: RoleType.SUPERADMIN,
      name: 'Super Administrador',
      customTitle: 'Super Admin MJVC',
      pin: '9999',
    },
  })

  // 2. Sesiones iniciales
  const s1 = await prisma.session.upsert({
    where: { id: 'ses_pre_1' },
    update: {},
    create: { id: 'ses_pre_1', groupId: preescuela.id, label: '12/Oct', sessionDate: new Date('2026-10-12') },
  })

  const s2 = await prisma.session.upsert({
    where: { id: 'ses_pre_2' },
    update: {},
    create: { id: 'ses_pre_2', groupId: preescuela.id, label: '19/Oct', sessionDate: new Date('2026-10-19') },
  })

  const s3 = await prisma.session.upsert({
    where: { id: 'ses_pre_3' },
    update: {},
    create: { id: 'ses_pre_3', groupId: preescuela.id, label: '26/Oct', sessionDate: new Date('2026-10-26') },
  })

  const s4 = await prisma.session.upsert({
    where: { id: 'ses_pre_4' },
    update: {},
    create: { id: 'ses_pre_4', groupId: preescuela.id, label: '02/Nov', sessionDate: new Date('2026-11-02') },
  })

  // 3. Miembros
  const m1 = await prisma.member.upsert({
    where: { qrToken: 'QR_SOFIA_RODRIGUEZ_PRE123' },
    update: {},
    create: {
      id: 'mem_pre_1',
      groupId: preescuela.id,
      name: 'Sofía Rodríguez',
      isAuxiliar: true,
      roleSubtitle: 'Auxiliares y Guías - Preescuela',
      qrToken: 'QR_SOFIA_RODRIGUEZ_PRE123',
    },
  })

  const m2 = await prisma.member.upsert({
    where: { qrToken: 'QR_DIEGO_SANCHEZ_PRE456' },
    update: {},
    create: {
      id: 'mem_pre_2',
      groupId: preescuela.id,
      name: 'Diego Sánchez',
      isAuxiliar: false,
      roleSubtitle: 'Integrantes - Preescuela',
      qrToken: 'QR_DIEGO_SANCHEZ_PRE456',
    },
  })

  const m3 = await prisma.member.upsert({
    where: { qrToken: 'QR_MATEO_RUIZ_PRE789' },
    update: {},
    create: {
      id: 'mem_pre_3',
      groupId: preescuela.id,
      name: 'Mateo Ruiz',
      isAuxiliar: false,
      roleSubtitle: 'Integrantes - Preescuela',
      qrToken: 'QR_MATEO_RUIZ_PRE789',
    },
  })

  const m4 = await prisma.member.upsert({
    where: { qrToken: 'QR_VALERIA_CASTRO_PRE321' },
    update: {},
    create: {
      id: 'mem_pre_4',
      groupId: preescuela.id,
      name: 'Valeria Castro',
      isAuxiliar: true,
      roleSubtitle: 'Auxiliares y Guías - Preescuela',
      qrToken: 'QR_VALERIA_CASTRO_PRE321',
    },
  })

  // 4. Asistencias
  const attendancesData = [
    { memberId: m1.id, sessionId: s1.id, status: AttendanceStatus.PRESENT },
    { memberId: m1.id, sessionId: s2.id, status: AttendanceStatus.PRESENT },
    { memberId: m1.id, sessionId: s3.id, status: AttendanceStatus.LATE },
    { memberId: m1.id, sessionId: s4.id, status: AttendanceStatus.PRESENT },

    { memberId: m2.id, sessionId: s1.id, status: AttendanceStatus.PRESENT },
    { memberId: m2.id, sessionId: s2.id, status: AttendanceStatus.ABSENT },
    { memberId: m2.id, sessionId: s3.id, status: AttendanceStatus.PRESENT },
    { memberId: m2.id, sessionId: s4.id, status: AttendanceStatus.PRESENT },

    { memberId: m3.id, sessionId: s1.id, status: AttendanceStatus.LATE },
    { memberId: m3.id, sessionId: s2.id, status: AttendanceStatus.PRESENT },
    { memberId: m3.id, sessionId: s3.id, status: AttendanceStatus.PRESENT },
    { memberId: m3.id, sessionId: s4.id, status: AttendanceStatus.PRESENT },

    { memberId: m4.id, sessionId: s1.id, status: AttendanceStatus.PRESENT },
    { memberId: m4.id, sessionId: s2.id, status: AttendanceStatus.PRESENT },
    { memberId: m4.id, sessionId: s3.id, status: AttendanceStatus.PRESENT },
    { memberId: m4.id, sessionId: s4.id, status: AttendanceStatus.PRESENT },
  ]

  for (const att of attendancesData) {
    await prisma.attendance.upsert({
      where: {
        memberId_sessionId: {
          memberId: att.memberId,
          sessionId: att.sessionId,
        },
      },
      update: { status: att.status },
      create: att,
    })
  }

  // 5. Auditoría inicial
  await prisma.auditLog.createMany({
    data: [
      {
        groupId: preescuela.id,
        memberId: m1.id,
        memberName: m1.name,
        sessionName: '02/Nov Preescuela',
        status: AttendanceStatus.PRESENT,
        coordinatorRole: RoleType.PREESCUELA,
        registeredAt: new Date(),
      },
      {
        groupId: preescuela.id,
        memberId: m2.id,
        memberName: m2.name,
        sessionName: '19/Oct Preescuela',
        status: AttendanceStatus.ABSENT,
        coordinatorRole: RoleType.PREESCUELA,
        registeredAt: new Date(Date.now() - 3600000),
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Base de datos inicializada correctamente con datos semilla.')
}

main()
  .catch((e) => {
    console.error('❌ Error al sembrar la base de datos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

