'use client'

import React, { useState, useRef, useMemo } from 'react'
import api from '@/lib/api'
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  FolderPlus,
  HelpCircle,
  ExternalLink
} from 'lucide-react'

export interface ParsedLessonRow {
  index: number
  title: string
  drive_url: string
  description: string
  display_order: string
  thumbnail_url: string
  isValid: boolean
  errorReason?: string
}

interface UnitOption {
  id: number
  name: string
  grade_id: number
}

interface BulkLessonUploadModalProps {
  isOpen: boolean
  onClose: () => void
  selectedGradeId: number | null
  gradeName?: string
  selectedUnitId: number | null
  units: UnitOption[]
  onSuccess: (count: number, unitId: number) => void
  onToast: (message: string, type: 'success' | 'error' | 'info') => void
}

/**
 * Robust CSV parser that handles quotes, escaped quotes, and newlines
 */
function parseCSV(text: string): string[][] {
  const lines: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  // Normalize line breaks
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i]
    const nextChar = normalized[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentField += '"'
          i++
        } else {
          // End of quote
          inQuotes = false
        }
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        currentRow.push(currentField.trim())
        currentField = ''
      } else if (char === '\n') {
        currentRow.push(currentField.trim())
        // Avoid adding purely empty rows at end
        if (currentRow.some(col => col.length > 0)) {
          lines.push(currentRow)
        }
        currentRow = []
        currentField = ''
      } else {
        currentField += char
      }
    }
  }

  // Push last field/row if not empty
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some(col => col.length > 0)) {
      lines.push(currentRow)
    }
  }

  return lines
}

