-- Supabase Migration: Add grade_id and grade_ids to profiles table
-- Description: Allows administrators to assign single or multiple curriculum grades to each student.

DO $$
BEGIN
    -- 1. Add grade_id column if not exists (for backwards compatibility / primary grade)
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'grade_id'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN grade_id INTEGER REFERENCES public.grades(id) ON DELETE SET NULL;
    END IF;

    -- 2. Add grade_ids column (array of integers for multiple grade assignments) if not exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'grade_ids'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN grade_ids INTEGER[] DEFAULT '{}';
    END IF;
END $$;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_grade_id ON public.profiles(grade_id);
CREATE INDEX IF NOT EXISTS idx_profiles_grade_ids ON public.profiles USING GIN(grade_ids);

-- 4. Create student_grades junction table for relational queries
CREATE TABLE IF NOT EXISTS public.student_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    grade_id INTEGER NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, grade_id)
);

CREATE INDEX IF NOT EXISTS idx_student_grades_student_id ON public.student_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_grade_id ON public.student_grades(grade_id);
