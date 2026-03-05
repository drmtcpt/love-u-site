-- c:\Users\Ali\Desktop\Love u\supabase_calendar.sql

-- 1. Создаем таблицу для событий календаря
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  date date NOT NULL, -- Формат YYYY-MM-DD
  created_at timestamptz DEFAULT now()
);

-- 2. Включаем защиту (RLS)
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- 3. Создаем правила доступа (чтобы каждый видел и менял только свои события)
CREATE POLICY "Users can view own calendar_events" ON public.calendar_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar_events" ON public.calendar_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar_events" ON public.calendar_events
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar_events" ON public.calendar_events
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
