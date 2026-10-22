-- Supabase Migration: Create past_papers table with constraints, indexes, and RLS policies
-- Description: Stores metadata and Google Drive file IDs for past papers. PDF binaries remain hosted on Google Drive.

-- 1. Create past_papers table
CREATE TABLE IF NOT EXISTS public.past_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    grade TEXT,
    subject TEXT NOT NULL,
    year INTEGER NOT NULL,
    medium TEXT NOT NULL,
    paper_type TEXT NOT NULL,
    drive_file_id TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT past_papers_title_not_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT past_papers_drive_file_id_not_empty CHECK (char_length(trim(drive_file_id)) > 0),
    CONSTRAINT past_papers_year_check CHECK (year >= 1990 AND year <= 2100)
);

-- 2. Indexes for optimal filtering, search, and sorting
CREATE INDEX IF NOT EXISTS idx_past_papers_is_published ON public.past_papers(is_published);
CREATE INDEX IF NOT EXISTS idx_past_papers_year ON public.past_papers(year DESC);
CREATE INDEX IF NOT EXISTS idx_past_papers_subject ON public.past_papers(subject);
CREATE INDEX IF NOT EXISTS idx_past_papers_exam_type ON public.past_papers(exam_type);
CREATE INDEX IF NOT EXISTS idx_past_papers_published_lookup ON public.past_papers(is_published, exam_type, year DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.past_papers ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Public (anonymous and authenticated) can SELECT published past papers only
DROP POLICY IF EXISTS "Public can view published past papers" ON public.past_papers;
CREATE POLICY "Public can view published past papers"
    ON public.past_papers
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

-- Admins can view all past papers including unpublished drafts
DROP POLICY IF EXISTS "Admins can view all past papers" ON public.past_papers;
CREATE POLICY "Admins can view all past papers"
    ON public.past_papers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can create past papers
DROP POLICY IF EXISTS "Admins can insert past papers" ON public.past_papers;
CREATE POLICY "Admins can insert past papers"
    ON public.past_papers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can update past papers (including toggling is_published)
DROP POLICY IF EXISTS "Admins can update past papers" ON public.past_papers;
CREATE POLICY "Admins can update past papers"
    ON public.past_papers
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can delete past papers
DROP POLICY IF EXISTS "Admins can delete past papers" ON public.past_papers;
CREATE POLICY "Admins can delete past papers"
    ON public.past_papers
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
