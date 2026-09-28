import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { AttendanceStatus } from '@prisma/client'

/** Convierte un AttendanceStatus al texto legible para Excel */
function statusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'PRESENT':
      return '✓ Presente'
    case 'LATE':
      return 'R Retardo'
    case 'LATE_JUSTIFIED':
      return 'RJ Retardo Just.'
    case 'ABSENT':
      return '✗ Falta'
    case 'ABSENT_JUSTIFIED':
      return 'FJ Falta Just.'
    default:
      return '-'
  }
}

function auditStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'PRESENT':
      return 'PRESENTE (✓)'
    case 'LATE':
      return 'RETARDO (R)'
    case 'LATE_JUSTIFIED':
      return 'RETARDO JUSTIFICADO (RJ)'
    case 'ABSENT':
      return 'FALTA (✗)'
    case 'ABSENT_JUSTIFIED':
      return 'FALTA JUSTIFICADA (FJ)'
    default:
      return '-'
  }
}

// GET /api/export/excel?groupId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('groupId')

    const groupWhere = groupId ? { id: groupId } : {}

    const group = await prisma.group.findFirst({
      where: groupWhere,
    })

    const effectiveGroupId = group?.id || undefined

    // 1. Obtener Sesiones
    const sessions = await prisma.session.findMany({
      where: effectiveGroupId ? { groupId: effectiveGroupId } : {},
      orderBy: { sessionDate: 'asc' },
    })

    // 2. Obtener Miembros y sus Asistencias
    const members = await prisma.member.findMany({
      where: effectiveGroupId ? { groupId: effectiveGroupId } : {},
      include: {
        attendances: true,
      },
      orderBy: [{ isAuxiliar: 'desc' }, { name: 'asc' }],
    })

    // 3. Pestaña 1: MATRIZ DE ASISTENCIA
    const matrixData = members.map((member) => {
      const row: Record<string, any> = {
        'Nombre del Integrante': member.name,
        Rol: member.isAuxiliar ? 'Auxiliar / Guía' : 'Integrante',
        Subtítulo: member.roleSubtitle,
      }

      let presentCount = 0
      let lateCount = 0
      let lateJustifiedCount = 0
      let absentCount = 0
      let absentJustifiedCount = 0

      // Mapear cada sesión
      for (const session of sessions) {
        const att = member.attendances.find((a) => a.sessionId === session.id)
        let val = '-'

        if (att?.status === 'PRESENT') {
          val = statusLabel('PRESENT')
          presentCount++
        } else if (att?.status === 'LATE') {
          val = statusLabel('LATE')
          lateCount++
        } else if (att?.status === 'LATE_JUSTIFIED') {
          val = statusLabel('LATE_JUSTIFIED')
          lateJustifiedCount++
        } else if (att?.status === 'ABSENT') {
          val = statusLabel('ABSENT')
          absentCount++
        } else if (att?.status === 'ABSENT_JUSTIFIED') {
          val = statusLabel('ABSENT_JUSTIFIED')
          absentJustifiedCount++
        }

        row[session.label] = val
      }

      const totalEvaluated =
        presentCount + lateCount + lateJustifiedCount + absentCount + absentJustifiedCount

      // Fórmula: presente=1pt, retardo=0.5pt, retardo_just=0.75pt, falta_just=0.25pt, falta=0pt
      const score =
        presentCount * 1 +
        lateCount * 0.5 +
        lateJustifiedCount * 0.75 +
        absentJustifiedCount * 0.25

      const percentage = totalEvaluated > 0 ? Math.round((score / totalEvaluated) * 100) : 0

      row['Total Presentes'] = presentCount
      row['Total Retardos'] = lateCount
      row['Total Retardos Just.'] = lateJustifiedCount
      row['Total Faltas'] = absentCount
      row['Total Faltas Just.'] = absentJustifiedCount
      row['% Asistencia'] = `${percentage}%`

      return row
    })

    // 4. Pestaña 2: HISTORIAL DE MARCAS / AUDITORÍA
    const auditLogs = await prisma.auditLog.findMany({
      where: effectiveGroupId ? { groupId: effectiveGroupId } : {},
      orderBy: { registeredAt: 'desc' },
      take: 500,
    })

    const auditData = auditLogs.map((log) => ({
      'ID Registro': log.id,
      Integrante: log.memberName,
      Sesión: log.sessionName,
      'Estado Asignado': auditStatusLabel(log.status),
      Justificación: log.justification || '',
      Fecha: new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(log.registeredAt)),
      'Hora Exacta': new Intl.DateTimeFormat('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date(log.registeredAt)),
      'Coordinador Responsable': log.coordinatorRole,
    }))

    // 5. Pestaña 3: JUSTIFICACIONES
    const justifications = await prisma.attendance.findMany({
      where: {
        ...(effectiveGroupId ? { member: { groupId: effectiveGroupId } } : {}),
        OR: [{ status: 'LATE_JUSTIFIED' }, { status: 'ABSENT_JUSTIFIED' }],
        justification: { not: null },
      },
      include: {
        member: { select: { name: true, roleSubtitle: true } },
        session: { select: { label: true, sessionDate: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const justifData = justifications.map((att) => ({
      Integrante: att.member.name,
      Rol: att.member.roleSubtitle,
      Sesión: att.session.label,
      'Fecha Sesión': new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(att.session.sessionDate)),
      'Tipo de Justificación':
        att.status === 'LATE_JUSTIFIED' ? 'Retardo Justificado' : 'Falta Justificada',
      Motivo: att.justification || '',
      'Última Actualización': new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(att.updatedAt)),
    }))

    // 6. Construir Libro Excel (Workbook)
    const workbook = XLSX.utils.book_new()

    // Crear y añadir Hoja 1
    const wsMatrix = XLSX.utils.json_to_sheet(matrixData)
    XLSX.utils.book_append_sheet(workbook, wsMatrix, 'Matriz de Asistencia')

    // Crear y añadir Hoja 2
    const wsAudit = XLSX.utils.json_to_sheet(
      auditData.length > 0 ? auditData : [{ Mensaje: 'Sin registros de auditoría' }],
    )
    XLSX.utils.book_append_sheet(workbook, wsAudit, 'Historial de Marcas')

    const wsJustif = XLSX.utils.json_to_sheet(
      justifData.length > 0 ? justifData : [{ Mensaje: 'Sin justificaciones registradas' }],
    )
    XLSX.utils.book_append_sheet(workbook, wsJustif, 'Justificaciones')

    // Generar Buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    const groupTitle = group?.customTitle ? group.customTitle.replace(/\s+/g, '_') : 'MJVC'
    const filename = `Asistencia_${groupTitle}_${new Date().toISOString().slice(0, 10)}.xlsx`

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error al generar Excel:', error)
    return NextResponse.json({ error: 'Error al generar reporte Excel' }, { status: 500 })
  }
}
