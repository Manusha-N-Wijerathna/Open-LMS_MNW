import fs from 'fs'
import path from 'path'

export interface ExamItem {
  id: number
  title: string
  exam_date: string
  duration: string
  target_grade?: string
  description?: string
  is_active: boolean
  created_at: string
}

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'exams.json')

let memoryExams: ExamItem[] = [
  {
    id: 1,
    title: "G.C.E. O/L Examination - ICT",
    exam_date: "2026-12-10T08:30:00+05:30",
    duration: "3 Hours",
    target_grade: "Grade 11",
    description: "National Ordinary Level General Examination for Information & Communication Technology.",
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "G.C.E. A/L Examination - ICT",
    exam_date: "2027-08-18T08:30:00+05:30",
    duration: "3 Hours",
    target_grade: "A/L",
    description: "National Advanced Level Information & Communication Technology Theory and Structured Examination.",
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Grade 10 ICT Final Term Evaluation",
    exam_date: "2026-11-28T09:00:00+05:30",
    duration: "2 Hours",
    target_grade: "Grade 10",
    description: "Comprehensive province-level term assessment covering all curriculum modules.",
    is_active: true,
    created_at: new Date().toISOString()
  }
]

export function getExams(): ExamItem[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        memoryExams = parsed
        return memoryExams
      }
    }
  } catch (err) {
    console.warn('Could not read exams from file, using memory storage:', err)
  }
  return memoryExams
}

export function saveExams(exams: ExamItem[]): boolean {
  memoryExams = exams
  try {
    const dir = path.dirname(DATA_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(exams, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.warn('Could not save exams to file:', err)
    return false
  }
}
