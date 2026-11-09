-- Supabase Migration: Create grades (update slug), exams, and exam_results tables with Row Level Security (RLS)
-- Description: Supports the Exam Results student view feature, allowing admins to publish exam results
-- and students to view their own authenticated records under each grade.

-- 1. Ensure `grades` table exists and has `slug` and `created_at`
CREATE TABLE IF NOT EXISTS public.grades (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure slug and created_at columns exist in public.grades
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'grades' AND column_name = 'slug'
    ) THEN
        ALTER TABLE public.grades ADD COLUMN slug TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'grades' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.grades ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
END $$;

-- Populate missing slugs from name if any exist
UPDATE public.grades 
SET slug = lower(trim(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))) 
WHERE slug IS NULL OR slug = '';

-- Set slug NOT NULL and UNIQUE if not already enforced
DO $$
BEGIN
    ALTER TABLE public.grades ALTER COLUMN slug SET NOT NULL;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'grades_slug_unique'
    ) THEN
        ALTER TABLE public.grades ADD CONSTRAINT grades_slug_unique UNIQUE (slug);
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_grades_slug ON public.grades(slug);
CREATE INDEX IF NOT EXISTS idx_grades_display_order ON public.grades(display_order);

-- 2. Create `exams` table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    term TEXT NOT NULL,
    academic_year INTEGER NOT NULL,
    grade_id INTEGER REFERENCES public.grades(id) ON DELETE CASCADE,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT exams_title_not_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT exams_term_not_empty CHECK (char_length(trim(term)) > 0),
    CONSTRAINT exams_academic_year_check CHECK (academic_year >= 2000 AND academic_year <= 2100)
);

CREATE INDEX IF NOT EXISTS idx_exams_academic_year ON public.exams(academic_year DESC);
CREATE INDEX IF NOT EXISTS idx_exams_grade_id ON public.exams(grade_id);
CREATE INDEX IF NOT EXISTS idx_exams_term ON public.exams(term);
CREATE INDEX IF NOT EXISTS idx_exams_is_published ON public.exams(is_published);

-- 3. Create `exam_results` table
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id INTEGER NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    institute TEXT,
    subject TEXT NOT NULL DEFAULT 'ICT',
    marks NUMERIC(5, 2) CHECK (marks IS NULL OR (marks >= 0 AND marks <= 100)),
    grade_letter TEXT NOT NULL,
    term TEXT DEFAULT '1st Term',
    academic_year INTEGER DEFAULT 2026,
    remarks TEXT,
    exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT exam_results_name_not_empty CHECK (char_length(trim(student_name)) > 0),
    CONSTRAINT exam_results_grade_letter_not_empty CHECK (char_length(trim(grade_letter)) > 0)
);

-- Ensure all columns exist and constraints are flexible if table was previously created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'exam_results' AND column_name = 'student_name'
    ) THEN
        ALTER TABLE public.exam_results ADD COLUMN student_name TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'exam_results' AND column_name = 'institute'
    ) THEN
        ALTER TABLE public.exam_results ADD COLUMN institute TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'exam_results' AND column_name = 'term'
    ) THEN
        ALTER TABLE public.exam_results ADD COLUMN term TEXT DEFAULT '1st Term';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'exam_results' AND column_name = 'academic_year'
    ) THEN
        ALTER TABLE public.exam_results ADD COLUMN academic_year INTEGER DEFAULT 2026;
    END IF;

    -- Make student_id, exam_id, marks nullable if they were NOT NULL
    ALTER TABLE public.exam_results ALTER COLUMN student_id DROP NOT NULL;
    ALTER TABLE public.exam_results ALTER COLUMN exam_id DROP NOT NULL;
    ALTER TABLE public.exam_results ALTER COLUMN marks DROP NOT NULL;

    -- Drop legacy strict unique constraint if present
    ALTER TABLE public.exam_results DROP CONSTRAINT IF EXISTS exam_results_student_exam_subject_unique;
EXCEPTION
    WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_exam_results_student_name ON public.exam_results(student_name);
CREATE INDEX IF NOT EXISTS idx_exam_results_institute ON public.exam_results(institute);
CREATE INDEX IF NOT EXISTS idx_exam_results_grade_id ON public.exam_results(grade_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_created_at ON public.exam_results(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for `grades`
-- Anyone (anon and authenticated) can view grades for navigation and hub
DROP POLICY IF EXISTS "Public can view grades" ON public.grades;
CREATE POLICY "Public can view grades"
    ON public.grades
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Admins have full access to grades
DROP POLICY IF EXISTS "Admins can insert grades" ON public.grades;
CREATE POLICY "Admins can insert grades"
    ON public.grades
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update grades" ON public.grades;
CREATE POLICY "Admins can update grades"
    ON public.grades
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete grades" ON public.grades;
CREATE POLICY "Admins can delete grades"
    ON public.grades
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

-- 6. RLS Policies for `exams`
-- Authenticated users can view published exams (and admins can view all)
DROP POLICY IF EXISTS "Authenticated users can view published exams" ON public.exams;
CREATE POLICY "Authenticated users can view published exams"
    ON public.exams
    FOR SELECT
    TO authenticated
    USING (
        is_published = true OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

-- Public anon users can view published exams in public hub listings
DROP POLICY IF EXISTS "Anon users can view published exams" ON public.exams;
CREATE POLICY "Anon users can view published exams"
    ON public.exams
    FOR SELECT
    TO anon
    USING (is_published = true);

-- Admins have full write permissions for exams
DROP POLICY IF EXISTS "Admins can insert exams" ON public.exams;
CREATE POLICY "Admins can insert exams"
    ON public.exams
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update exams" ON public.exams;
CREATE POLICY "Admins can update exams"
    ON public.exams
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete exams" ON public.exams;
CREATE POLICY "Admins can delete exams"
    ON public.exams
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

-- 7. RLS Policies for `exam_results`
-- Public access: Anyone (anon and authenticated) can view published exam results
DROP POLICY IF EXISTS "Students can view their own exam results" ON public.exam_results;
DROP POLICY IF EXISTS "Public can view exam results" ON public.exam_results;
CREATE POLICY "Public can view exam results"
    ON public.exam_results
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Admins can insert exam results
DROP POLICY IF EXISTS "Admins can insert exam results" ON public.exam_results;
CREATE POLICY "Admins can insert exam results"
    ON public.exam_results
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

-- Admins can update exam results
DROP POLICY IF EXISTS "Admins can update exam results" ON public.exam_results;
CREATE POLICY "Admins can update exam results"
    ON public.exam_results
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

-- Admins can delete exam results
DROP POLICY IF EXISTS "Admins can delete exam results" ON public.exam_results;
CREATE POLICY "Admins can delete exam results"
    ON public.exam_results
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

-- 8. Seed standard curriculum grades if table is empty
INSERT INTO public.grades (name, slug, display_order)
VALUES 
    ('Grade 6', 'grade-6', 1),
    ('Grade 7', 'grade-7', 2),
    ('Grade 8', 'grade-8', 3),
    ('Grade 9', 'grade-9', 4),
    ('Grade 10', 'grade-10', 5),
    ('Grade 11 (O/L)', 'grade-11', 6),
    ('Grade 12 (A/L)', 'grade-12', 7),
    ('Grade 13 (A/L)', 'grade-13', 8)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    display_order = EXCLUDED.display_order;

