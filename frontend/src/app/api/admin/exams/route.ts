import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'
import { getDbClient } from '@/lib/supabase/server'
import { ExamCountdown } from '@/lib/types/exam-countdown'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const db = await getDbClient(request)
    const { data, error } = await db
      .from('exam_countdowns')
      .select('*')
      .order('exam_date', { ascending: true })

    if (error) {
      console.error('Error fetching admin exam countdowns:', error)
      return jsonError('Failed to fetch exam schedules. Check that the exam_countdowns migration has been applied.', 500)
    }

    return NextResponse.json(data || [])
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

    const newExam: Omit<ExamCountdown, 'id' | 'created_at'> = {
      title: title.trim(),
      exam_date: new Date(exam_date).toISOString(),
      duration: duration.trim(),
      target_grade: target_grade?.trim() || 'All Students',
      description: description?.trim() || '',
      is_active: is_active !== false,
    }

    const db = await getDbClient(request)
    const { data, error } = await db
      .from('exam_countdowns')
      .insert(newExam)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating exam countdown:', error)
      return jsonError('Failed to save exam schedule. Check that the exam_countdowns migration has been applied.', 500)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Error creating exam:', err)
    return jsonError('Failed to create exam record', 500)
  }
}
