import { NextResponse } from 'next/server'
import { getExams } from '@/lib/examsStorage'

export async function GET() {
  try {
    const exams = getExams()
    // Return only active exams ordered by exam_date ascending
    const activeExams = exams
      .filter(e => e.is_active)
      .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime())

    return NextResponse.json(activeExams)
  } catch (err) {
    console.error('Error fetching exams:', err)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}
