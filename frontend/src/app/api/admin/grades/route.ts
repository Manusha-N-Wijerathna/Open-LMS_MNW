import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const body = await request.json()
    const { name, display_order } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return jsonError('Grade name is required', 400)
    }

    const parsedOrder = typeof display_order === 'number' ? display_order : parseInt(display_order, 10) || 0

    const db = await getDbClient(request)

    const insertPayload = {
      name: name.trim(),
      display_order: parsedOrder,
    }

    const { data: grade, error } = await db
      .from('grades')
      .insert(insertPayload)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error creating grade in Supabase:', error)
      return jsonError(error.message || 'Failed to create grade', 500)
    }

    return NextResponse.json(grade || insertPayload, { status: 200 })
  } catch (err) {
    console.error('Unexpected error creating grade:', err)
    return jsonError('Invalid request body or server error', 400)
  }
}
