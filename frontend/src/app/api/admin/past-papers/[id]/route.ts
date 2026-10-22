import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'
import { extractDriveFileId } from '@/lib/drive'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
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

    if (!id || !UUID_REGEX.test(id)) {
      return jsonError('Invalid past paper ID', 400)
    }

    const db = await getDbClient(request)
    const { data: paper, error } = await db
      .from('past_papers')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching past paper:', error)
      return jsonError(error.message || 'Failed to fetch past paper', 500)
    }

    if (!paper) {
      return jsonError('Past paper not found', 404)
    }

    return NextResponse.json({ data: paper })
  } catch (err: unknown) {
    console.error('Unexpected error in admin past paper GET [id]:', err)
    return jsonError('Internal server error', 500)
  }
}

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

    if (!id || !UUID_REGEX.test(id)) {
      return jsonError('Invalid past paper ID', 400)
    }

    const db = await getDbClient(request)

    // Check existing
    const { data: existingPaper, error: findError } = await db
      .from('past_papers')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existingPaper) {
      return jsonError('Past paper not found', 404)
    }

    const body = await request.json()
    const updatePayload: Record<string, unknown> = {}

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return jsonError('Title cannot be empty', 400)
      }
      updatePayload.title = body.title.trim()
    }

    if (body.exam_type !== undefined) {
      if (typeof body.exam_type !== 'string' || !body.exam_type.trim()) {
        return jsonError('Exam type cannot be empty', 400)
      }
      updatePayload.exam_type = body.exam_type.trim()
    }

    if (body.grade !== undefined) {
      updatePayload.grade = body.grade && typeof body.grade === 'string' && body.grade.trim() ? body.grade.trim() : null
    }

    if (body.subject !== undefined) {
      if (typeof body.subject !== 'string' || !body.subject.trim()) {
        return jsonError('Subject cannot be empty', 400)
      }
      updatePayload.subject = body.subject.trim()
    }

    if (body.year !== undefined) {
      const parsedYear = typeof body.year === 'number' ? body.year : parseInt(body.year, 10)
      if (isNaN(parsedYear) || parsedYear < 1990 || parsedYear > 2100) {
        return jsonError('Year must be between 1990 and 2100', 400)
      }
      updatePayload.year = parsedYear
    }

    if (body.medium !== undefined) {
      if (typeof body.medium !== 'string' || !body.medium.trim()) {
        return jsonError('Medium cannot be empty', 400)
      }
      updatePayload.medium = body.medium.trim()
    }

    if (body.paper_type !== undefined) {
      if (typeof body.paper_type !== 'string' || !body.paper_type.trim()) {
        return jsonError('Paper type cannot be empty', 400)
      }
      updatePayload.paper_type = body.paper_type.trim()
    }

    if (body.drive_file_id !== undefined || body.drive_url !== undefined) {
      const rawInput = body.drive_file_id || body.drive_url
      const extractedId = extractDriveFileId(rawInput)
      if (!extractedId) {
        return jsonError('A valid Google Drive File ID or sharing link is required', 400)
      }
      updatePayload.drive_file_id = extractedId
    }

    if (body.is_published !== undefined) {
      updatePayload.is_published = Boolean(body.is_published)
    }

    const { data: updatedPaper, error: updateError } = await db
      .from('past_papers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating past paper:', updateError)
      return jsonError(updateError.message || 'Failed to update past paper', 500)
    }

    return NextResponse.json({
      message: 'Past paper updated successfully',
      data: updatedPaper,
    })
  } catch (err: unknown) {
    console.error('Unexpected error in admin past paper PUT [id]:', err)
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

    if (!id || !UUID_REGEX.test(id)) {
      return jsonError('Invalid past paper ID', 400)
    }

    const db = await getDbClient(request)

    // Check if exists
    const { data: existing, error: checkError } = await db
      .from('past_papers')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (checkError || !existing) {
      return jsonError('Past paper not found', 404)
    }

    const { error: deleteError } = await db
      .from('past_papers')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting past paper:', deleteError)
      return jsonError(deleteError.message || 'Failed to delete past paper', 500)
    }

    return NextResponse.json({
      message: 'Past paper deleted successfully',
      id,
    })
  } catch (err: unknown) {
    console.error('Unexpected error in admin past paper DELETE [id]:', err)
    return jsonError('Internal server error', 500)
  }
}
