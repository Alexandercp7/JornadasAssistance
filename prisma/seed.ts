import { PrismaClient, RoleType, AttendanceStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seed)...')

  // 1. Grupos (Preescuela, Escuela y Super Administrador)
  await prisma.group.upsert({
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

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. COORDINACIÓN ESCUELA - DATOS REALES DE AUXILIARES Y ASISTENCIAS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('🏫 Sembrando datos reales para Coordinación Escuela...')

  // Sesiones de Escuela
  // 19/09/2026, 26/09/2026, 4/10/2026 (No obligatoria), 5/10/2026, 6/10/2026 (No obligatoria), 17/10/2026
  const escuelaSessionsConfig = [
    { id: 'ses_esc_1', label: '19/Sep', date: '2026-09-19' },
    { id: 'ses_esc_2', label: '26/Sep', date: '2026-09-26' },
    { id: 'ses_esc_3', label: '04/Oct', date: '2026-10-04' },
    { id: 'ses_esc_4', label: '05/Oct', date: '2026-10-05' },
    { id: 'ses_esc_5', label: '06/Oct', date: '2026-10-06' },
    { id: 'ses_esc_6', label: '17/Oct', date: '2026-10-17' },
  ]

  const escuelaSessions = []
  for (const s of escuelaSessionsConfig) {
    const sessionRecord = await prisma.session.upsert({
      where: { id: s.id },
      update: { label: s.label, sessionDate: new Date(s.date) },
      create: {
        id: s.id,
        groupId: escuela.id,
        label: s.label,
        sessionDate: new Date(s.date),
      },
    })
    escuelaSessions.push(sessionRecord)
  }

  // 26 Auxiliares de Escuela y sus asistencias por sesión
  const auxiliaresEscuela: Array<{ name: string; token: string; asistencias: AttendanceStatus[] }> = [
    {
      name: 'Paulina Abreu',
      token: 'QR_ESC_PAULINA_ABREU',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Alexander Canto',
      token: 'QR_ESC_ALEXANDER_CANTO',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Nallely Pérez',
      token: 'QR_ESC_NALLELY_PEREZ',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT_JUSTIFIED,
        AttendanceStatus.ABSENT_JUSTIFIED,
        AttendanceStatus.ABSENT_JUSTIFIED,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Jimena Hernandez',
      token: 'QR_ESC_JIMENA_HERNANDEZ',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
      ],
    },
    {
      name: 'Diego Pino',
      token: 'QR_ESC_DIEGO_PINO',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Julián Alonzo',
      token: 'QR_ESC_JULIAN_ALONZO',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT_JUSTIFIED,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Julio García',
      token: 'QR_ESC_JULIO_GARCIA',
      asistencias: [
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Jairo Coronado',
      token: 'QR_ESC_JAIRO_CORONADO',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Estefanía Alcocer',
      token: 'QR_ESC_ESTEFANIA_ALCOCER',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Jorge Flores',
      token: 'QR_ESC_JORGE_FLORES',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Ximena Gutiérrez',
      token: 'QR_ESC_XIMENA_GUTIERREZ',
      asistencias: [
        AttendanceStatus.ABSENT_JUSTIFIED,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
      ],
    },
    {
      name: 'Emiliano Arceo',
      token: 'QR_ESC_EMILIANO_ARCEO',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT_JUSTIFIED,
        AttendanceStatus.ABSENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Jorge Chan',
      token: 'QR_ESC_JORGE_CHAN',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Getsemaní Alpuche',
      token: 'QR_ESC_GETSEMANI_ALPUCHE',
      asistencias: [
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Ángel Sánchez',
      token: 'QR_ESC_ANGEL_SANCHEZ',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT_JUSTIFIED,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Noemy Varguez',
      token: 'QR_ESC_NOEMY_VARGUEZ',
      asistencias: [
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.ABSENT_JUSTIFIED,
      ],
    },
    {
      name: 'Iván Pérez',
      token: 'QR_ESC_IVAN_PEREZ',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Saúl Flores',
      token: 'QR_ESC_SAUL_FLORES',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'América Chuc',
      token: 'QR_ESC_AMERICA_CHUC',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Pedro Góngora',
      token: 'QR_ESC_PEDRO_GONGORA',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Leonardo Mendoza',
      token: 'QR_ESC_LEONARDO_MENDOZA',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Sofía Pino',
      token: 'QR_ESC_SOFIA_PINO',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Adolfo Martin',
      token: 'QR_ESC_ADOLFO_MARTIN',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Erandy Tovar',
      token: 'QR_ESC_ERANDY_TOVAR',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Miguel Ramírez',
      token: 'QR_ESC_MIGUEL_RAMIREZ',
      asistencias: [
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT_JUSTIFIED,
        AttendanceStatus.EMPTY,
      ],
    },
    {
      name: 'Cynthia',
      token: 'QR_ESC_CYNTHIA',
      asistencias: [
        AttendanceStatus.ABSENT_JUSTIFIED,
        AttendanceStatus.ABSENT_JUSTIFIED,
        AttendanceStatus.ABSENT,
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.EMPTY,
      ],
    },
  ]

  for (let idx = 0; idx < auxiliaresEscuela.length; idx++) {
    const aux = auxiliaresEscuela[idx]
    const memberId = `mem_esc_${idx + 1}`

    const member = await prisma.member.upsert({
      where: { qrToken: aux.token },
      update: {
        name: aux.name,
        isAuxiliar: true,
        roleSubtitle: 'Auxiliares - Escuela',
        groupId: escuela.id,
      },
      create: {
        id: memberId,
        groupId: escuela.id,
        name: aux.name,
        isAuxiliar: true,
        roleSubtitle: 'Auxiliares - Escuela',
        qrToken: aux.token,
      },
    })

    for (let sIdx = 0; sIdx < escuelaSessions.length; sIdx++) {
      const sess = escuelaSessions[sIdx]
      const status = aux.asistencias[sIdx]
      const justification =
        status === AttendanceStatus.ABSENT_JUSTIFIED || status === AttendanceStatus.LATE_JUSTIFIED
          ? 'Justificado'
          : null

      await prisma.attendance.upsert({
        where: {
          memberId_sessionId: {
            memberId: member.id,
            sessionId: sess.id,
          },
        },
        update: {
          status,
          justification,
        },
        create: {
          memberId: member.id,
          sessionId: sess.id,
          status,
          justification,
        },
      })
    }
  }

  console.log('✅ Base de datos inicializada correctamente con los datos de Escuela.')
}

main()
  .catch((e) => {
    console.error('❌ Error al sembrar la base de datos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
