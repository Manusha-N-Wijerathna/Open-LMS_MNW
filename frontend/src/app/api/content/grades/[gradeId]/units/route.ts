import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/auth/authorization'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  try {
    const resolvedParams = await params
    const gradeId = resolvedParams?.gradeId
    const parsedGradeId = parseInt(gradeId, 10)

    if (isNaN(parsedGradeId)) {
      return jsonError('Invalid grade ID', 400)
    }

    const db = await getDbClient(request)

    const { data: units, error } = await db
      .from('units')
      .select('*')
      .eq('grade_id', parsedGradeId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching units:', error)
      return jsonError(error.message || 'Failed to fetch units', 500)
    }

    return NextResponse.json(units || [])
  } catch (err) {
    console.error('Unexpected error fetching units:', err)
    return jsonError('Internal server error', 500)
  }
}
