export interface PastPaper {
  id: string
  title: string
  exam_type: string
  grade: string | null
  subject: string
  year: number
  medium: string
  paper_type: string
  drive_file_id: string
  is_published: boolean
  created_at: string
}

export type CreatePastPaperInput = Omit<PastPaper, 'id' | 'created_at'>

export type UpdatePastPaperInput = Partial<CreatePastPaperInput>

export interface PastPaperFilters {
  search?: string
  exam_type?: string
  grade?: string
  subject?: string
  year?: number | string
  medium?: string
  paper_type?: string
  is_published?: boolean | string
  page?: number
  limit?: number
}

export const EXAM_TYPES = [
  
  'G.C.E. A/L',
  'G.C.E. O/L',
] as const

export const COMMON_SUBJECTS = [
  
  'Information & Communication Technology (ICT)'
] as const

export const MEDIUMS = [
  'Sinhala',
  'English',
  'Tamil',
] as const

export const PAPER_TYPES = [
  'Part I',
  'Part II',
  'Part I & II',
  'Marking Scheme',
  'Model Paper',
  'Term Test Paper',
] as const

export const COMMON_GRADES = [
  'Grade 13',
  'Grade 12',
  'Grade 11',
  'Grade 10',
] as const
