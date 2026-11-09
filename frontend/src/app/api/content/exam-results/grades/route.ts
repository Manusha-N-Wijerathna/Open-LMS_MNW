import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { getCurrentUser, jsonError } from '@/lib/auth/authorization'
import { GradeHubCardData } from '@/lib/types/exam-result'

export async function GET(request: NextRequest) {
  try {
    const auth = await getCurrentUser(request)
    const currentYear = new Date().getFullYear()

    // 1. Fetch grades from Supabase (using select('*') so it works before & after migration)
    const { data: gradesData, error: gradesError } = await adminSupabase
      .from('grades')
      .select('*')
      .order('display_order', { ascending: true })

    if (gradesError) {
      console.warn('Error fetching grades from database, using fallback curriculum:', gradesError.message)
    }

    // Default curriculum grades if database table is initially empty
    const nowIso = new Date().toISOString()
    const gradesList: Array<{ id: number; name: string; slug?: string; display_order?: number; created_at?: string }> = 
      gradesData && gradesData.length > 0 
        ? (gradesData as unknown as Array<{ id: number; name: string; slug?: string; display_order?: number; created_at?: string }>)
        : [
            { id: 1, name: 'Grade 6', slug: 'grade-6', display_order: 1, created_at: nowIso },
            { id: 2, name: 'Grade 7', slug: 'grade-7', display_order: 2, created_at: nowIso },
            { id: 3, name: 'Grade 8', slug: 'grade-8', display_order: 3, created_at: nowIso },
            { id: 4, name: 'Grade 9', slug: 'grade-9', display_order: 4, created_at: nowIso },
            { id: 5, name: 'Grade 10', slug: 'grade-10', display_order: 5, created_at: nowIso },
            { id: 6, name: 'Grade 11 (O/L)', slug: 'grade-11', display_order: 6, created_at: nowIso },
            { id: 7, name: 'Grade 12 (A/L)', slug: 'grade-12', display_order: 7, created_at: nowIso },
            { id: 8, name: 'Grade 13 (A/L)', slug: 'grade-13', display_order: 8, created_at: nowIso },
          ]

    // 2. Fetch active exams to aggregate terms and academic years
    let examsList: Array<{ id: string; term: string; academic_year: number; grade_id?: number | null }> = []
    try {
      const { data: examsData } = await adminSupabase
        .from('exams')
        .select('id, term, academic_year, grade_id, is_published')
        .eq('is_published', true)

      if (examsData) {
        examsList = examsData
      }
    } catch {
      // If exams table not yet queried or empty
      examsList = []
    }

    // 3. Check which grades have published results for this student (if authenticated)
    const userGradesWithResults = new Set<number>()
    if (auth?.user?.id) {
      try {
        const { data: studentResults } = await adminSupabase
          .from('exam_results')
          .select('grade_id')
          .eq('student_id', auth.user.id)

        if (studentResults) {
          studentResults.forEach(r => userGradesWithResults.add(r.grade_id))
        }
      } catch {
        // Table not ready or no records
      }
    }

    // 4. Construct enriched card data
    const cards: GradeHubCardData[] = gradesList.map((grade) => {
      // Find exams matching this specific grade or general exams
      const gradeExams = examsList.filter(e => !e.grade_id || e.grade_id === grade.id)
      
      const termsSet = new Set<string>()
      let maxYear = currentYear

      gradeExams.forEach(e => {
        if (e.term) termsSet.add(e.term)
        if (e.academic_year && e.academic_year > maxYear) maxYear = e.academic_year
      })

      const activeTerms = termsSet.size > 0 
        ? Array.from(termsSet) 
        : ['1st Term', '2nd Term', '3rd Term']

      const slug = grade.slug || grade.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      return {
        id: grade.id,
        name: grade.name,
        slug,
        display_order: grade.display_order ?? 0,
        created_at: grade.created_at,
        active_terms: activeTerms,
        academic_year: maxYear,
        total_exams: gradeExams.length,
        has_results: userGradesWithResults.has(grade.id),
      }
    })

    return NextResponse.json({
      grades: cards,
      authenticated: Boolean(auth?.user),
      student: auth?.user ? {
        id: auth.user.id,
        full_name: auth.profile?.full_name || auth.user.email?.split('@')[0] || 'Student',
      } : null
    })
  } catch (err) {
    console.error('Unexpected error in /api/content/exam-results/grades:', err)
    return jsonError('Internal server error', 500)
  }
}
