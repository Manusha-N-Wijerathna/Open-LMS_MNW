import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { getCurrentUser, jsonError } from '@/lib/auth/authorization'
import { ExamResult, GradeResultsResponse, matchTerm } from '@/lib/types/exam-result'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ gradeSlug: string; termSlug: string }> }
) {
  try {
    const { gradeSlug, termSlug } = await context.params

    if (!gradeSlug || !termSlug) {
      return jsonError('Invalid grade or term identifier', 400)
    }

    // 1. Auth context (public access permitted)
    const auth = await getCurrentUser(request)

    // 2. Fetch the corresponding grade record
    const { data: allGrades, error: gradesError } = await adminSupabase
      .from('grades')
      .select('*')

    if (gradesError) {
      console.warn('Error querying grades in termSlug route:', gradesError.message)
    }

    const matchedDbGrade = allGrades?.find((g: { id: number; name: string; slug?: string; display_order?: number; created_at?: string }) => {
      const gSlug = g.slug || g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const cleanedParam = gradeSlug.toLowerCase().replace(/[^a-z0-9]/g, '')
      const cleanedName = g.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      return (
        gSlug.toLowerCase() === gradeSlug.toLowerCase() ||
        String(g.id) === gradeSlug ||
        cleanedName === cleanedParam ||
        cleanedName.includes(cleanedParam)
      )
    })

    const grade = matchedDbGrade ? {
      id: matchedDbGrade.id,
      name: matchedDbGrade.name,
      slug: matchedDbGrade.slug || gradeSlug,
      display_order: matchedDbGrade.display_order ?? 0,
      created_at: matchedDbGrade.created_at || new Date().toISOString(),
    } : null

    if (!grade) {
      const fallbackName = gradeSlug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

      const emptyResponse: GradeResultsResponse = {
        grade: {
          id: 0,
          name: fallbackName,
          slug: gradeSlug,
          display_order: 0,
          created_at: new Date().toISOString()
        },
        results: [],
        student: auth?.user ? {
          id: auth.user.id,
          full_name: auth.profile?.full_name || auth.user.email?.split('@')[0] || 'Student',
          email: auth.user.email || null,
        } : null,
        summary: {
          total_subjects: 0,
          average_marks: 0,
          highest_marks: 0,
          lowest_marks: 0,
          passed_count: 0,
          distinction_count: 0,
          performance_status: 'Pending',
        }
      }
      return NextResponse.json(emptyResponse)
    }

    // 3. Query exam_results for this grade
    let rawResults: ExamResult[] = []
    try {
      const { data, error } = await adminSupabase
        .from('exam_results')
        .select('*')
        .eq('grade_id', grade.id)
        .order('marks', { ascending: false, nullsFirst: false })

      if (error) {
        console.warn('Error querying exam_results:', error.message)
      } else if (data) {
        rawResults = (data as unknown as Array<Record<string, unknown>>).map(item => ({
          id: String(item.id),
          grade_id: Number(item.grade_id),
          student_name: (item.student_name as string) || 'Candidate',
          institute: (item.institute as string) || null,
          marks: item.marks !== null && item.marks !== undefined ? Number(item.marks) : null,
          grade_letter: (item.grade_letter as string) || 'ab',
          subject: (item.subject as string) || 'ICT',
          term: (item.term as string) || '1st Term Evaluation',
          academic_year: (item.academic_year as number) || 2026,
          remarks: (item.remarks as string) || null,
          created_at: (item.created_at as string) || new Date().toISOString(),
        }))

        // In-memory sort by marks descending (highest first, null/ab at bottom)
        rawResults.sort((a, b) => {
          const marksA = a.marks !== null && a.marks !== undefined ? Number(a.marks) : -1
          const marksB = b.marks !== null && b.marks !== undefined ? Number(b.marks) : -1
          if (marksB !== marksA) {
            return marksB - marksA
          }
          return (a.student_name || '').localeCompare(b.student_name || '')
        })
      }
    } catch (queryErr) {
      console.warn('Exception querying exam_results for term:', queryErr)
      rawResults = []
    }

    // Filter strictly by the requested termSlug
    const displayResults = rawResults.filter(r => matchTerm(r.term, termSlug))

    // 4. Calculate summary statistics for this term
    const totalSubjects = displayResults.length
    let averageMarks = 0
    let highestMarks = 0
    let lowestMarks = 100
    let passedCount = 0
    let distinctionCount = 0

    if (totalSubjects > 0) {
      let sum = 0
      let scoredCount = 0
      lowestMarks = 100

      displayResults.forEach((r) => {
        if (r.marks !== null && r.marks !== undefined) {
          const m = Number(r.marks)
          sum += m
          scoredCount++
          if (m > highestMarks) highestMarks = m
          if (m < lowestMarks) lowestMarks = m
        }
        const letter = (r.grade_letter || '').trim().toUpperCase()
        if (['A', 'B', 'C', 'S', 'D'].includes(letter) || (r.marks !== null && r.marks !== undefined && r.marks >= 35)) {
          passedCount++
        }
        if (letter === 'A' || (r.marks !== null && r.marks !== undefined && r.marks >= 75)) {
          distinctionCount++
        }
      })

      averageMarks = scoredCount > 0 ? Math.round((sum / scoredCount) * 10) / 10 : 0
      if (scoredCount === 0) lowestMarks = 0
    } else {
      lowestMarks = 0
    }

    let performanceStatus: GradeResultsResponse['summary']['performance_status'] = 'Pending'
    if (totalSubjects > 0) {
      if (averageMarks >= 75) performanceStatus = 'Excellent'
      else if (averageMarks >= 60) performanceStatus = 'Good'
      else if (averageMarks >= 40) performanceStatus = 'Satisfactory'
      else performanceStatus = 'Needs Improvement'
    }

    const response: GradeResultsResponse = {
      grade: {
        id: grade.id,
        name: grade.name,
        slug: grade.slug || gradeSlug,
        display_order: grade.display_order,
        created_at: grade.created_at,
      },
      results: displayResults,
      student: auth?.user ? {
        id: auth.user.id,
        full_name: auth.profile?.full_name || auth.user.email?.split('@')[0] || 'Student',
        email: auth.user.email || null,
      } : null,
      summary: {
        total_subjects: totalSubjects,
        average_marks: averageMarks,
        highest_marks: highestMarks,
        lowest_marks: lowestMarks,
        passed_count: passedCount,
        distinction_count: distinctionCount,
        performance_status: performanceStatus,
      }
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Unexpected error in /api/content/exam-results/[gradeSlug]/[termSlug]:', err)
    return jsonError('Internal server error', 500)
  }
}

