import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as XLSX from 'xlsx'

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
        'Rol': member.isAuxiliar ? 'Auxiliar / Guía' : 'Integrante',
        'Subtítulo': member.roleSubtitle,
      }

      let presentCount = 0
      let lateCount = 0
      let absentCount = 0

      // Mapear cada sesión
      for (const session of sessions) {
        const att = member.attendances.find((a) => a.sessionId === session.id)
        let val = '-'
        if (att?.status === 'PRESENT') {
          val = '✓ Presente'
          presentCount++
        } else if (att?.status === 'LATE') {
          val = 'R Retardo'
          lateCount++
        } else if (att?.status === 'ABSENT') {
          val = '✗ Falta'
          absentCount++
        }
        row[session.label] = val
      }

      const totalEvaluated = presentCount + lateCount + absentCount
      const percentage = totalEvaluated > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalEvaluated) * 100) : 0

      row['Total Presentes'] = presentCount
      row['Total Retardos'] = lateCount
      row['Total Faltas'] = absentCount
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
      'Integrante': log.memberName,
      'Sesión': log.sessionName,
      'Estado Asignado':
        log.status === 'PRESENT' ? 'PRESENTE (✓)' : log.status === 'LATE' ? 'RETARDO (R)' : 'FALTA (✗)',
      'Fecha': new Intl.DateTimeFormat('es-MX', {
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

    // 5. Construir Libro Excel (Workbook)
    const workbook = XLSX.utils.book_new()

    // Crear y añadir Hoja 1
    const wsMatrix = XLSX.utils.json_to_sheet(matrixData)
    XLSX.utils.book_append_sheet(workbook, wsMatrix, 'Matriz de Asistencia')

    // Crear y añadir Hoja 2
    const wsAudit = XLSX.utils.json_to_sheet(auditData.length > 0 ? auditData : [{ Mensaje: 'Sin registros de auditoría' }])
    XLSX.utils.book_append_sheet(workbook, wsAudit, 'Historial de Marcas')

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

