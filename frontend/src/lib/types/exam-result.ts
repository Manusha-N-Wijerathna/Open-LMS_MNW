export interface Grade {
  id: number
  name: string
  slug: string
  display_order?: number
  created_at?: string
  // Dynamic fields aggregated for the Grade Hub card view
  active_terms?: string[]
  academic_year?: number
  total_exams?: number
}

export interface Exam {
  id: string
  title: string
  term: string
  academic_year: number
  grade_id?: number | null
  is_published?: boolean
  created_at?: string
}

export const VALID_GRADE_LETTERS = ['A', 'B', 'C', 'S', 'W', 'ab'] as const
export type ValidGradeLetter = typeof VALID_GRADE_LETTERS[number]

export interface ExamResult {
  id: string
  grade_id: number
  student_name: string
  institute?: string | null
  marks: number | null
  grade_letter: string
  subject?: string
  term?: string
  academic_year?: number
  remarks?: string | null
  created_at: string
  updated_at?: string
  student_id?: string | null
  exam_id?: string | null
  student?: {
    id: string
    full_name: string | null
  } | null
  profiles?: {
    id: string
    full_name: string | null
  } | null
  // Joined relation fields
  exams?: Exam | null
  grades?: Grade | null
}

export interface GradeResultsResponse {
  grade: Grade
  results: ExamResult[]
  student: {
    id: string
    full_name: string | null
    email?: string | null
  } | null
  summary: {
    total_subjects: number
    average_marks: number
    highest_marks: number
    lowest_marks: number
    passed_count: number
    distinction_count: number
    performance_status: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement' | 'Pending'
  }
}

export interface GradeHubCardData extends Grade {
  active_terms: string[]
  academic_year: number
  total_exams: number
  has_results?: boolean
}

export interface TermCardData {
  term: string
  slug: string
  academic_year: number
  total_candidates: number
  average_marks: number
  highest_marks: number
  lowest_marks: number
  passed_count: number
  distinction_count: number
  pass_rate: number
  subjects: string[]
}

// Helpers for Term slugification and matching
export function slugifyTerm(term: string): string {
  if (!term) return 'term'
  let s = term.toLowerCase().trim()
  s = s.replace(/\b1st\b/g, 'first')
       .replace(/\b2nd\b/g, 'second')
       .replace(/\b3rd\b/g, 'third')
       .replace(/\b4th\b/g, 'fourth')
  return s.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'term'
}

export function getTermSlug(term: string): string {
  if (!term) return 'term'
  const lower = term.toLowerCase().trim()
  if ((lower.includes('1st') || lower.includes('first')) && lower.includes('term') && !lower.includes('2nd') && !lower.includes('3rd')) {
    return 'first-term'
  }
  if ((lower.includes('2nd') || lower.includes('second')) && lower.includes('term')) {
    return 'second-term'
  }
  if ((lower.includes('3rd') || lower.includes('third')) && lower.includes('term')) {
    return 'third-term'
  }
  return slugifyTerm(term)
}

export function matchTerm(candidateTerm: string | undefined | null, targetSlug: string): boolean {
  if (!candidateTerm || !targetSlug) return false
  const c = candidateTerm.trim()
  const genSlug = getTermSlug(c)
  const directSlug = slugifyTerm(c)
  const rawSlug = c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const cleanTarget = targetSlug.toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanCandidate = c.toLowerCase().replace(/[^a-z0-9]/g, '')

  if (genSlug === targetSlug || directSlug === targetSlug || rawSlug === targetSlug) {
    return true
  }

  if (cleanCandidate === cleanTarget) {
    return true
  }

  // Handle ordinal normalization (e.g. "first" <-> "1st")
  const normTarget = cleanTarget
    .replace(/first/g, '1st')
    .replace(/second/g, '2nd')
    .replace(/third/g, '3rd')
  const normCandidate = cleanCandidate
    .replace(/first/g, '1st')
    .replace(/second/g, '2nd')
    .replace(/third/g, '3rd')

  if (normCandidate === normTarget) return true
  if (normCandidate.includes(normTarget) || normTarget.includes(normCandidate)) return true

  // Check prefix / startsWith
  if (genSlug.startsWith(targetSlug) || targetSlug.startsWith(genSlug)) return true
  if (directSlug.startsWith(targetSlug) || targetSlug.startsWith(directSlug)) return true
  if (rawSlug.startsWith(targetSlug) || targetSlug.startsWith(rawSlug)) return true

  return false
}

