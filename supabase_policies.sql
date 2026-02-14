-- Вставь этот код в Supabase SQL Editor и нажми RUN

-- 1. Убедимся, что таблица существует (на всякий случай)
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  path text NOT NULL,
  filename text,
  created_at timestamptz DEFAULT now()
);

-- 2. Включаем защиту (RLS) для таблицы photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Политика: Разрешить пользователям видеть ТОЛЬКО свои записи
CREATE POLICY "Users can view own photos" ON public.photos
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Политика: Разрешить пользователям добавлять записи (только за себя)
CREATE POLICY "Users can insert own photos" ON public.photos
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Политика: Разрешить удалять свои записи
CREATE POLICY "Users can delete own photos" ON public.photos
FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- 3. Политики для Хранилища (Storage)

-- Разрешить загрузку в бакет 'photos', если папка совпадает с ID пользователя
CREATE POLICY "Allow authenticated uploads to photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Разрешить просмотр файлов в бакете 'photos' (своих)
CREATE POLICY "Allow authenticated downloads from photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Разрешить прослушивание музыки из бакета 'Music' (всем авторизованным)
CREATE POLICY "Allow authenticated to read Music" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'Music');