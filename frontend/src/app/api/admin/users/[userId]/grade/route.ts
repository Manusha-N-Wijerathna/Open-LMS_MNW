import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const resolvedParams = await params
    const userId = resolvedParams?.userId

    if (!userId) {
      return jsonError('User ID is required', 400)
    }

    const body = await request.json().catch(() => ({}))
    const rawGradeIds = body.grade_ids
    const rawGradeId = body.grade_id

    let finalGradeIds: number[] = []

    if (Array.isArray(rawGradeIds)) {
      finalGradeIds = rawGradeIds
        .map(n => (typeof n === 'number' ? n : parseInt(String(n), 10)))
        .filter(n => !isNaN(n))
    } else if (rawGradeId !== undefined && rawGradeId !== null && rawGradeId !== '') {
      const parsed = typeof rawGradeId === 'number' ? rawGradeId : parseInt(String(rawGradeId), 10)
      if (!isNaN(parsed)) {
        finalGradeIds = [parsed]
      }
    }

    // Deduplicate IDs
    finalGradeIds = Array.from(new Set(finalGradeIds))

    // If grades are selected, verify they all exist in the grades table
    if (finalGradeIds.length > 0) {
      const { data: existingGrades, error: gradeCheckErr } = await adminSupabase
        .from('grades')
        .select('id, name')
        .in('id', finalGradeIds)

      if (gradeCheckErr) {
        console.warn('Grade validation note:', gradeCheckErr.message)
      } else if (existingGrades) {
        const foundIds = new Set(existingGrades.map(g => g.id))
        finalGradeIds = finalGradeIds.filter(id => foundIds.has(id))
      }
    }

    const primaryGradeId = finalGradeIds.length > 0 ? finalGradeIds[0] : null

    // 1. Update public.profiles
    const updatePayload: { grade_id: number | null; grade_ids?: number[] } = {
      grade_id: primaryGradeId,
      grade_ids: finalGradeIds,
    }

    let { data: profile, error } = await adminSupabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select('*')
      .maybeSingle()

    // If update failed (e.g. if grade_ids column not yet added in DB), fallback to updating grade_id only
    if (error && error.message.includes('grade_ids')) {
      const fallbackRes = await adminSupabase
        .from('profiles')
        .update({ grade_id: primaryGradeId })
        .eq('id', userId)
        .select('*')
        .maybeSingle()
      profile = fallbackRes.data
      error = fallbackRes.error
    }

    // 2. Fallback to session db client if adminSupabase errored
    if (error) {
      const db = await getDbClient(request)
      const res = await db
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId)
        .select('*')
        .maybeSingle()

      if (res.data) {
        profile = res.data
        error = null
      } else if (res.error) {
        // Try fallback without grade_ids
        const fallbackRes = await db
          .from('profiles')
          .update({ grade_id: primaryGradeId })
          .eq('id', userId)
          .select('*')
          .maybeSingle()
        if (fallbackRes.data) {
          profile = fallbackRes.data
          error = null
        } else {
          error = res.error
        }
      }
    }

    // 3. Sync student_grades junction table if present
    try {
      await adminSupabase.from('student_grades').delete().eq('student_id', userId)
      if (finalGradeIds.length > 0) {
        const rowsToInsert = finalGradeIds.map(gid => ({
          student_id: userId,
          grade_id: gid,
        }))
        await adminSupabase.from('student_grades').insert(rowsToInsert)
      }
    } catch {
      // Ignore if student_grades table has not been created yet
    }

    if (error) {
      console.error('Error assigning grades to user:', error)
      return jsonError(error.message || 'Failed to update user grades in database', 500)
    }

    if (!profile) {
      return jsonError('User profile could not be found or updated', 404)
    }

    // Ensure grade_ids is present on return
    const returnedProfile = {
      ...profile,
      grade_ids: finalGradeIds,
      grade_id: primaryGradeId,
    }

    return NextResponse.json({
      message: finalGradeIds.length > 0
        ? `Successfully assigned ${finalGradeIds.length} grade(s) to student`
        : 'All grade assignments removed for student',
      profile: returnedProfile,
    })
  } catch (err) {
    console.error('Unexpected error in PATCH /api/admin/users/[userId]/grade:', err)
    return jsonError('Internal server error while assigning grades', 500)
  }
}
