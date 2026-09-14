/**
 * Utility helper functions for Google Drive URLs and Image Thumbnails
 */

export function extractDriveFileId(url?: string | null): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  const trimmed = url.trim()

  // Match Google Drive file ID from common patterns:
  // - https://drive.google.com/file/d/FILE_ID/view...
  // - https://drive.google.com/file/u/0/d/FILE_ID/...
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  // - https://drive.google.com/thumbnail?id=FILE_ID
  // - https://lh3.googleusercontent.com/d/FILE_ID
  // - https://docs.google.com/document/d/FILE_ID/...
  // - https://docs.google.com/presentation/d/FILE_ID/...
  // - https://docs.google.com/spreadsheets/d/FILE_ID/...
  // - https://drive.google.com/drive/folders/FILE_ID
  const patterns = [
    /\/(?:file\/d|document\/d|presentation\/d|spreadsheets\/d|folders|d)\/([a-zA-Z0-9_-]+)/i,
    /(?:[?&]id=)([a-zA-Z0-9_-]+)/i,
    /googleusercontent\.com(?:\/u\/\d+)?\/d\/([a-zA-Z0-9_-]+)/i,
    /\/folders\/([a-zA-Z0-9_-]+)/i
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  // If it's already a plain alphanumeric ID (length ~ 25-50 chars)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed
  }

  return null
}

export function formatDriveThumbnail(url?: string | null, size: number = 1000): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  const trimmed = url.trim()

  const fileId = extractDriveFileId(trimmed)
  if (fileId) {
    // Google Drive direct high-resolution thumbnail endpoint
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`
  }

  return trimmed
}

export function formatDriveDirectUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  const trimmed = url.trim()

  const fileId = extractDriveFileId(trimmed)
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`
  }

  return trimmed
}

export function formatDriveEmbedUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  const trimmed = url.trim()

  const fileId = extractDriveFileId(trimmed)
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`
  }

  return trimmed
}

export function getLessonThumbnail(thumbnailUrl?: string | null, driveUrl?: string | null, size: number = 1000): string | null {
  if (thumbnailUrl && thumbnailUrl.trim()) {
    return formatDriveThumbnail(thumbnailUrl, size)
  }
  if (driveUrl && driveUrl.trim()) {
    return formatDriveThumbnail(driveUrl, size)
  }
  return null
}
