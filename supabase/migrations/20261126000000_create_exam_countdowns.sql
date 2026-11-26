CREATE TABLE IF NOT EXISTS public.exam_countdowns (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    exam_date TIMESTAMPTZ NOT NULL,
    duration TEXT NOT NULL,
    target_grade TEXT NOT NULL DEFAULT 'All Students',
    description TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT exam_countdowns_title_not_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT exam_countdowns_duration_not_empty CHECK (char_length(trim(duration)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_exam_countdowns_active_date
    ON public.exam_countdowns(is_active, exam_date);

ALTER TABLE public.exam_countdowns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active exam countdowns" ON public.exam_countdowns;
CREATE POLICY "Public can view active exam countdowns"
    ON public.exam_countdowns
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all exam countdowns" ON public.exam_countdowns;
CREATE POLICY "Admins can view all exam countdowns"
    ON public.exam_countdowns
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can insert exam countdowns" ON public.exam_countdowns;
CREATE POLICY "Admins can insert exam countdowns"
    ON public.exam_countdowns
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update exam countdowns" ON public.exam_countdowns;
CREATE POLICY "Admins can update exam countdowns"
    ON public.exam_countdowns
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

DROP POLICY IF EXISTS "Admins can delete exam countdowns" ON public.exam_countdowns;
CREATE POLICY "Admins can delete exam countdowns"
    ON public.exam_countdowns
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
        )
    );

INSERT INTO public.exam_countdowns
    (id, title, exam_date, duration, target_grade, description, is_active, created_at)
VALUES
    (1, 'G.C.E. O/L Examination 2026', '2026-12-08T03:00:00Z', '2 Hours', 'Grade 11',
     'National Ordinary Level General Examination for Information & Communication Technology.',
     true, '2026-10-21T00:00:00Z'),
    (2, 'G.C.E. A/L Examination 2027', '2027-08-01T03:00:00Z', '3 Hours', 'A/L',
     'National Advanced Level Information & Communication Technology Theory and Structured Examination.',
     true, '2026-10-21T00:00:00Z'),
    (3, 'G.C.E O/L Examination 2027', '2027-12-08T03:00:00Z', '2 Hours', 'Grade 11',
     'National Ordinary Level General Examination for Information & Communication Technology.',
     true, '2026-11-26T15:14:28.274Z')
ON CONFLICT (id) DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('public.exam_countdowns', 'id'),
    COALESCE((SELECT MAX(id) FROM public.exam_countdowns), 1),
    true
);
