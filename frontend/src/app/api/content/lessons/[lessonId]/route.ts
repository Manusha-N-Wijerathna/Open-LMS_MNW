import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/auth/authorization'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {

  try {
    const resolvedParams = await params
    const lessonId = resolvedParams?.lessonId
    const parsedLessonId = parseInt(lessonId, 10)

    if (isNaN(parsedLessonId)) {
      return jsonError('Invalid lesson ID', 400)
    }

    const db = await getDbClient(request)

    const { data: lesson, error } = await db
      .from('lessons')
      .select('*')
      .eq('id', parsedLessonId)
      .maybeSingle()

    if (error || !lesson) {
      return jsonError('Lesson not found', 404)
    }

    return NextResponse.json(lesson)
  } catch (err) {
    console.error('Unexpected error fetching lesson:', err)
    return jsonError('Internal server error', 500)
  }
}
