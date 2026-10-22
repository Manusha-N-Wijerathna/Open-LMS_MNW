import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/auth/authorization'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const examType = searchParams.get('exam_type')?.trim()
    const grade = searchParams.get('grade')?.trim()
    const subject = searchParams.get('subject')?.trim()
    const yearStr = searchParams.get('year')?.trim()
    const medium = searchParams.get('medium')?.trim()
    const paperType = searchParams.get('paper_type')?.trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10) || 12))
    const offset = (page - 1) * limit

    const db = await getDbClient(request)

    // Strictly enforce is_published = true for public listing
    let query = db
      .from('past_papers')
      .select('id, title, exam_type, grade, subject, year, medium, paper_type, drive_file_id, is_published, created_at', { count: 'exact' })
      .eq('is_published', true)
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`title.ilike.%${search}%,subject.ilike.%${search}%`)
    }
    if (examType) {
      query = query.eq('exam_type', examType)
    }
    if (grade) {
      query = query.eq('grade', grade)
    }
    if (subject) {
      query = query.eq('subject', subject)
    }
    if (yearStr) {
      const year = parseInt(yearStr, 10)
      if (!isNaN(year)) query = query.eq('year', year)
    }
    if (medium) {
      query = query.eq('medium', medium)
    }
    if (paperType) {
      query = query.eq('paper_type', paperType)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('public.past_papers table does not exist in Supabase yet. Please execute migration SQL.')
        return NextResponse.json({
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          warning: 'The past_papers table has not been created yet in Supabase.'
        })
      }
      console.error('Error fetching public past papers:', error)
      return jsonError(error.message || 'Failed to fetch past papers', 500)
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    })
  } catch (err: unknown) {
    console.error('Unexpected error in public past papers GET:', err)
    return jsonError('Internal server error', 500)
  }
}
