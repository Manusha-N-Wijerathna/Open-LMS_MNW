import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/auth/authorization'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams?.id

    if (!id || !UUID_REGEX.test(id)) {
      return jsonError('Invalid past paper ID', 400)
    }

    const db = await getDbClient(request)

    // Strictly enforce is_published = true for public access
    const { data: paper, error } = await db
      .from('past_papers')
      .select('id, title, exam_type, grade, subject, year, medium, paper_type, drive_file_id, is_published, created_at')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST205') {
        return jsonError('Past paper not found', 404)
      }
      console.error('Error fetching public past paper:', error)
      return jsonError(error.message || 'Failed to fetch past paper', 500)
    }

    if (!paper) {
      return jsonError('Past paper not found', 404)
    }

    return NextResponse.json({ data: paper })
  } catch (err: unknown) {
    console.error('Unexpected error in public past paper GET [id]:', err)
    return jsonError('Internal server error', 500)
  }
}
