import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'
import { extractDriveFileId } from '@/lib/drive'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const examType = searchParams.get('exam_type')?.trim()
    const grade = searchParams.get('grade')?.trim()
    const subject = searchParams.get('subject')?.trim()
    const yearStr = searchParams.get('year')?.trim()
    const medium = searchParams.get('medium')?.trim()
    const paperType = searchParams.get('paper_type')?.trim()
    const isPublishedStr = searchParams.get('is_published')?.trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50))
    const offset = (page - 1) * limit

    const db = await getDbClient(request)
    let query = db
      .from('past_papers')
      .select('*', { count: 'exact' })
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
    if (isPublishedStr === 'true') {
      query = query.eq('is_published', true)
    } else if (isPublishedStr === 'false') {
      query = query.eq('is_published', false)
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
          warning: 'Database table "past_papers" does not exist yet in Supabase. Please run the migration SQL in your Supabase SQL Editor.'
        })
      }
      console.error('Error fetching admin past papers:', error)
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
    console.error('Unexpected error in admin past papers GET:', err)
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
      title,
      exam_type,
      grade,
      subject,
      year,
      medium,
      paper_type,
      drive_file_id,
      drive_url,
      is_published,
    } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return jsonError('Title is required', 400)
    }

    if (!exam_type || typeof exam_type !== 'string' || !exam_type.trim()) {
      return jsonError('Exam type is required', 400)
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return jsonError('Subject is required', 400)
    }

    const parsedYear = typeof year === 'number' ? year : parseInt(year, 10)
    if (isNaN(parsedYear) || parsedYear < 1990 || parsedYear > 2100) {
      return jsonError('Year must be a valid year between 1990 and 2100', 400)
    }

    if (!medium || typeof medium !== 'string' || !medium.trim()) {
      return jsonError('Medium is required', 400)
    }

    if (!paper_type || typeof paper_type !== 'string' || !paper_type.trim()) {
      return jsonError('Paper type is required', 400)
    }

    const rawDriveInput = drive_file_id || drive_url
    const extractedId = extractDriveFileId(rawDriveInput)
    if (!extractedId) {
      return jsonError('A valid Google Drive File ID or sharing link is required', 400)
    }

    const db = await getDbClient(request)

    const insertPayload = {
      title: title.trim(),
      exam_type: exam_type.trim(),
      grade: grade && typeof grade === 'string' && grade.trim() ? grade.trim() : null,
      subject: subject.trim(),
      year: parsedYear,
      medium: medium.trim(),
      paper_type: paper_type.trim(),
      drive_file_id: extractedId,
      is_published: Boolean(is_published),
      created_at: new Date().toISOString(),
    }

    const { data: createdPaper, error } = await db
      .from('past_papers')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST205') {
        return jsonError('Database table "past_papers" does not exist yet. Please run the SQL migration in your Supabase SQL Editor first.', 500)
      }
      console.error('Error inserting past paper:', error)
      return jsonError(error.message || 'Failed to create past paper', 500)
    }

    return NextResponse.json(
      {
        message: 'Past paper created successfully',
        data: createdPaper,
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    console.error('Unexpected error in admin past papers POST:', err)
    return jsonError('Internal server error', 500)
  }
}
