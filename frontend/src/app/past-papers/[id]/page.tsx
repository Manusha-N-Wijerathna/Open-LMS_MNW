'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  FileText,
  Download,
  ExternalLink,
  ArrowLeft,
  Share2,
  Check,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from 'lucide-react'
import { PastPaper } from '@/lib/types/past-paper'
import {
  formatDriveEmbedUrl,
  formatDriveDownloadUrl,
  formatDriveOpenUrl,
} from '@/lib/drive'

export default function PublicPastPaperViewerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const id = resolvedParams.id

  const [paper, setPaper] = useState<PastPaper | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchPaper = async () => {
      try {
        const res = await axios.get(`/api/content/past-papers/${id}`)
        if (!isMounted) return
        setPaper(res.data.data)
      } catch (err: unknown) {
        if (!isMounted) return
        setNotFound(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPaper()
    return () => {
      isMounted = false
    }
  }, [id])

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Opening past paper...</p>
        </div>
      </div>
    )
  }

  if (notFound || !paper) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Past Paper Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This past paper does not exist, has been removed, or is currently unpublished.
          </p>
          <div className="pt-2">
            <Link
              href="/past-papers"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Past Papers Library</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const embedUrl = formatDriveEmbedUrl(paper.drive_file_id)
  const downloadUrl = formatDriveDownloadUrl(paper.drive_file_id)
  const driveOpenUrl = formatDriveOpenUrl(paper.drive_file_id)

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Breadcrumb & Title */}
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/past-papers"
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0 mt-0.5 sm:mt-0"
              title="Back to Papers Library"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <Link href="/past-papers" className="hover:underline">
                  Past Papers
                </Link>
                <span>/</span>
                <span className="text-indigo-600 dark:text-indigo-400">{paper.exam_type}</span>
                <span>/</span>
                <span>{paper.year}</span>
              </div>
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white line-clamp-1 sm:truncate">
                {paper.title}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 justify-between sm:justify-end flex-wrap pt-1 sm:pt-0 border-t border-slate-100 dark:border-slate-800/60 sm:border-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none">
              {/* Direct Download Button */}
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm shadow-indigo-600/20 active:scale-95"
                  title="Download PDF directly to your device"
                >
                  <Download className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Download PDF</span>
                </a>
              )}

              {/* Open in Drive Button */}
              {driveOpenUrl && (
                <a
                  href={driveOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition active:scale-95"
                  title="Open in Google Drive viewer"
                >
                  <span className="hidden sm:inline">Google Drive</span>
                  <span className="sm:hidden">Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Share Button */}
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition active:scale-95"
                title="Copy link to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
              </button>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Metadata Pills Sub-header */}
      <div className="bg-white/60 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/60 px-3 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 text-xs flex-nowrap sm:flex-wrap whitespace-nowrap">
          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] sm:text-xs">
            {paper.exam_type}
          </span>
          {paper.grade && (
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] sm:text-xs">
              {paper.grade}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] sm:text-xs">
            {paper.subject}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] sm:text-xs">
            Year {paper.year}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] sm:text-xs">
            {paper.medium} Medium
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] sm:text-xs">
            {paper.paper_type}
          </span>
        </div>
      </div>

      {/* PDF Viewer Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 flex flex-col">
        <div className="flex-1 min-h-[70vh] sm:min-h-[82vh] rounded-2xl bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative flex flex-col">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full flex-1 border-0"
              title={paper.title}
              allow="autoplay"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-600 mb-2" />
              <p className="text-base font-semibold text-white">Preview Unavailable</p>
              <p className="text-xs text-slate-400 max-w-md">
                Unable to load preview stream for this document. Use the download button above to access the PDF.
              </p>
            </div>
          )}

          {/* Bottom Fallback Bar */}
          <div className="px-3 sm:px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <span>
              If preview is blocked by third-party browser cookie restrictions, open directly:
            </span>
            <div className="flex items-center gap-3">
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download File</span>
                </a>
              )}
              {driveOpenUrl && (
                <a
                  href={driveOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open in Google Drive</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
