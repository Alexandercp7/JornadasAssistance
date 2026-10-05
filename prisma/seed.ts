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

  const extraStudents = [
    { id: 'mem_pre_5', name: 'Santiago Mendoza', qrToken: 'QR_SANTIAGO_MENDOZA_PRE501' },
    { id: 'mem_pre_6', name: 'Camila Flores', qrToken: 'QR_CAMILA_FLORES_PRE502' },
    { id: 'mem_pre_7', name: 'Leonardo Gómez', qrToken: 'QR_LEONARDO_GOMEZ_PRE503' },
    { id: 'mem_pre_8', name: 'Isabella Morales', qrToken: 'QR_ISABELLA_MORALES_PRE504' },
    { id: 'mem_pre_9', name: 'Emiliano Vargas', qrToken: 'QR_EMILIANO_VARGAS_PRE505' },
    { id: 'mem_pre_10', name: 'Valentina Herrera', qrToken: 'QR_VALENTINA_HERRERA_PRE506' },
    { id: 'mem_pre_11', name: 'Sebastián Navarro', qrToken: 'QR_SEBASTIAN_NAVARRO_PRE507' },
    { id: 'mem_pre_12', name: 'Lucía Reyes', qrToken: 'QR_LUCIA_REYES_PRE508' },
    { id: 'mem_pre_13', name: 'Matías Peña', qrToken: 'QR_MATIAS_PENA_PRE509' },
    { id: 'mem_pre_14', name: 'Regina Cruz', qrToken: 'QR_REGINA_CRUZ_PRE510' },
  ]

  const createdExtraMembers = []
  for (const s of extraStudents) {
    const mem = await prisma.member.upsert({
      where: { qrToken: s.qrToken },
      update: {},
      create: {
        id: s.id,
        groupId: preescuela.id,
        name: s.name,
        isAuxiliar: false,
        roleSubtitle: 'Integrantes - Preescuela',
        qrToken: s.qrToken,
      },
    })
    createdExtraMembers.push(mem)
  }

  // 4. Asistencias
  const attendancesData: Array<{ memberId: string; sessionId: string; status: AttendanceStatus }> = [
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

  const sessionsList = [s1, s2, s3, s4]
  for (let idx = 0; idx < createdExtraMembers.length; idx++) {
    const mem = createdExtraMembers[idx]
    for (let sIdx = 0; sIdx < sessionsList.length; sIdx++) {
      const sess = sessionsList[sIdx]
      let status: AttendanceStatus = AttendanceStatus.PRESENT
      if ((idx + sIdx) % 7 === 0) status = AttendanceStatus.LATE
      else if ((idx + sIdx) % 9 === 0) status = AttendanceStatus.LATE_JUSTIFIED
      else if ((idx + sIdx) % 11 === 0) status = AttendanceStatus.ABSENT
      attendancesData.push({ memberId: mem.id, sessionId: sess.id, status })
    }
  }

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
  const existingAuditCount = await prisma.auditLog.count()
  if (existingAuditCount === 0) {
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
  }

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

