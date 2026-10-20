import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'
import { getExams, saveExams } from '@/lib/examsStorage'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id, 10)
    if (isNaN(id)) {
      return jsonError('Invalid exam ID', 400)
    }

    const body = await request.json()
    const { title, exam_date, duration, target_grade, description, is_active } = body

    const exams = getExams()
    const index = exams.findIndex(e => e.id === id)
    if (index === -1) {
      return jsonError('Exam not found', 404)
    }

    if (title && typeof title === 'string') {
      exams[index].title = title.trim()
    }
    if (exam_date && !isNaN(new Date(exam_date).getTime())) {
      exams[index].exam_date = new Date(exam_date).toISOString()
    }
    if (duration && typeof duration === 'string') {
      exams[index].duration = duration.trim()
    }
    if (target_grade !== undefined) {
      exams[index].target_grade = target_grade?.trim() || 'All Students'
    }
    if (description !== undefined) {
      exams[index].description = description?.trim() || ''
    }
    if (is_active !== undefined) {
      exams[index].is_active = Boolean(is_active)
    }

    saveExams(exams)
    return NextResponse.json(exams[index])
  } catch (err) {
    console.error('Error updating exam:', err)
    return jsonError('Failed to update exam', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id, 10)
    if (isNaN(id)) {
      return jsonError('Invalid exam ID', 400)
    }

    const exams = getExams()
    const filtered = exams.filter(e => e.id !== id)
    if (filtered.length === exams.length) {
      return jsonError('Exam not found', 404)
    }

    saveExams(filtered)
    return NextResponse.json({ success: true, message: 'Exam deleted successfully' })
  } catch (err) {
    console.error('Error deleting exam:', err)
    return jsonError('Failed to delete exam', 500)
  }
}
