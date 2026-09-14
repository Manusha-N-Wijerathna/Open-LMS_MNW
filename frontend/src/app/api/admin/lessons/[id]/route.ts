import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'

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
    const id = resolvedParams?.id
    const lessonId = parseInt(id, 10)

    if (isNaN(lessonId)) {
      return jsonError('Invalid lesson ID', 400)
    }

    const db = await getDbClient(request)

    // Check if lesson exists
    const { data: existingLesson, error: findError } = await db
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .maybeSingle()

    if (findError || !existingLesson) {
      return jsonError('Lesson not found', 404)
    }

    const body = await request.json()
    const updateData: {
      title?: string
      description?: string | null
      thumbnail_url?: string | null
      drive_url?: string
      display_order?: number
    } = {}

    if (body.title !== undefined) updateData.title = typeof body.title === 'string' ? body.title.trim() : body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.thumbnail_url !== undefined) updateData.thumbnail_url = body.thumbnail_url
    if (body.drive_url !== undefined) updateData.drive_url = typeof body.drive_url === 'string' ? body.drive_url.trim() : body.drive_url
    if (body.display_order !== undefined) updateData.display_order = typeof body.display_order === 'number' ? body.display_order : parseInt(body.display_order, 10)

    const { data: updatedLesson, error: updateError } = await db
      .from('lessons')
      .update(updateData)
      .eq('id', lessonId)
      .select()
      .maybeSingle()

    if (updateError) {
      console.error('Error updating lesson:', updateError)
      return jsonError(updateError.message || 'Failed to update lesson', 500)
    }

    return NextResponse.json(updatedLesson || { ...existingLesson, ...updateData })
  } catch (err) {
    console.error('Unexpected error updating lesson:', err)
    return jsonError('Internal server error', 500)
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
    const id = resolvedParams?.id
    const lessonId = parseInt(id, 10)

    if (isNaN(lessonId)) {
      return jsonError('Invalid lesson ID', 400)
    }

    const db = await getDbClient(request)

    const { data: existingLesson, error: findError } = await db
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .maybeSingle()

    if (findError || !existingLesson) {
      return jsonError('Lesson not found', 404)
    }

    const { error: deleteError } = await db
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (deleteError) {
      console.error('Error deleting lesson:', deleteError)
      return jsonError(deleteError.message || 'Failed to delete lesson', 500)
    }

    return NextResponse.json({ message: 'Lesson deleted' })
  } catch (err) {
    console.error('Unexpected error deleting lesson:', err)
    return jsonError('Internal server error', 500)
  }
}
