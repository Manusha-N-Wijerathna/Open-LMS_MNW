import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'
import { VALID_GRADE_LETTERS } from '@/lib/types/exam-result'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    const gradeIdParam = searchParams.get('grade_id')
    const searchParam = searchParams.get('search')

    let query = adminSupabase
      .from('exam_results')
      .select('*')
      .order('created_at', { ascending: false })

    if (gradeIdParam) {
      const gradeId = parseInt(gradeIdParam, 10)
      if (!isNaN(gradeId)) {
        query = query.eq('grade_id', gradeId)
      }
    }

    const { data, error } = await query

    if (error) {
      console.warn('Error fetching exam results for admin:', error.message)
      return NextResponse.json({ results: [] })
    }

    let formattedResults = (data || []).map((item: Record<string, unknown>) => {
      return {
        ...item,
        student_name: (item.student_name as string) || 'Candidate',
        institute: (item.institute as string) || null,
        marks: item.marks !== null && item.marks !== undefined ? Number(item.marks) : null,
        grade_letter: (item.grade_letter as string) || 'ab',
        term: (item.term as string) || '1st Term Evaluation',
        academic_year: (item.academic_year as number) || 2026,
      }
    })

    if (searchParam && searchParam.trim()) {
      const s = searchParam.trim().toLowerCase()
      formattedResults = formattedResults.filter((r: { student_name: string; institute: string | null; subject?: string }) => {
        return (
          r.student_name.toLowerCase().includes(s) ||
          (r.institute && r.institute.toLowerCase().includes(s)) ||
          (r.subject && r.subject.toLowerCase().includes(s))
        )
      })
    }

    return NextResponse.json({ results: formattedResults })
  } catch (err) {
    console.error('Unexpected error in GET /api/admin/exam-results:', err)
    return jsonError('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const body = await request.json()
    const {
      grade_id,
      student_name,
      name, // support either student_name or name
      institute,
      marks,
      grade_letter,
      subject,
      term,
      academic_year,
      remarks,
    } = body

    const resolvedName = (student_name || name || '').trim()
    if (!resolvedName) {
      return jsonError('Student / Candidate name is required', 400)
    }

    const numericGradeId = parseInt(grade_id, 10)
    if (isNaN(numericGradeId) || numericGradeId <= 0) {
      return jsonError('A valid grade must be selected', 400)
    }

    const normalizedLetter = (grade_letter || '').trim()
    const validLetters = [...VALID_GRADE_LETTERS, 'AB', 'A+', 'B+', 'C+']
    if (!normalizedLetter || !validLetters.some(l => l.toLowerCase() === normalizedLetter.toLowerCase())) {
      return jsonError('Valid Grade is required (A, B, C, S, W, or ab)', 400)
    }

    let parsedMarks: number | null = null
    if (marks !== undefined && marks !== null && marks !== '') {
      const num = Number(marks)
      if (!isNaN(num)) {
        parsedMarks = Math.max(0, Math.min(100, Math.round(num * 100) / 100))
      }
    }

    const resolvedLetter = normalizedLetter.toLowerCase() === 'ab' ? 'ab' : normalizedLetter.toUpperCase()

    const payload = {
      grade_id: numericGradeId,
      student_name: resolvedName,
      institute: institute?.trim() || null,
      marks: parsedMarks,
      grade_letter: resolvedLetter,
      subject: subject?.trim() || 'ICT',
      term: term?.trim() || '1st Term Evaluation',
      academic_year: academic_year ? Number(academic_year) : new Date().getFullYear(),
      remarks: remarks?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await adminSupabase
      .from('exam_results')
      .insert(payload)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('Error inserting exam result:', error)
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        return jsonError('Database schema update required: Please run the SQL migration in Supabase to add student_name and institute columns to exam_results.', 400)
      }
      return jsonError(error.message || 'Failed to save exam result', 500)
    }

    return NextResponse.json(data || payload, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/admin/exam-results:', err)
    return jsonError('Invalid request payload or server error', 400)
  }
}

