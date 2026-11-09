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

