export interface ExamCountdown {
  id: number
  title: string
  exam_date: string
  duration: string
  target_grade: string
  description: string
  is_active: boolean
  created_at: string
}

export type ExamCountdownUpdate = Partial<
  Pick<ExamCountdown, 'title' | 'exam_date' | 'duration' | 'target_grade' | 'description' | 'is_active'>
>
