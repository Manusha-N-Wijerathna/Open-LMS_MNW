import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'
import { getDbClient } from '@/lib/supabase/server'
import { ExamCountdownUpdate } from '@/lib/types/exam-countdown'

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
    const updates: ExamCountdownUpdate = {}

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return jsonError('Exam title cannot be empty', 400)
      }
      updates.title = body.title.trim()
    }
    if (body.exam_date !== undefined) {
      const examDate = new Date(body.exam_date)
      if (isNaN(examDate.getTime())) {
        return jsonError('Valid exam date & time is required', 400)
      }
      updates.exam_date = examDate.toISOString()
    }
    if (body.duration !== undefined) {
      if (typeof body.duration !== 'string' || !body.duration.trim()) {
        return jsonError('Exam duration cannot be empty', 400)
      }
      updates.duration = body.duration.trim()
    }
    if (body.target_grade !== undefined) {
      updates.target_grade = typeof body.target_grade === 'string' ? body.target_grade.trim() : 'All Students'
    }
    if (body.description !== undefined) {
      updates.description = typeof body.description === 'string' ? body.description.trim() : ''
    }
    if (body.is_active !== undefined) {
      if (typeof body.is_active !== 'boolean') {
        return jsonError('Exam active status must be a boolean', 400)
      }
      updates.is_active = body.is_active
    }
    if (Object.keys(updates).length === 0) {
      return jsonError('At least one exam field must be provided', 400)
    }

    const db = await getDbClient(request)
    const { data, error } = await db
      .from('exam_countdowns')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('Error updating exam countdown:', error)
      return jsonError('Failed to update exam schedule', 500)
    }
    if (!data) {
      return jsonError('Exam not found', 404)
    }
    return NextResponse.json(data)
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

    const db = await getDbClient(request)
    const { data, error } = await db
      .from('exam_countdowns')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('Error deleting exam countdown:', error)
      return jsonError('Failed to delete exam schedule', 500)
    }
    if (!data) {
      return jsonError('Exam not found', 404)
    }

    return NextResponse.json({ success: true, message: 'Exam deleted successfully' })
  } catch (err) {
    console.error('Error deleting exam:', err)
    return jsonError('Failed to delete exam', 500)
  }
}
