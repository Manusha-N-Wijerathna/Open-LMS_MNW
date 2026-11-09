import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'
import { VALID_GRADE_LETTERS } from '@/lib/types/exam-result'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const { id } = await context.params
    if (!id) {
      return jsonError('Invalid exam result ID', 400)
    }

    const body = await request.json()
    const {
      student_name,
      name,
      institute,
      marks,
      grade_letter,
      subject,
      term,
      academic_year,
      remarks,
      grade_id,
    } = body

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (student_name !== undefined || name !== undefined) {
      const resolvedName = (student_name || name || '').trim()
      if (!resolvedName) {
        return jsonError('Student name cannot be empty', 400)
      }
      updatePayload.student_name = resolvedName
    }

    if (institute !== undefined) {
      updatePayload.institute = institute?.trim() || null
    }

    if (marks !== undefined) {
      if (marks === null || marks === '') {
        updatePayload.marks = null
      } else {
        const num = Number(marks)
        if (!isNaN(num)) {
          updatePayload.marks = Math.max(0, Math.min(100, Math.round(num * 100) / 100))
        }
      }
    }

    if (grade_letter !== undefined) {
      const normalizedLetter = (grade_letter || '').trim()
      const validLetters = [...VALID_GRADE_LETTERS, 'AB', 'A+', 'B+', 'C+']
      if (!validLetters.some(l => l.toLowerCase() === normalizedLetter.toLowerCase())) {
        return jsonError('Valid Grade is required (A, B, C, S, W, or ab)', 400)
      }
      updatePayload.grade_letter = normalizedLetter.toLowerCase() === 'ab' ? 'ab' : normalizedLetter.toUpperCase()
    }

    if (subject !== undefined) {
      updatePayload.subject = subject.trim() || 'ICT'
    }

    if (term !== undefined) {
      updatePayload.term = term.trim() || '1st Term Evaluation'
    }

    if (academic_year !== undefined) {
      updatePayload.academic_year = Number(academic_year) || new Date().getFullYear()
    }

    if (remarks !== undefined) {
      updatePayload.remarks = remarks?.trim() || null
    }

    if (grade_id !== undefined) {
      const numGradeId = parseInt(grade_id, 10)
      if (!isNaN(numGradeId) && numGradeId > 0) {
        updatePayload.grade_id = numGradeId
      }
    }

    const { data, error } = await adminSupabase
      .from('exam_results')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error updating exam result:', error)
      return jsonError(error.message || 'Failed to update exam result', 500)
    }

    return NextResponse.json(data || { id, ...updatePayload })
  } catch (err) {
    console.error('Unexpected error in PUT /api/admin/exam-results/[id]:', err)
    return jsonError('Invalid request payload or server error', 400)
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const { id } = await context.params
    if (!id) {
      return jsonError('Invalid exam result ID', 400)
    }

    const { error } = await adminSupabase
      .from('exam_results')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting exam result:', error)
      return jsonError(error.message || 'Failed to delete exam result', 500)
    }

    return NextResponse.json({ success: true, message: 'Exam result deleted successfully' })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/admin/exam-results/[id]:', err)
    return jsonError('Internal server error', 500)
  }
}

