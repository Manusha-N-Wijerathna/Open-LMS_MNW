import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/auth/authorization'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const resolvedParams = await params
    const unitId = resolvedParams?.unitId
    const parsedUnitId = parseInt(unitId, 10)

    if (isNaN(parsedUnitId)) {
      return jsonError('Invalid unit ID', 400)
    }

    const db = await getDbClient(request)

    const { data: unit, error } = await db
      .from('units')
      .select('*, grades(id, name)')
      .eq('id', parsedUnitId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching unit:', error)
      return jsonError(error.message || 'Failed to fetch unit', 500)
    }

    if (!unit) {
      return jsonError('Unit not found', 404)
    }

    return NextResponse.json(unit)
  } catch (err) {
    console.error('Unexpected error fetching unit:', err)
    return jsonError('Internal server error', 500)
  }
}
