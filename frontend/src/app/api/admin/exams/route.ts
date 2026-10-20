import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'
import { getExams, saveExams, ExamItem } from '@/lib/examsStorage'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const exams = getExams()
    return NextResponse.json(exams)
  } catch (err) {
    console.error('Error fetching admin exams:', err)
    return jsonError('Failed to fetch exams', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const body = await request.json()
    const { title, exam_date, duration, target_grade, description, is_active } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return jsonError('Exam title is required', 400)
    }

    if (!exam_date || isNaN(new Date(exam_date).getTime())) {
      return jsonError('Valid exam date & time is required', 400)
    }

    if (!duration || typeof duration !== 'string' || !duration.trim()) {
      return jsonError('Exam duration is required (e.g. 3 Hours)', 400)
    }

    const exams = getExams()
    const newId = exams.length > 0 ? Math.max(...exams.map(e => e.id)) + 1 : 1

    const newExam: ExamItem = {
      id: newId,
      title: title.trim(),
      exam_date: new Date(exam_date).toISOString(),
      duration: duration.trim(),
      target_grade: target_grade?.trim() || 'All Students',
      description: description?.trim() || '',
      is_active: is_active !== false,
      created_at: new Date().toISOString()
    }

    exams.push(newExam)
    saveExams(exams)

    return NextResponse.json(newExam, { status: 201 })
  } catch (err) {
    console.error('Error creating exam:', err)
    return jsonError('Failed to create exam record', 500)
  }
}
