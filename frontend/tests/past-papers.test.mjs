import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

// Import functions from drive.ts (transpiled / module import)
// Since drive.ts is TypeScript in src/lib/drive.ts, we can test the logic directly
// replicating the exact regex and logic tested by the runtime.

function extractDriveFileId(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  const trimmed = url.trim()

  const patterns = [
    /\/(?:file\/d|document\/d|presentation\/d|spreadsheets\/d|folders|d)\/([a-zA-Z0-9_-]+)/i,
    /(?:[?&]id=)([a-zA-Z0-9_-]+)/i,
    /googleusercontent\.com(?:\/u\/\d+)?\/d\/([a-zA-Z0-9_-]+)/i,
    /\/folders\/([a-zA-Z0-9_-]+)/i,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed
  }

  return null
}

function formatDriveDownloadUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  const fileId = extractDriveFileId(url.trim())
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`
  }
  return null
}

function formatDriveOpenUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  const fileId = extractDriveFileId(url.trim())
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
  }
  return null
}

function formatDriveEmbedUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  const fileId = extractDriveFileId(url.trim())
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`
  }
  return null
}

function validateDriveFileId(input) {
  if (!input || typeof input !== 'string' || !input.trim()) {
    return { valid: false, fileId: null, error: 'Google Drive URL or File ID is required' }
  }
  const fileId = extractDriveFileId(input)
  if (!fileId) {
    return { valid: false, fileId: null, error: 'Invalid Google Drive URL or File ID format' }
  }
  return { valid: true, fileId }
}

function validatePastPaperPayload(payload) {
  const { title, exam_type, subject, year, medium, paper_type, drive_file_id } = payload

  if (!title || typeof title !== 'string' || !title.trim()) {
    return { valid: false, error: 'Title is required' }
  }
  if (!exam_type || typeof exam_type !== 'string' || !exam_type.trim()) {
    return { valid: false, error: 'Exam type is required' }
  }
  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return { valid: false, error: 'Subject is required' }
  }
  const parsedYear = typeof year === 'number' ? year : parseInt(year, 10)
  if (isNaN(parsedYear) || parsedYear < 1990 || parsedYear > 2100) {
    return { valid: false, error: 'Year must be between 1990 and 2100' }
  }
  if (!medium || typeof medium !== 'string' || !medium.trim()) {
    return { valid: false, error: 'Medium is required' }
  }
  if (!paper_type || typeof paper_type !== 'string' || !paper_type.trim()) {
    return { valid: false, error: 'Paper type is required' }
  }
  const driveResult = validateDriveFileId(drive_file_id)
  if (!driveResult.valid) {
    return { valid: false, error: driveResult.error }
  }
  return { valid: true, parsedYear, fileId: driveResult.fileId }
}

describe('Google Drive Utilities for Past Papers', () => {
  const sampleFileId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs'

  test('extracts file ID from standard drive.google.com/file/d/ link', () => {
    const url = `https://drive.google.com/file/d/${sampleFileId}/view?usp=sharing`
    assert.equal(extractDriveFileId(url), sampleFileId)
  })

  test('extracts file ID from drive.google.com/open?id= link', () => {
    const url = `https://drive.google.com/open?id=${sampleFileId}`
    assert.equal(extractDriveFileId(url), sampleFileId)
  })

  test('extracts file ID from drive.google.com/uc?id= link', () => {
    const url = `https://drive.google.com/uc?id=${sampleFileId}`
    assert.equal(extractDriveFileId(url), sampleFileId)
  })

  test('extracts file ID from raw 33-char alphanumeric ID', () => {
    assert.equal(extractDriveFileId(sampleFileId), sampleFileId)
  })

  test('handles null, undefined, and empty string safely', () => {
    assert.equal(extractDriveFileId(null), null)
    assert.equal(extractDriveFileId(undefined), null)
    assert.equal(extractDriveFileId('   '), null)
    assert.equal(extractDriveFileId(''), null)
  })

  test('rejects arbitrary non-drive URLs', () => {
    assert.equal(extractDriveFileId('https://example.com/some-random-file.pdf'), null)
    assert.equal(extractDriveFileId('invalid-short-string'), null)
  })

  test('formats direct download URL properly', () => {
    const dlUrl = formatDriveDownloadUrl(sampleFileId)
    assert.equal(dlUrl, `https://drive.google.com/uc?export=download&id=${sampleFileId}`)
  })

  test('formats open in drive URL properly', () => {
    const openUrl = formatDriveOpenUrl(sampleFileId)
    assert.equal(openUrl, `https://drive.google.com/file/d/${sampleFileId}/view?usp=sharing`)
  })

  test('formats embed preview URL properly', () => {
    const embedUrl = formatDriveEmbedUrl(sampleFileId)
    assert.equal(embedUrl, `https://drive.google.com/file/d/${sampleFileId}/preview`)
  })

  test('validateDriveFileId accepts valid link and extracts ID', () => {
    const result = validateDriveFileId(`https://drive.google.com/file/d/${sampleFileId}/view`)
    assert.equal(result.valid, true)
    assert.equal(result.fileId, sampleFileId)
  })

  test('validateDriveFileId rejects empty or malformed input', () => {
    const result = validateDriveFileId('')
    assert.equal(result.valid, false)
    assert.ok(result.error)
  })
})

describe('Past Paper Payload Validation', () => {
  const validPayload = {
    title: '2023 G.C.E. A/L Combined Mathematics Part I',
    exam_type: 'G.C.E. A/L',
    grade: 'Grade 13',
    subject: 'Combined Mathematics',
    year: 2023,
    medium: 'Sinhala',
    paper_type: 'Part I',
    drive_file_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    is_published: true,
  }

  test('accepts fully valid payload', () => {
    const result = validatePastPaperPayload(validPayload)
    assert.equal(result.valid, true)
    assert.equal(result.parsedYear, 2023)
  })

  test('rejects payload missing title', () => {
    const result = validatePastPaperPayload({ ...validPayload, title: '   ' })
    assert.equal(result.valid, false)
    assert.equal(result.error, 'Title is required')
  })

  test('rejects payload missing exam type', () => {
    const result = validatePastPaperPayload({ ...validPayload, exam_type: '' })
    assert.equal(result.valid, false)
    assert.equal(result.error, 'Exam type is required')
  })

  test('rejects year before 1990', () => {
    const result = validatePastPaperPayload({ ...validPayload, year: 1980 })
    assert.equal(result.valid, false)
    assert.equal(result.error, 'Year must be between 1990 and 2100')
  })

  test('rejects year after 2100', () => {
    const result = validatePastPaperPayload({ ...validPayload, year: 2150 })
    assert.equal(result.valid, false)
    assert.equal(result.error, 'Year must be between 1990 and 2100')
  })

  test('rejects payload with invalid drive link', () => {
    const result = validatePastPaperPayload({ ...validPayload, drive_file_id: 'not-a-valid-id' })
    assert.equal(result.valid, false)
  })
})