export function BulkLessonUploadModal({
  isOpen,
  onClose,
  gradeName,
  selectedUnitId,
  units,
  onSuccess,
  onToast,
}: BulkLessonUploadModalProps) {
  const [selectedUnitOverride, setSelectedUnitOverride] = useState<number | null>(null)
  const targetUnitId = selectedUnitOverride ?? selectedUnitId ?? (units.length > 0 ? units[0].id : null)
  const [file, setFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedLessonRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'errors'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const header = 'title,drive_url,description,display_order,thumbnail_url\n'
    const sample1 = '"Lesson 01 - Introduction to the Topic","https://drive.google.com/file/d/1EXAMPLE_DRIVE_ID_ABCDEF/view","Comprehensive introduction and basic concepts",1,""\n'
    const sample2 = '"Lesson 02 - Core Principles and Practical Analysis","https://drive.google.com/file/d/2EXAMPLE_DRIVE_ID_GHIJKL/view","Step-by-step practical walk-through",2,""\n'
    const sample3 = '"Lesson 03 - Past Paper Discussion & Model Questions","https://drive.google.com/file/d/3EXAMPLE_DRIVE_ID_MNOPQR/view","Review of typical questions and answers",3,""\n'

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + sample1 + sample2 + sample3)
    const link = document.createElement('a')
    link.setAttribute('href', csvContent)
    link.setAttribute('download', 'lessons_bulk_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Parse file when selected
  const handleProcessFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.txt')) {
      setParseError('Please select a valid .csv file.')
      return
    }

    setFile(selectedFile)
    setParseError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        if (!text || !text.trim()) {
          setParseError('The selected CSV file is empty.')
          setParsedRows([])
          return
        }

        const rawGrid = parseCSV(text)
        if (rawGrid.length < 2) {
          setParseError('CSV must contain a header row followed by at least one lesson row.')
          setParsedRows([])
          return
        }

        // Header mapping
        const headers = rawGrid[0].map(h => h.toLowerCase().replace(/[\s_-]+/g, ''))
        const titleIdx = headers.findIndex(h => h.includes('title') || h === 'name' || h === 'topic')
        const driveUrlIdx = headers.findIndex(h => h.includes('drive') || h.includes('url') || h.includes('link'))
        const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('detail') || h.includes('summary'))
        const orderIdx = headers.findIndex(h => h.includes('order') || h === 'no' || h === 'num')
        const thumbIdx = headers.findIndex(h => h.includes('thumb') || h.includes('image'))

        if (titleIdx === -1 || driveUrlIdx === -1) {
          setParseError('Could not find required columns in CSV header. Ensure headers include "title" and "drive_url".')
          setParsedRows([])
          return
        }

        const rows: ParsedLessonRow[] = []

        for (let i = 1; i < rawGrid.length; i++) {
          const rowData = rawGrid[i]
          if (rowData.length === 0 || rowData.every(col => !col.trim())) {
            continue
          }

          const title = (rowData[titleIdx] || '').trim()
          const drive_url = (rowData[driveUrlIdx] || '').trim()
          const description = descIdx !== -1 ? (rowData[descIdx] || '').trim() : ''
          const display_order = orderIdx !== -1 ? (rowData[orderIdx] || '').trim() : ''
          const thumbnail_url = thumbIdx !== -1 ? (rowData[thumbIdx] || '').trim() : ''

          let isValid = true
          let errorReason = ''

          if (!title) {
            isValid = false
            errorReason = 'Missing title'
          } else if (!drive_url) {
            isValid = false
            errorReason = 'Missing Drive URL'
          }

          rows.push({
            index: i,
            title,
            drive_url,
            description,
            display_order,
            thumbnail_url,
            isValid,
            errorReason,
          })
        }

        if (rows.length === 0) {
          setParseError('No lesson rows found in file.')
        }

        setParsedRows(rows)
      } catch (err: unknown) {
        console.error('Error parsing CSV:', err)
        setParseError('Failed to parse CSV file. Please verify the format.')
        setParsedRows([])
      }
    }

    reader.onerror = () => {
      setParseError('Failed to read file from your device.')
    }

    reader.readAsText(selectedFile)
  }

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0])
    }
  }

  // Stats
  const validCount = useMemo(() => parsedRows.filter(r => r.isValid).length, [parsedRows])
  const errorCount = useMemo(() => parsedRows.filter(r => !r.isValid).length, [parsedRows])

  // Filtered rows for table
  const displayedRows = useMemo(() => {
    if (filterMode === 'valid') return parsedRows.filter(r => r.isValid)
    if (filterMode === 'errors') return parsedRows.filter(r => !r.isValid)
    return parsedRows
  }, [parsedRows, filterMode])

  // Submit Bulk Upload
  const handleConfirmUpload = async () => {
    if (!targetUnitId) {
      onToast('Please select a target unit for these lessons', 'error')
      return
    }

    const validLessons = parsedRows.filter(r => r.isValid).map((r, i) => ({
      title: r.title,
      drive_url: r.drive_url,
      description: r.description || null,
      thumbnail_url: r.thumbnail_url || null,
      display_order: r.display_order ? parseInt(r.display_order, 10) || i : undefined,
    }))

    if (validLessons.length === 0) {
      onToast('No valid lessons available to upload', 'error')
      return
    }

    setUploading(true)
    try {
      const res = await api.post('/admin/lessons/bulk', {
        unit_id: targetUnitId,
        lessons: validLessons,
      })

      const count = res.data?.count || validLessons.length
      const unitName = res.data?.unit_name || units.find(u => u.id === targetUnitId)?.name || 'Unit'
      
      onToast(`Successfully uploaded ${count} lessons to "${unitName}"!`, 'success')
      onSuccess(count, targetUnitId)
      handleResetModal()
      onClose()
    } catch (err: unknown) {
      console.error('Failed to bulk upload lessons:', err)
      const errorMsg = (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data?.detail 
        || (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data?.error 
        || 'Bulk upload failed. Please try again.'
      onToast(errorMsg, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleResetModal = () => {
    setSelectedUnitOverride(null)
    setFile(null)
    setParsedRows([])
    setParseError(null)
    setFilterMode('all')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  const selectedUnitObj = units.find(u => u.id === targetUnitId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl space-y-6 my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Bulk Lesson CSV Uploader</span>
                <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  Batch
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload multiple video lessons at once from a CSV spreadsheet.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleResetModal()
              onClose()
            }}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          
          {/* Target Grade & Unit Selection */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Target Curriculum Unit *
                </label>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold">
                    📚 {gradeName || 'Selected Grade'}
                  </span>
                  <span className="text-slate-400">/</span>
                  <select
                    value={targetUnitId || ''}
                    onChange={(e) => setSelectedUnitOverride(Number(e.target.value) || null)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        📁 {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Template Download Button */}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 font-bold text-xs transition shrink-0 shadow-xs cursor-pointer active:scale-95"
                title="Download CSV format template"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV</span>
              </button>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]'
                : file
                ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                : 'border-slate-300 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleProcessFile(e.target.files[0])
                }
              }}
            />

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
              <Upload className="w-6 h-6" />
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>{file.name}</span>
                  <span className="text-slate-400 font-normal">({(file.size / 1024).toFixed(1)} KB)</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click or drag another file to replace.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Drop your CSV file here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Supports .csv with columns: <code className="font-mono text-indigo-500">title, drive_url, description, display_order</code>
                </p>
              </div>
            )}
          </div>

          {/* Parse Error Alert */}
          {parseError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Preview Parsed Lessons
                  </h4>
                  <span className="text-xs font-bold text-slate-400">({parsedRows.length} total)</span>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      filterMode === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    All ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('valid')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      filterMode === 'valid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Valid ({validCount})</span>
                  </button>
                  {errorCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterMode('errors')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                        filterMode === 'errors'
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                      }`}
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Errors ({errorCount})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 border-b border-slate-200 dark:border-white/10 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">#</th>
                      <th className="py-2 px-3 w-20">Status</th>
                      <th className="py-2 px-3">Title</th>
                      <th className="py-2 px-3">Google Drive Link</th>
                      <th className="py-2 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {displayedRows.map((r) => (
                      <tr
                        key={r.index}
                        className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] ${
                          !r.isValid ? 'bg-rose-500/[0.04]' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {r.index}
                        </td>
                        <td className="py-2 px-3">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Ready</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400" title={r.errorReason}>
                              <XCircle className="w-3 h-3" />
                              <span>{r.errorReason}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                          {r.title || <span className="text-rose-400 italic">Empty</span>}
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] max-w-[180px] truncate">
                          {r.drive_url ? (
                            <a
                              href={r.drive_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 hover:text-indigo-500 hover:underline"
                            >
                              <span className="truncate max-w-[150px]">{r.drive_url}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-rose-400 italic">Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px] max-w-[160px] truncate">
                          {r.description || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instructions Tip */}
              <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 dark:border-white/5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <p>
                  Rows with errors will be skipped automatically during upload. Display orders will automatically continue sequentially after existing lessons in <strong>{selectedUnitObj?.name || 'this unit'}</strong>.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {validCount > 0 ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {validCount} {validCount === 1 ? 'lesson' : 'lessons'} ready to upload
              </span>
            ) : (
              <span>Select a CSV file to proceed</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                handleResetModal()
                onClose()
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmUpload}
              disabled={validCount === 0 || uploading || !targetUnitId}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 ${
                validCount > 0 && !uploading && targetUnitId
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white shadow-indigo-600/25 active:scale-95 cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Uploading Lessons...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  <span>Upload {validCount} Lessons</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
