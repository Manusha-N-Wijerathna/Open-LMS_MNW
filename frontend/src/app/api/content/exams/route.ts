import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/auth/authorization'

export async function GET(request: NextRequest) {
  try {
    const db = await getDbClient(request)
    const { data, error } = await db
      .from('exam_countdowns')
      .select('*')
      .eq('is_active', true)
      .order('exam_date', { ascending: true })

    if (error) {
      console.error('Error fetching public exam countdowns:', error)
      return jsonError('Failed to fetch exam schedules. Check that the exam_countdowns migration has been applied.', 500)
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Error fetching exams:', err)
    return jsonError('Failed to fetch exam schedules', 500)
  }
}
